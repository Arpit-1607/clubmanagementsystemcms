import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function StudentRegistrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [regs, setRegs] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: regData } = await supabase.from('event_registrations').select('*').eq('user_id', user.id).order('registered_at', { ascending: false });
    setRegs(regData || []);
    const eventIds = [...new Set((regData || []).map(r => r.event_id))];
    if (eventIds.length > 0) {
      const { data: evData } = await supabase.from('events').select('*').in('id', eventIds);
      const em: Record<string, any> = {};
      (evData || []).forEach(e => { em[e.id] = e; });
      setEvents(em);
    }
  };

  useEffect(() => { load(); }, [user]);

  const cancelReg = async (regId: string) => {
    setLoading(regId);
    const { error } = await supabase.from('event_registrations').update({ cancelled: true }).eq('id', regId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Cancelled' }); await load(); }
    setLoading(null);
  };

  return (
    <DashboardLayout variant="student">
      <div className="space-y-4 max-w-2xl">
        {regs.length === 0 && <p className="text-center text-muted-foreground py-12">No registrations yet.</p>}
        {regs.map((reg, i) => {
          const ev = events[reg.event_id];
          return (
            <motion.div key={reg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10"><Calendar className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{ev?.title || 'Event'}</h4>
                    <p className="text-xs text-muted-foreground">{ev ? new Date(ev.event_date).toLocaleDateString() : ''} · {ev?.venue || 'TBA'}</p>
                  </div>
                  {reg.cancelled ? (
                    <Badge variant="secondary" className="gap-1"><XCircle className="w-3 h-3" />Cancelled</Badge>
                  ) : (
                    <>
                      <Badge className="bg-success/10 text-success border-0 gap-1"><CheckCircle className="w-3 h-3" />Registered</Badge>
                      {ev && ev.event_date >= new Date().toISOString() && (
                        <Button variant="ghost" size="sm" onClick={() => cancelReg(reg.id)} disabled={loading === reg.id}>Cancel</Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
