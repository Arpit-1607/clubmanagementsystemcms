import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const load = async () => {
    const [payRes, evRes, profRes] = await Promise.all([
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('id, title'),
      supabase.from('profiles').select('*'),
    ]);
    setPayments(payRes.data || []);
    const em: Record<string, any> = {};
    (evRes.data || []).forEach(e => { em[e.id] = e; });
    setEvents(em);
    const pm: Record<string, any> = {};
    (profRes.data || []).forEach(p => { pm[p.user_id] = p; });
    setProfiles(pm);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (paymentId: string, status: 'verified' | 'rejected') => {
    const { error } = await supabase.from('payments').update({ status, reviewed_by: user?.id }).eq('id', paymentId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: `Payment ${status}` }); await load(); }
  };

  const statusConfig: Record<string, { icon: any; color: string }> = {
    pending: { icon: Clock, color: 'bg-warning/10 text-warning' },
    verified: { icon: CheckCircle, color: 'bg-success/10 text-success' },
    rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive' },
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Payment Verification</h2>
        {payments.length === 0 && <p className="text-center text-muted-foreground py-12">No payments to review.</p>}
        {payments.map(p => {
          const sc = statusConfig[p.status];
          const prof = profiles[p.user_id];
          return (
            <Card key={p.id} className="glass-card">
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <div className="p-2 rounded-lg bg-primary/10"><CreditCard className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{events[p.event_id]?.title || 'Event'}</p>
                  <p className="text-xs text-muted-foreground">{prof?.nickname || 'User'} · ₹{p.amount} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                {p.receipt_url && <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">View Receipt</a>}
                <Badge className={`gap-1 ${sc.color} border-0`}><sc.icon className="w-3 h-3" />{p.status}</Badge>
                {p.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-success" onClick={() => updateStatus(p.id, 'verified')}>Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(p.id, 'rejected')}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
