import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { Users } from 'lucide-react';

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [memRes, clubRes, profRes] = await Promise.all([
      supabase.from('club_members').select('*').order('joined_at', { ascending: false }),
      supabase.from('clubs').select('id, name'),
      supabase.from('profiles').select('*'),
    ]);
    setMembers(memRes.data || []);
    const cm: Record<string, string> = {};
    (clubRes.data || []).forEach(c => { cm[c.id] = c.name; });
    setClubs(cm);
    const pm: Record<string, any> = {};
    (profRes.data || []).forEach(p => { pm[p.user_id] = p; });
    setProfiles(pm);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (memberId: string, role: string) => {
    const { error } = await supabase.from('club_members').update({ role: role as any }).eq('id', memberId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Role updated' }); await load(); }
  };

  const toggleApproval = async (memberId: string, currentApproved: boolean) => {
    const { error } = await supabase.from('club_members').update({ approved: !currentApproved }).eq('id', memberId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: currentApproved ? 'Approval revoked' : 'Member approved' }); await load(); }
  };

  const roleColors: Record<string, string> = { member: 'bg-secondary', volunteer: 'bg-teal/10 text-teal', event_coordinator: 'bg-primary/10 text-primary', core_team: 'bg-accent/10 text-accent-foreground', admin: 'bg-warning/10 text-warning' };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Manage Members ({members.length})</h2>
        {loading ? (
          <div className="space-y-3">
            {[0,1,2,3].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded skeleton-shimmer" />
                  <div className="h-3 w-60 rounded skeleton-shimmer" />
                </div>
                <div className="h-6 w-20 rounded skeleton-shimmer" />
                <div className="h-9 w-36 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No members yet.</p>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {members.map(m => {
              const prof = profiles[m.user_id];
              return (
                <motion.div key={m.id} variants={staggerItem}>
                  <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                      <div className="p-2 rounded-lg bg-primary/10"><Users className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{prof?.full_name || prof?.username || prof?.nickname || prof?.email || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{clubs[m.club_id] || 'Unknown'} · Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${roleColors[m.role] || ''}`}
                        onClick={() => toggleApproval(m.id, m.approved)}
                      >
                        {m.approved ? '✓ Approved' : '⏳ Pending'}
                      </Badge>
                      <Select value={m.role} onValueChange={v => updateRole(m.id, v)}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="event_coordinator">Event Coordinator</SelectItem>
                          <SelectItem value="core_team">Core Team</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
