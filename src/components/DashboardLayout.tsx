import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { slideInLeft, fadeIn } from '@/lib/motion';
import {
  LayoutDashboard, Users, Calendar, Bell, CreditCard, BarChart3,
  LogOut, Menu, X, ChevronRight, GraduationCap, User
} from 'lucide-react';

interface NavItem { label: string; path: string; icon: any; }

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'Clubs', path: '/student/clubs', icon: Users },
  { label: 'Events', path: '/student/events', icon: Calendar },
  { label: 'Announcements', path: '/student/announcements', icon: Bell },
  { label: 'My Registrations', path: '/student/registrations', icon: CreditCard },
  { label: 'My Profile', path: '/student/profile', icon: User },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Clubs', path: '/admin/clubs', icon: Users },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Announcements', path: '/admin/announcements', icon: Bell },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'My Profile', path: '/admin/profile', icon: User },
];

export default function DashboardLayout({ children, variant }: { children: ReactNode; variant: 'student' | 'admin' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const nav = variant === 'student' ? studentNav : adminNav;

  const handleLogout = async () => {
    await signOut();
    toast({ title: 'Logged out successfully' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-teal">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-foreground tracking-tight">CMS</span>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="mt-3 p-2.5 rounded-xl bg-secondary/50 border border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-teal/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{(profile as any)?.username || (profile as any)?.full_name || profile?.nickname || profile?.email || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {(profile as any)?.enrollment_no || profile?.email || ''}
                </p>
              </div>
            </div>
          </div>
          <span className="inline-block mt-2.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold capitalize">{variant === 'student' ? '🎓 Student' : '🛡️ Admin'}</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/20"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {active && <ChevronRight className="w-3 h-3 ml-auto relative z-10" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
          <h2 className="font-bold text-foreground text-lg">{nav.find(n => n.path === location.pathname)?.label || 'Dashboard'}</h2>
          <div className="ml-auto flex items-center gap-2">
            {(profile as any)?.branch && (
              <span className="hidden md:inline text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border/50">
                {(profile as any)?.branch} · {(profile as any)?.year}
              </span>
            )}
          </div>
        </header>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          className="p-4 lg:p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
