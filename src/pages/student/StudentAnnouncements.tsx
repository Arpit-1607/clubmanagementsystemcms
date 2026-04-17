import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { Bell, Clock } from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [annRes, clubRes] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('clubs').select('id, name'),
      ]);
      setAnnouncements(annRes.data || []);
      const cm: Record<string, string> = {};
      (clubRes.data || []).forEach(c => { cm[c.id] = c.name; });
      setClubs(cm);
      setLoading(false);
    };
    load();

    const channel = supabase.channel('announcements-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <DashboardLayout variant="student">
      <div className="space-y-4 max-w-2xl">
        {loading ? (
          <div className="space-y-4">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded skeleton-shimmer" />
                    <div className="h-3 w-full rounded skeleton-shimmer" />
                    <div className="h-3 w-4/5 rounded skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No announcements yet.</p>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {announcements.map((ann) => (
              <motion.div key={ann.id} variants={staggerItem}>
                <Card className="glass-card">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5"><Bell className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{clubs[ann.club_id] || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                        {ann.image_url && <img src={ann.image_url} alt="" className="mt-3 rounded-lg max-h-64 object-cover" />}
                      </div>
                    </div>
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
