import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkeletonCard } from '@/components/SkeletonCard';
import { staggerContainer, staggerItem, hoverLift, pressDown } from '@/lib/motion';
import { Search, Users, UserPlus, UserMinus } from 'lucide-react';

export default function StudentClubs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const load = async () => {
    const { data: clubsData } = await supabase.from('clubs').select('*').order('name');
    setClubs(clubsData || []);
    if (user) {
      const { data: memberships } = await supabase.from('club_members').select('club_id').eq('user_id', user.id);
      setMyMemberships(new Set((memberships || []).map(m => m.club_id)));
    }
    const { data: members } = await supabase.from('club_members').select('club_id');
    const counts: Record<string, number> = {};
    (members || []).forEach(m => { counts[m.club_id] = (counts[m.club_id] || 0) + 1; });
    setMemberCounts(counts);
    setPageLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const joinClub = async (clubId: string) => {
    if (!user) return;
    setLoading(clubId);
    const { error } = await supabase.from('club_members').insert({ club_id: clubId, user_id: user.id, approved: true });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Joined club!' }); await load(); }
    setLoading(null);
  };

  const leaveClub = async (clubId: string) => {
    if (!user) return;
    setLoading(clubId);
    const { error } = await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Left club' }); await load(); }
    setLoading(null);
  };

  const filtered = clubs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const categoryColors: Record<string, string> = { technical: 'bg-primary/10 text-primary', cultural: 'bg-accent/10 text-accent-foreground', sports: 'bg-teal/10 text-teal', literary: 'bg-warning/10 text-warning' };

  return (
    <DashboardLayout variant="student">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clubs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 focus-ring" />
          </div>
        </div>

        {pageLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((club) => (
              <motion.div key={club.id} variants={staggerItem} whileHover={hoverLift} whileTap={pressDown}>
                <Card className="glass-card h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-teal/15 flex items-center justify-center text-xl font-bold text-primary border border-primary/10">
                        {club.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{club.name}</h3>
                        <Badge variant="secondary" className={`text-xs mt-1 ${categoryColors[club.category] || ''}`}>{club.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{memberCounts[club.id] || 0} members</span>
                      {myMemberships.has(club.id) ? (
                        <Button variant="outline" size="sm" onClick={() => leaveClub(club.id)} disabled={loading === club.id} className="transition-all duration-200">
                          <UserMinus className="w-3 h-3 mr-1" />Leave
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => joinClub(club.id)} disabled={loading === club.id} className="transition-all duration-200">
                          <UserPlus className="w-3 h-3 mr-1" />Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!pageLoading && filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No clubs found.</p>}
      </div>
    </DashboardLayout>
  );
}
