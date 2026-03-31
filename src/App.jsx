import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import LoginSelector from './pages/LoginSelector';
import RoleLogin from './pages/RoleLogin';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import StudentWaitingRoom from './pages/student/StudentWaitingRoom';
import StudentEvents from './pages/student/StudentEvents';
import StudentChat from './pages/student/StudentChat';
import StudentHelpdesk from './pages/student/StudentHelpdesk';
import StudentProfile from './pages/student/StudentProfile';
import StudentAlumniNetwork from './pages/student/StudentAlumniNetwork';
import AlumniHome from './pages/alumni/AlumniDashboard'; // Using the new dashboard
import AlumniVerification from './pages/alumni/AlumniVerification';
import AlumniDonation from './pages/AlumniDonation';
import AlumniMentorship from './pages/alumni/AlumniMentorship';
import AlumniChat from './pages/alumni/AlumniChat';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniEvents from './pages/alumni/AlumniEvents';
import AlumniNetwork from './pages/alumni/AlumniDirectory';
import AlumniJobs from './pages/alumni/AlumniJobs';

// Faculty Dashboard Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyEvents from './pages/faculty/FacultyEvents';
import FacultyAnnouncements from './pages/faculty/FacultyAnnouncements';
import FacultyJobs from './pages/faculty/FacultyJobs';
import FacultyAlumniDirectory from './pages/faculty/FacultyAlumniDirectory';
import FacultyChatHub from './pages/faculty/FacultyChatHub';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultySettings from './pages/faculty/FacultySettings';
import FacultyDonation from './pages/faculty/FacultyDonation';

// Admin Panel Pages (lazy loaded for performance)
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminJobApproval  = lazy(() => import('./pages/admin/AdminJobApproval'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminEvents       = lazy(() => import('./pages/admin/AdminEvents'));
const AdminInbox        = lazy(() => import('./pages/admin/AdminInbox'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSuccessFeed  = lazy(() => import('./pages/admin/AdminSuccessFeed'));
const AdminDonations    = lazy(() => import('./pages/admin/AdminDonations'));
const AdminHelpdesk     = lazy(() => import('./pages/admin/AdminHelpdesk'));
const AdminSettings     = lazy(() => import('./pages/admin/AdminSettings'));

function AdminLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full animate-spin border-4 border-[#086490]/20"
          style={{ borderTopColor: '#086490' }}
        />
        <p className="text-sm font-semibold text-[#086490]">Loading Admin Panel...</p>
      </div>
    </div>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={<AdminLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<LoginSelector />} />
              <Route path="/login/:role" element={<RoleLogin />} />

              {/* Student */}
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={['student']}><StudentHome /></ProtectedRoute>
              } />
              <Route path="/student/waiting-room" element={
                <ProtectedRoute allowedRoles={['student']}><StudentWaitingRoom /></ProtectedRoute>
              } />
              <Route path="/student/events" element={
                <ProtectedRoute allowedRoles={['student']}><StudentEvents /></ProtectedRoute>
              } />
              <Route path="/student/chat" element={
                <ProtectedRoute allowedRoles={['student']}><StudentChat /></ProtectedRoute>
              } />
              <Route path="/student/network" element={
                <ProtectedRoute allowedRoles={['student']}><StudentAlumniNetwork /></ProtectedRoute>
              } />
              <Route path="/student/helpdesk" element={
                <ProtectedRoute allowedRoles={['student']}><StudentHelpdesk /></ProtectedRoute>
              } />
              <Route path="/student/profile" element={
                <ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>
              } />

              {/* Faculty redirects + routes */}
              <Route path="/faculty-dashboard" element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="/faculty/dashboard"     element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/faculty/events"        element={<ProtectedRoute allowedRoles={['faculty']}><FacultyEvents /></ProtectedRoute>} />
              <Route path="/faculty/announcements" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyAnnouncements /></ProtectedRoute>} />
              <Route path="/faculty/jobs"          element={<ProtectedRoute allowedRoles={['faculty']}><FacultyJobs /></ProtectedRoute>} />
              <Route path="/faculty/alumni"        element={<ProtectedRoute allowedRoles={['faculty']}><FacultyAlumniDirectory /></ProtectedRoute>} />
              <Route path="/faculty/chat"          element={<ProtectedRoute allowedRoles={['faculty']}><FacultyChatHub /></ProtectedRoute>} />
              <Route path="/faculty/profile"       element={<ProtectedRoute allowedRoles={['faculty']}><FacultyProfile /></ProtectedRoute>} />
              <Route path="/faculty/settings"      element={<ProtectedRoute allowedRoles={['faculty']}><FacultySettings /></ProtectedRoute>} />
              <Route path="/faculty/donate"        element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDonation /></ProtectedRoute>} />

              {/* Alumni */}
              <Route path="/alumni-dashboard" element={<Navigate to="/alumni/portal" replace />} />
              <Route path="/alumni/portal" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniHome /></ProtectedRoute>
              } />
              <Route path="/alumni/verification" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniVerification /></ProtectedRoute>
              } />
              <Route path="/alumni/donate" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniDonation /></ProtectedRoute>
              } />
              <Route path="/alumni/mentorship" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniMentorship /></ProtectedRoute>
              } />
              <Route path="/alumni/chat" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniChat /></ProtectedRoute>
              } />
              <Route path="/alumni/profile" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniProfile /></ProtectedRoute>
              } />
              <Route path="/alumni/events" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniEvents /></ProtectedRoute>
              } />
              <Route path="/alumni/network" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniNetwork /></ProtectedRoute>
              } />
              <Route path="/alumni/jobs" element={
                <ProtectedRoute allowedRoles={['alumni']}><AlumniJobs /></ProtectedRoute>
              } />

              {/* Admin redirect + routes */}
              <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard"    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/jobs"         element={<AdminRoute><AdminJobApproval /></AdminRoute>} />
              <Route path="/admin/users"        element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/analytics"    element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="/admin/events"       element={<AdminRoute><AdminEvents /></AdminRoute>} />
              <Route path="/admin/inbox"        element={<AdminRoute><AdminInbox /></AdminRoute>} />
              <Route path="/admin/helpdesk"     element={<AdminRoute><AdminHelpdesk /></AdminRoute>} />
              <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
              <Route path="/admin/success-feed" element={<AdminRoute><AdminSuccessFeed /></AdminRoute>} />
              <Route path="/admin/donations"    element={<AdminRoute><AdminDonations /></AdminRoute>} />
              <Route path="/admin/settings"     element={<AdminRoute><AdminSettings /></AdminRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
