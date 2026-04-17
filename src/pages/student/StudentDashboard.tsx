import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { SkeletonStatCard, SkeletonCard } from '@/components/SkeletonCard';
import { staggerContainer, staggerItem, hoverLift, tapScale } from '@/lib/motion';
import { Users, Calendar, Bell, ArrowRight, Ticket, User, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ clubs: 0, events: 0, announcements: 0, myClubs: 0, myRegs: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [clubsRes, eventsRes, annRes, myClubsRes, myRegsRes, recentAnnRes] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date').limit(5),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        user ? supabase.from('club_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id) : Promise.resolve({ count: 0 }),
        user ? supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('cancelled', false) : Promise.resolve({ count: 0 }),
        supabase.from('announcements').select('*, clubs:club_id(name)').order('created_at', { ascending: false }).limit(3),
      ]);
      setStats({
        clubs: clubsRes.count || 0,
        events: eventsRes.data?.length || 0,
        announcements: annRes.count || 0,
        myClubs: (myClubsRes as any).count || 0,
        myRegs: (myRegsRes as any).count || 0,
      });
      setUpcomingEvents(eventsRes.data || []);
      setRecentAnnouncements(recentAnnRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const statCards = [
    { label: 'Active Clubs', value: stats.clubs, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'My Clubs', value: stats.myClubs, icon: BookOpen, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Upcoming Events', value: stats.events, icon: Calendar, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { label: 'My Registrations', value: stats.myRegs, icon: Ticket, color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <DashboardLayout variant="student">
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-teal/5 to-transparent border border-primary/10"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
              className="p-3 rounded-xl bg-primary/10"
            >
              <GraduationCap className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Welcome, {(profile as any)?.username || (profile as any)?.full_name || profile?.nickname || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here's what's happening on campus today.</p>
              {(profile as any)?.enrollment_no && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{(profile as any)?.enrollment_no}</Badge>
                  {(profile as any)?.branch && <Badge variant="secondary" className="text-xs">{(profile as any)?.branch}</Badge>}
                  {(profile as any)?.year && <Badge variant="secondary" className="text-xs">{(profile as any)?.year}</Badge>}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {statCards.map((s) => (
              <motion.div key={s.label} variants={staggerItem} whileHover={hoverLift} whileTap={tapScale}>
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                    <div>
                      <AnimatedNumber value={s.value} className="text-2xl font-extrabold text-foreground" />
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">Upcoming Events</CardTitle>
                <Link to="/student/events"><Button variant="ghost" size="sm" className="text-xs group">View All <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" /></Button></Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No upcoming events.</p>
                ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                    {upcomingEvents.map((ev) => (
                      <motion.div key={ev.id} variants={staggerItem}
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 cursor-default">
                        <div className="p-2 rounded-lg bg-primary/10"><Calendar className="w-4 h-4 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ev.venue || 'TBA'}</p>
                        </div>
                        {ev.fee > 0 && <Badge className="bg-accent/20 text-accent-foreground border-0 text-xs">₹{ev.fee}</Badge>}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Announcements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">Recent Announcements</CardTitle>
                <Link to="/student/announcements"><Button variant="ghost" size="sm" className="text-xs group">View All <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" /></Button></Link>
              </CardHeader>
              <CardContent>
                {recentAnnouncements.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No announcements yet.</p>
                ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                    {recentAnnouncements.map((ann) => (
                      <motion.div key={ann.id} variants={staggerItem}
                        className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 cursor-default">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">{(ann as any).clubs?.name || 'Club'}</span>
                        </div>
                        <p className="font-semibold text-sm text-foreground">{ann.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ann.content}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
