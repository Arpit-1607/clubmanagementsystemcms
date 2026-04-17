import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Calendar, Bell, Sparkles, ArrowRight, Trophy, Zap, Shield,
  GraduationCap, Rocket, Code2, BookOpen, Compass, Cpu, Star, ChevronDown,
  Github, Twitter, Linkedin, Mail, Quote,
} from 'lucide-react';
import { staggerContainer, staggerItem, hoverLift, tapScale, slideUp } from '@/lib/motion';

const FEATURES = [
  { icon: Users, title: 'Club Management', desc: 'Create, organize, and grow communities with role-based access for members, coordinators, and admins.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Calendar, title: 'Event Handling', desc: 'Plan events, manage registrations, track payments, and view live status — all in one place.', color: 'text-teal', bg: 'bg-teal/10' },
  { icon: Bell, title: 'Smart Announcements', desc: 'Broadcast updates with priority tags. Members get real-time, filtered feeds.', color: 'text-warning', bg: 'bg-warning/10' },
  { icon: Shield, title: 'Secure by Default', desc: 'Row-level security, role-based access, and encrypted authentication out of the box.', color: 'text-success', bg: 'bg-success/10' },
  { icon: Sparkles, title: 'AI-Assisted Workflows', desc: 'Auto-generate event descriptions, summarize discussions, and recommend clubs.', color: 'text-accent-foreground', bg: 'bg-accent/10' },
  { icon: Trophy, title: 'Public Analytics', desc: 'Transparent metrics on participation, growth, and engagement across campus.', color: 'text-primary', bg: 'bg-primary/10' },
];

const CLUBS = [
  { name: 'Hindi Samiti', icon: BookOpen, gradient: 'from-rose-500/20 to-amber-500/20', tag: 'Cultural' },
  { name: 'AI Club', icon: Cpu, gradient: 'from-blue-500/20 to-purple-500/20', tag: 'Technical' },
  { name: 'Heritage & Tour', icon: Compass, gradient: 'from-emerald-500/20 to-teal-500/20', tag: 'Cultural' },
  { name: 'Mathematics Club', icon: Sparkles, gradient: 'from-indigo-500/20 to-cyan-500/20', tag: 'Academic' },
  { name: 'Career Catalyst', icon: Rocket, gradient: 'from-orange-500/20 to-red-500/20', tag: 'Career' },
  { name: 'Digital Learning', icon: GraduationCap, gradient: 'from-violet-500/20 to-fuchsia-500/20', tag: 'Academic' },
  { name: 'Software Dev Club', icon: Code2, gradient: 'from-sky-500/20 to-blue-500/20', tag: 'Technical' },
];

const TESTIMONIALS = [
  { name: 'Aarav S.', role: 'Club Coordinator', text: 'CMS made running our tech fest seamless. Registrations, payments, announcements — all one click away.', rating: 5 },
  { name: 'Priya K.', role: 'Student Member', text: 'I discovered three new clubs in a week. The recommendations and clean UI are unmatched.', rating: 5 },
  { name: 'Rohan M.', role: 'Admin', text: 'Verifying members and payments used to take hours. Now it\'s minutes. The analytics are a bonus.', rating: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({ clubs: 7, events: 0, members: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const [c, e, m] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('club_members').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ clubs: c.count || 7, events: e.count || 0, members: m.count || 0 });
    })();
  }, []);

  const goAuth = () => {
    if (user && profile) navigate(profile.role === 'club_admin' ? '/admin' : '/student');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Sticky Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">CMS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Clubs', href: '#clubs' },
              { label: 'Events', href: '#events' },
              { label: 'Reviews', href: '#testimonials' },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {l.label}
                <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button size="sm" onClick={goAuth} className="gradient-primary text-primary-foreground shadow-md hover:shadow-lg">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 -right-20 w-[32rem] h-[32rem] rounded-full bg-teal/30 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-accent/30 blur-3xl"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            Built for modern campus communities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            Where <span className="text-gradient">clubs</span>, events,
            <br className="hidden sm:block" /> and students <span className="text-gradient">connect</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            A unified platform to discover clubs, manage events, broadcast announcements, and grow vibrant
            student communities — all with secure, role-based access.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button size="lg" onClick={goAuth} className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl group h-12 px-7">
              Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('clubs')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-7">
              Explore Clubs
            </Button>
            <Button size="lg" variant="ghost" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-7">
              View Events
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: 'Active Clubs', value: stats.clubs },
              { label: 'Events Hosted', value: stats.events },
              { label: 'Members', value: stats.members },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="text-2xl sm:text-4xl font-bold text-gradient">{s.value}+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-16 flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Everything your campus needs</h2>
            <p className="mt-4 text-muted-foreground">
              From discovery to administration — a complete toolkit for thriving student organizations.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={staggerItem} whileHover={hoverLift}>
                <Card className="glass-card h-full group cursor-default">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section id="clubs" className="py-20 sm:py-28 bg-secondary/30 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              Featured Clubs
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Find your community</h2>
            <p className="mt-4 text-muted-foreground">Seven active clubs spanning culture, technology, and beyond.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {CLUBS.map((c) => (
              <motion.div key={c.name} variants={staggerItem} whileHover={hoverLift} whileTap={tapScale}>
                <Card className="glass-card h-full cursor-pointer group overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardContent className="p-5 relative">
                    <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center mb-3 group-hover:border-primary/40 transition-colors">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{c.tag}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Button onClick={goAuth} variant="outline" size="lg" className="group">
              Join a Club <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works / Events teaser */}
      <section id="events" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium mb-4">
                Events
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Run events that <span className="text-gradient">just work</span>.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Create events in seconds, accept registrations, verify payments via screenshots, and broadcast updates —
                all tracked in a single elegant dashboard.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Live, upcoming, and completed status tracking',
                  'Manual payment verification workflow',
                  'Registration limits & nickname display',
                  'Real-time announcements and notifications',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={goAuth} className="mt-8 gradient-primary text-primary-foreground shadow-md hover:shadow-lg">
                Explore the Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-teal/20 blur-2xl rounded-3xl" />
              <Card className="glass-card relative overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {[
                    { title: 'AI Hackathon 2026', tag: 'Live', tagBg: 'bg-success/15 text-success', club: 'AI Club' },
                    { title: 'Heritage Walk – Old City', tag: 'Upcoming', tagBg: 'bg-primary/15 text-primary', club: 'Heritage & Tour' },
                    { title: 'Math Olympiad Prep', tag: 'Upcoming', tagBg: 'bg-warning/15 text-warning', club: 'Mathematics Club' },
                    { title: 'Resume Workshop', tag: 'Completed', tagBg: 'bg-muted text-muted-foreground', club: 'Career Catalyst' },
                  ].map((e, i) => (
                    <motion.div
                      key={e.title}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{e.title}</div>
                        <div className="text-xs text-muted-foreground">{e.club}</div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${e.tagBg} flex-shrink-0 ml-3`}>
                        {e.tag}
                      </span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium mb-4">
              Loved by campus
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">What people say</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={staggerItem} whileHover={hoverLift}>
                <Card className="glass-card h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-3" />
                    <p className="text-sm leading-relaxed text-foreground/90">{t.text}</p>
                    <div className="flex items-center gap-1 mt-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden gradient-primary p-10 sm:p-16 text-center text-primary-foreground shadow-2xl"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Ready to bring your campus together?</h2>
              <p className="mt-4 text-base sm:text-lg opacity-90 max-w-xl mx-auto">
                Join the Club Management System today and transform how your community connects.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={goAuth} variant="secondary" className="h-12 px-7 shadow-lg">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button size="lg" onClick={() => navigate('/login')} variant="outline" className="h-12 px-7 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">CMS</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                A unified platform connecting clubs, events, and students across campus.
              </p>
              <div className="flex gap-3 mt-5">
                {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#clubs" className="hover:text-foreground transition-colors">Clubs</a></li>
                <li><a href="#events" className="hover:text-foreground transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
                <li><button onClick={goAuth} className="hover:text-foreground transition-colors">Get Started</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Club Management System. Built for campus communities.
          </div>
        </div>
      </footer>
    </div>
  );
}
