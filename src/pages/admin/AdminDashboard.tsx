import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { SkeletonStatCard } from '@/components/SkeletonCard';
import { staggerContainer, staggerItem, hoverLift, tapScale } from '@/lib/motion';
import { Users, Calendar, Bell, CreditCard } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clubs: 0, members: 0, events: 0, payments: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [c, m, e, p, a] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('club_members').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ clubs: c.count || 0, members: m.count || 0, events: e.count || 0, payments: p.count || 0, announcements: a.count || 0 });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Clubs', value: stats.clubs, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Members', value: stats.members, icon: Users, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Total Events', value: stats.events, icon: Calendar, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { label: 'Payments', value: stats.payments, icon: CreditCard, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Announcements', value: stats.announcements, icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your club management system.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[0,1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((s) => (
              <motion.div key={s.label} variants={staggerItem} whileHover={hoverLift} whileTap={tapScale}>
                <Card className="glass-card">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-xl ${s.bg} mb-2`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                    <AnimatedNumber value={s.value} className="text-2xl font-bold text-foreground" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
