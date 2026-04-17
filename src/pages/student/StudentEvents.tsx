import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkeletonCard } from '@/components/SkeletonCard';
import { staggerContainer, staggerItem, hoverLift, pressDown } from '@/lib/motion';
import { Calendar, MapPin, Ticket, IndianRupee } from 'lucide-react';

export default function StudentEvents() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Record<string, string>>({});
  const [myRegs, setMyRegs] = useState<Set<string>>(new Set());
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const load = async () => {
    const [evRes, clubRes, regRes, regCountRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('clubs').select('id, name'),
      user ? supabase.from('event_registrations').select('event_id').eq('user_id', user.id).eq('cancelled', false) : Promise.resolve({ data: [] }),
      supabase.from('event_registrations').select('event_id').eq('cancelled', false),
    ]);
    setEvents(evRes.data || []);
    const cm: Record<string, string> = {};
    (clubRes.data || []).forEach(c => { cm[c.id] = c.name; });
    setClubs(cm);
    setMyRegs(new Set((regRes.data || []).map(r => r.event_id)));
    const rc: Record<string, number> = {};
    (regCountRes.data || []).forEach(r => { rc[r.event_id] = (rc[r.event_id] || 0) + 1; });
    setRegCounts(rc);
    setPageLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const register = async (eventId: string) => {
    if (!user) return;
    setLoading(eventId);
    const { error } = await supabase.from('event_registrations').insert({ event_id: eventId, user_id: user.id, nickname: profile?.nickname });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Registered successfully!' }); await load(); }
    setLoading(null);
  };

  const cancel = async (eventId: string) => {
    if (!user) return;
    setLoading(eventId);
    const { error } = await supabase.from('event_registrations').update({ cancelled: true }).eq('event_id', eventId).eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Registration cancelled' }); await load(); }
    setLoading(null);
  };

  const now = new Date().toISOString();
  const upcoming = events.filter(e => e.event_date >= now);
  const past = events.filter(e => e.event_date < now);

  const EventCard = ({ ev }: { ev: any }) => (
    <motion.div variants={staggerItem} whileHover={hoverLift} whileTap={pressDown}>
      <Card className="glass-card h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">{ev.title}</h3>
            {ev.fee > 0 && <Badge className="bg-accent/20 text-accent-foreground border-0"><IndianRupee className="w-3 h-3" />{ev.fee}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ev.description || 'No description'}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ev.event_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue || 'TBA'}</span>
            <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{regCounts[ev.id] || 0}{ev.registration_limit ? `/${ev.registration_limit}` : ''}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{clubs[ev.club_id] || 'Unknown Club'}</span>
            {ev.event_date >= now && (
              myRegs.has(ev.id) ? (
                <Button variant="outline" size="sm" onClick={() => cancel(ev.id)} disabled={loading === ev.id} className="transition-all duration-200">Cancel</Button>
              ) : (
                <Button size="sm" onClick={() => register(ev.id)} disabled={loading === ev.id} className="transition-all duration-200">Register</Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout variant="student">
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="past">Past</TabsTrigger></TabsList>
        <TabsContent value="upcoming">
          {pageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((ev) => <EventCard key={ev.id} ev={ev} />)}
            </motion.div>
          )}
          {!pageLoading && upcoming.length === 0 && <p className="text-center text-muted-foreground py-12">No upcoming events.</p>}
        </TabsContent>
        <TabsContent value="past">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {past.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </motion.div>
          {past.length === 0 && <p className="text-center text-muted-foreground py-12">No past events.</p>}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
