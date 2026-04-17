import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Users } from 'lucide-react';

export default function AdminClubs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'technical' as any });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('clubs').select('*').order('name');
    setClubs(data || []);
    const { data: members } = await supabase.from('club_members').select('club_id');
    const counts: Record<string, number> = {};
    (members || []).forEach(m => { counts[m.club_id] = (counts[m.club_id] || 0) + 1; });
    setMemberCounts(counts);
  };

  useEffect(() => { load(); }, []);

  const createClub = async () => {
    if (!form.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await supabase.from('clubs').insert({ name: form.name, description: form.description, category: form.category, created_by: user?.id });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Club created!' }); setOpen(false); setForm({ name: '', description: '', category: 'technical' }); await load(); }
    setLoading(false);
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Manage Clubs</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Club</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Club</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Club Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Coding Club" /></div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="technical">Technical</SelectItem><SelectItem value="cultural">Cultural</SelectItem><SelectItem value="sports">Sports</SelectItem><SelectItem value="literary">Literary</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the club..." /></div>
                <Button className="w-full" onClick={createClub} disabled={loading}>{loading ? 'Creating...' : 'Create Club'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <Card key={club.id} className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{club.name[0]}</div>
                  <div><h3 className="font-semibold text-foreground">{club.name}</h3><span className="text-xs text-muted-foreground capitalize">{club.category}</span></div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{club.description || 'No description'}</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{memberCounts[club.id] || 0} members</span>
              </CardContent>
            </Card>
          ))}
        </div>
        {clubs.length === 0 && <p className="text-center text-muted-foreground py-12">No clubs yet. Create your first one!</p>}
      </div>
    </DashboardLayout>
  );
}
