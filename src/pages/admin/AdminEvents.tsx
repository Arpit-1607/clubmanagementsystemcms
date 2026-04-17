import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkeletonCard } from '@/components/SkeletonCard';
import { staggerContainer, staggerItem, hoverLift, pressDown } from '@/lib/motion';
import { Plus, Calendar, MapPin, Ticket, Trash2, IndianRupee } from 'lucide-react';

export default function AdminEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', club_id: '', event_date: '', venue: '', registration_limit: '', fee: '' });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const load = async () => {
    const [evRes, clubRes, regRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('clubs').select('id, name'),
      supabase.from('event_registrations').select('event_id').eq('cancelled', false),
    ]);
    setEvents(evRes.data || []);
    setClubs(clubRes.data || []);
    const cn: Record<string, string> = {};
    (clubRes.data || []).forEach(c => { cn[c.id] = c.name; });
    setClubNames(cn);
    const rc: Record<string, number> = {};
    (regRes.data || []).forEach(r => { rc[r.event_id] = (rc[r.event_id] || 0) + 1; });
    setRegCounts(rc);
    setPageLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createEvent = async () => {
    if (!form.title.trim() || !form.club_id || !form.event_date) {
      toast({ title: 'Fill required fields', variant: 'destructive' }); return;
    }
    setLoading(true);
    const { error } = await supabase.from('events').insert({
      title: form.title, description: form.description, club_id: form.club_id,
      event_date: new Date(form.event_date).toISOString(), venue: form.venue,
      registration_limit: form.registration_limit ? parseInt(form.registration_limit) : null,
      fee: form.fee ? parseFloat(form.fee) : 0, created_by: user?.id,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Event created!' }); setOpen(false); setForm({ title: '', description: '', club_id: '', event_date: '', venue: '', registration_limit: '', fee: '' }); await load(); }
    setLoading(false);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Event deleted' }); await load(); }
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Manage Events</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button><Plus className="w-4 h-4 mr-2" />Create Event</Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" className="focus-ring" /></div>
                <div><Label>Club *</Label>
                  <Select value={form.club_id} onValueChange={v => setForm(f => ({ ...f, club_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger>
                    <SelectContent>{clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date & Time *</Label><Input type="datetime-local" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className="focus-ring" /></div>
                <div><Label>Venue</Label><Input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Event venue" className="focus-ring" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Max Registrations</Label><Input type="number" value={form.registration_limit} onChange={e => setForm(f => ({ ...f, registration_limit: e.target.value }))} placeholder="Unlimited" className="focus-ring" /></div>
                  <div><Label>Fee (₹)</Label><Input type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="0 = Free" className="focus-ring" /></div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event..." className="focus-ring" /></div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button className="w-full h-11" onClick={createEvent} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Creating...</span>
                    ) : 'Create Event'}
                  </Button>
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {pageLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(ev => (
              <motion.div key={ev.id} variants={staggerItem} whileHover={hoverLift}>
                <Card className="glass-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{ev.title}</h3>
                      <Button variant="ghost" size="icon" onClick={() => deleteEvent(ev.id)} className="hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ev.event_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue || 'TBA'}</span>
                      <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{regCounts[ev.id] || 0} registered</span>
                      {ev.fee > 0 && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{ev.fee}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{clubNames[ev.club_id] || ''}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!pageLoading && events.length === 0 && <p className="text-center text-muted-foreground py-12">No events yet.</p>}
      </div>
    </DashboardLayout>
  );
}
