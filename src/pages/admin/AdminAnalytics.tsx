import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, CreditCard } from 'lucide-react';

export default function AdminAnalytics() {
  const [clubData, setClubData] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, registrations: 0 });

  useEffect(() => {
    const load = async () => {
      const [clubs, members, events, regs, payments] = await Promise.all([
        supabase.from('clubs').select('id, name, category'),
        supabase.from('club_members').select('club_id'),
        supabase.from('events').select('id, title, club_id'),
        supabase.from('event_registrations').select('event_id').eq('cancelled', false),
        supabase.from('payments').select('amount, status').eq('status', 'verified'),
      ]);

      // Club member counts
      const memberMap: Record<string, number> = {};
      (members.data || []).forEach(m => { memberMap[m.club_id] = (memberMap[m.club_id] || 0) + 1; });
      setClubData((clubs.data || []).map(c => ({ name: c.name, members: memberMap[c.id] || 0, category: c.category })));

      // Event reg counts
      const regMap: Record<string, number> = {};
      (regs.data || []).forEach(r => { regMap[r.event_id] = (regMap[r.event_id] || 0) + 1; });
      setEventData((events.data || []).slice(0, 10).map(e => ({ name: e.title.slice(0, 15), registrations: regMap[e.id] || 0 })));

      const totalRev = (payments.data || []).reduce((sum, p) => sum + p.amount, 0);
      setTotals({ revenue: totalRev, registrations: (regs.data || []).length });
    };
    load();
  }, []);

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(168, 76%, 50%)', 'hsl(48, 96%, 53%)', 'hsl(38, 92%, 50%)'];

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Analytics Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10"><CreditCard className="w-6 h-6 text-success" /></div>
              <div><p className="text-2xl font-bold text-foreground">₹{totals.revenue}</p><p className="text-sm text-muted-foreground">Total Revenue</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal/10"><TrendingUp className="w-6 h-6 text-teal" /></div>
              <div><p className="text-2xl font-bold text-foreground">{totals.registrations}</p><p className="text-sm text-muted-foreground">Total Registrations</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Members by Club</CardTitle></CardHeader>
            <CardContent>
              {clubData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clubData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="members" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Category Distribution</CardTitle></CardHeader>
            <CardContent>
              {clubData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={(() => {
                      const cats: Record<string, number> = {};
                      clubData.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
                      return Object.entries(cats).map(([name, value]) => ({ name, value }));
                    })()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {clubData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
            </CardContent>
          </Card>
        </div>

        {eventData.length > 0 && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Event Registrations</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="registrations" fill="hsl(168, 76%, 50%)" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
