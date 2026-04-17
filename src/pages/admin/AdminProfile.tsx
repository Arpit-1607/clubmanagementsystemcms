import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Save, CheckCircle } from 'lucide-react';

export default function AdminProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName((profile as any)?.full_name || '');
      setUsername((profile as any)?.username || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!username.trim() || username === (profile as any)?.username) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .neq('user_id', user?.id || '')
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, profile, user]);

  const handleSave = async () => {
    if (!user) return;
    if (username.trim() && usernameAvailable === false) {
      toast({ title: 'Username taken', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName.trim() || null,
      username: username.trim().toLowerCase() || null,
      email: email.trim() || null,
    }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout variant="admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Admin Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <Label>Username</Label>
                <div className="relative">
                  <Input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} placeholder="Choose a unique username" />
                  {username.trim() && username !== (profile as any)?.username && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      {checkingUsername ? '...' : usernameAvailable ? (
                        <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                      ) : (
                        <span className="text-destructive">Taken</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@college.edu" />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
