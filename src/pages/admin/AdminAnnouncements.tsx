import { useEffect, useState } from 'react';
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
import { Plus, Bell, Trash2, Clock } from 'lucide-react';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', club_id: '', target: 'all' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [annRes, clubRes] = await Promise.all([
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('clubs').select('id, name'),
    ]);
    setAnnouncements(annRes.data || []);
    setClubs(clubRes.data || []);
    const cn: Record<string, string> = {};
    (clubRes.data || []).forEach(c => { cn[c.id] = c.name; });
    setClubNames(cn);
  };

  useEffect(() => { load(); }, []);

  const createAnnouncement = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.club_id) {
      toast({ title: 'Fill all required fields', variant: 'destructive' }); return;
    }
    setLoading(true);
    const { error } = await supabase.from('announcements').insert({ title: form.title, content: form.content, club_id: form.club_id, target: form.target, created_by: user?.id });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Announcement published!' }); setOpen(false); setForm({ title: '', content: '', club_id: '', target: 'all' }); await load(); }
    setLoading(false);
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); await load(); }
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Announcements</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Announcement</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" /></div>
                <div><Label>Club *</Label>
                  <Select value={form.club_id} onValueChange={v => setForm(f => ({ ...f, club_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger>
                    <SelectContent>{clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Target</Label>
                  <Select value={form.target} onValueChange={v => setForm(f => ({ ...f, target: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Students</SelectItem><SelectItem value="club_members">Club Members Only</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Content *</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your announcement..." rows={4} /></div>
                <Button className="w-full" onClick={createAnnouncement} disabled={loading}>{loading ? 'Publishing...' : 'Publish Announcement'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {announcements.length === 0 && <p className="text-center text-muted-foreground py-12">No announcements yet.</p>}
        {announcements.map(ann => (
          <Card key={ann.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{ann.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{ann.content}</p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{clubNames[ann.club_id] || ''}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ann.created_at).toLocaleDateString()}</span>
                <span>Target: {ann.target}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
