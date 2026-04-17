import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import Landing from "@/pages/Landing";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentClubs from "@/pages/student/StudentClubs";
import StudentEvents from "@/pages/student/StudentEvents";
import StudentAnnouncements from "@/pages/student/StudentAnnouncements";
import StudentRegistrations from "@/pages/student/StudentRegistrations";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClubs from "@/pages/admin/AdminClubs";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import StudentProfile from "@/pages/student/StudentProfile";
import AdminProfile from "@/pages/admin/AdminProfile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'student' | 'club_admin' }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/clubs" element={<ProtectedRoute requiredRole="student"><StudentClubs /></ProtectedRoute>} />
              <Route path="/student/events" element={<ProtectedRoute requiredRole="student"><StudentEvents /></ProtectedRoute>} />
              <Route path="/student/announcements" element={<ProtectedRoute requiredRole="student"><StudentAnnouncements /></ProtectedRoute>} />
              <Route path="/student/registrations" element={<ProtectedRoute requiredRole="student"><StudentRegistrations /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="club_admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/clubs" element={<ProtectedRoute requiredRole="club_admin"><AdminClubs /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute requiredRole="club_admin"><AdminEvents /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute requiredRole="club_admin"><AdminMembers /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute requiredRole="club_admin"><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="club_admin"><AdminAnnouncements /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="club_admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute requiredRole="club_admin"><AdminProfile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
