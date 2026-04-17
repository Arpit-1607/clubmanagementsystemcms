import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, ArrowRight, KeyRound, GraduationCap, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { signIn, signUp, createProfile, assignRole, generateNickname, STUDENT_ACCESS_CODE, ADMIN_ACCESS_CODE } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

type Role = null | 'student' | 'admin';
type AuthMode = 'login' | 'signup';
type StudentStep = 'code' | 'auth';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function LoginPage() {
  const [role, setRole] = useState<Role>(null);
  const [accessCode, setAccessCode] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  // Shared auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Student registration details (only for signup)
  const [studentStep, setStudentStep] = useState<StudentStep>('code');
  const [studentName, setStudentName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkUsername = async (uname: string) => {
    if (!uname.trim()) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    const { data } = await supabase.from('profiles').select('id').eq('username', uname.trim().toLowerCase()).maybeSingle();
    setUsernameAvailable(!data);
    setCheckingUsername(false);
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/\s/g, '');
    setStudentUsername(clean);
    setUsernameAvailable(null);
    if (clean.trim()) {
      setTimeout(() => checkUsername(clean), 500);
    }
  };

  const handleCodeCheck = (requiredCode: string) => {
    if (accessCode !== requiredCode) {
      toast({ title: 'Invalid access code', description: 'Please enter the correct access code.', variant: 'destructive' });
      return;
    }
    setCodeVerified(true);
  };

  const handleStudentAuth = async () => {
    if (authMode === 'login') {
      setLoading(true);
      try {
        const { user } = await signIn(email, password);
        if (user) {
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate('/student');
        }
      } catch (e: any) {
        toast({ title: 'Sign In Error', description: e.message, variant: 'destructive' });
      } finally { setLoading(false); }
      return;
    }

    // Signup validation
    if (!studentName.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    if (!studentUsername.trim()) { toast({ title: 'Username required', variant: 'destructive' }); return; }
    if (usernameAvailable === false) { toast({ title: 'Username taken', variant: 'destructive' }); return; }
    if (!enrollmentNo.trim()) { toast({ title: 'Enrollment No. required', variant: 'destructive' }); return; }
    if (!branch.trim()) { toast({ title: 'Branch required', variant: 'destructive' }); return; }
    if (!year) { toast({ title: 'Year required', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const { user } = await signUp(email, password);
      if (user) {
        const nickname = generateNickname();
        await createProfile(user.id, nickname, 'student', email);
        await assignRole(user.id, 'student');
        await supabase.from('profiles').update({
          full_name: studentName,
          enrollment_no: enrollmentNo,
          branch: branch.trim(),
          year,
          username: studentUsername.trim().toLowerCase(),
        }).eq('user_id', user.id);
        toast({ title: `Welcome, ${studentName}!`, description: 'Your account has been created successfully.' });
        navigate('/student');
      }
    } catch (e: any) {
      toast({ title: 'Registration Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleAdminAuth = async () => {
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { user } = await signUp(email, password);
        if (user) {
          await createProfile(user.id, email.split('@')[0], 'club_admin', email);
          await assignRole(user.id, 'club_admin');
          toast({ title: 'Admin account created!', description: 'Welcome to the Club Admin Dashboard.' });
          navigate('/admin');
        }
      } else {
        const { user } = await signIn(email, password);
        if (user) {
          await createProfile(user.id, email.split('@')[0], 'club_admin', email);
          toast({ title: 'Welcome back!', description: 'Signed in as Club Admin.' });
          navigate('/admin');
        }
      }
    } catch (e: any) {
      toast({ title: 'Authentication Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const resetState = () => {
    setRole(null); setAccessCode(''); setCodeVerified(false);
    setStudentStep('code'); setAuthMode('login');
    setStudentName(''); setEmail(''); setPassword('');
    setEnrollmentNo(''); setBranch(''); setYear('');
    setStudentUsername(''); setUsernameAvailable(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--teal)/0.06),transparent_50%)]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-teal rounded-full blur-3xl"
        />
      </div>
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal shadow-xl shadow-primary/20 mb-4"
          >
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
            className="text-3xl font-extrabold text-foreground tracking-tight">Club Management System</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-muted-foreground mt-2 text-sm">Smart platform for managing campus clubs and events</motion.p>
        </div>

        <AnimatePresence mode="wait">
          {/* Role Selection */}
          {!role && (
            <motion.div key="role-select" initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -8 }} transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}>
              <Card className="glass-card">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Choose Your Role</CardTitle>
                  <CardDescription>Select how you want to access the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                    <Button variant="outline" className="w-full h-20 justify-start gap-4 text-left border-2 hover:border-teal/40 hover:bg-teal/5 transition-all duration-200" onClick={() => setRole('student')}>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal/20 to-teal/5"><Users className="w-6 h-6 text-teal" /></div>
                      <div className="flex-1"><div className="font-bold text-foreground text-base">Student Member</div><div className="text-sm text-muted-foreground">Browse clubs, join events, track registrations</div></div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                    <Button variant="outline" className="w-full h-20 justify-start gap-4 text-left border-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200" onClick={() => setRole('admin')}>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5"><Shield className="w-6 h-6 text-primary" /></div>
                      <div className="flex-1"><div className="font-bold text-foreground text-base">Club Admin</div><div className="text-sm text-muted-foreground">Manage clubs, create events, verify payments</div></div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-center mt-4 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">
                  <KeyRound className="w-3 h-3 inline mr-1" />
                  Student: <span className="font-mono font-bold text-primary">CLUB2026</span> · Admin: <span className="font-mono font-bold text-primary">ADMIN2026</span>
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Student Auth */}
          {role === 'student' && (
            <motion.div key="student" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-teal" /> Student {authMode === 'login' ? 'Sign In' : 'Registration'}</CardTitle>
                  <CardDescription>
                    {!codeVerified ? 'Enter your campus access code to continue' : authMode === 'login' ? 'Sign in to your student account' : 'Create your student account'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!codeVerified ? (
                      <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div>
                          <Label>Access Code</Label>
                          <Input placeholder="Enter access code" value={accessCode} onChange={e => setAccessCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCodeCheck(STUDENT_ACCESS_CODE)} className="focus-ring" />
                        </div>
                        <Button className="w-full gradient-primary text-primary-foreground" onClick={() => handleCodeCheck(STUDENT_ACCESS_CODE)}>
                          Verify Code <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="auth-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Auth mode toggle */}
                        <div className="flex rounded-xl bg-secondary p-1 gap-1 relative">
                          <button onClick={() => setAuthMode('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative z-10 ${authMode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            <LogIn className="w-4 h-4" /> Sign In
                          </button>
                          <button onClick={() => setAuthMode('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative z-10 ${authMode === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            <UserPlus className="w-4 h-4" /> Register
                          </button>
                          <motion.div
                            layoutId="auth-tab-student"
                            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-sm"
                            style={{ width: 'calc(50% - 4px)', left: authMode === 'login' ? '4px' : 'calc(50% + 0px)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        </div>

                        <div>
                          <Label>Email *</Label>
                          <Input type="email" placeholder="student@college.edu" value={email} onChange={e => setEmail(e.target.value)} className="focus-ring" />
                        </div>
                        <div>
                          <Label>Password *</Label>
                          <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && authMode === 'login' && handleStudentAuth()} className="focus-ring" />
                        </div>

                        <AnimatePresence>
                          {authMode === 'signup' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
                              className="space-y-4 overflow-hidden"
                            >
                              <div>
                                <Label>Full Name *</Label>
                                <Input placeholder="Enter your full name" value={studentName} onChange={e => setStudentName(e.target.value)} className="focus-ring" />
                              </div>
                              <div>
                                <Label>Username *</Label>
                                <div className="relative">
                                  <Input placeholder="Choose a unique username" value={studentUsername} onChange={e => handleUsernameChange(e.target.value)} className="focus-ring" />
                                  {studentUsername.trim() && (
                                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                                      {checkingUsername ? (
                                        <span className="text-muted-foreground">
                                          <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin inline-block" />
                                        </span>
                                      ) : usernameAvailable ? (
                                        <span className="text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                                      ) : usernameAvailable === false ? (
                                        <span className="text-destructive">Taken</span>
                                      ) : null}
                                    </motion.span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label>Enrollment No. *</Label>
                                <Input placeholder="e.g., 2024CS001" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} className="focus-ring" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Branch *</Label>
                                  <Input placeholder="e.g., Computer Science" value={branch} onChange={e => setBranch(e.target.value)} className="focus-ring" />
                                </div>
                                <div>
                                  <Label>Year *</Label>
                                  <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button className="w-full gradient-primary text-primary-foreground h-11" onClick={handleStudentAuth} disabled={loading}>
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Please wait...
                              </span>
                            ) : authMode === 'login' ? 'Sign In' : 'Create Account'}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground transition-colors" onClick={resetState}>← Back</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Admin Auth */}
          {role === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Club Admin {authMode === 'login' ? 'Sign In' : 'Registration'}</CardTitle>
                  <CardDescription>{!codeVerified ? 'Enter admin access code first' : authMode === 'login' ? 'Sign in to your admin account' : 'Create a new admin account'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!codeVerified ? (
                      <motion.div key="admin-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div><Label>Admin Access Code</Label><Input placeholder="Enter admin code" value={accessCode} onChange={e => setAccessCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCodeCheck(ADMIN_ACCESS_CODE)} className="focus-ring" /></div>
                        <Button className="w-full" onClick={() => handleCodeCheck(ADMIN_ACCESS_CODE)}>Verify Code <ArrowRight className="w-4 h-4 ml-2" /></Button>
                      </motion.div>
                    ) : (
                      <motion.div key="admin-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex rounded-xl bg-secondary p-1 gap-1 relative">
                          <button onClick={() => setAuthMode('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative z-10 ${authMode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            <LogIn className="w-4 h-4" /> Sign In
                          </button>
                          <button onClick={() => setAuthMode('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative z-10 ${authMode === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            <UserPlus className="w-4 h-4" /> Register
                          </button>
                          <motion.div
                            layoutId="auth-tab-admin"
                            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-sm"
                            style={{ width: 'calc(50% - 4px)', left: authMode === 'login' ? '4px' : 'calc(50% + 0px)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        </div>
                        <div><Label>Email</Label><Input type="email" placeholder="admin@college.edu" value={email} onChange={e => setEmail(e.target.value)} className="focus-ring" /></div>
                        <div><Label>Password</Label><Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminAuth()} className="focus-ring" /></div>
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button className="w-full h-11" onClick={handleAdminAuth} disabled={loading}>
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Please wait...
                              </span>
                            ) : authMode === 'login' ? 'Sign In' : 'Create Account'}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground transition-colors" onClick={resetState}>← Back</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
