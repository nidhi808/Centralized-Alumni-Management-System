import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userRole, loading, userStatus } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if they are logged in but wrong role
        if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (userRole === 'student') return <Navigate to="/student-dashboard" replace />;
        if (userRole === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
        if (userRole === 'alumni') return <Navigate to="/alumni/portal" replace />;
        return <Navigate to="/" replace />;
    }

    // Special verification check for alumni
    if (userRole === 'alumni' && userStatus === 'pending') {
        // Allow access ONLY to the verification page if pending
        if (location.pathname !== '/alumni/verification') {
            return <Navigate to="/alumni/verification" replace />;
        }
    } else if (userRole === 'alumni' && userStatus !== 'pending' && location.pathname === '/alumni/verification') {
        // If approved, don't let them stay on the verification page
        return <Navigate to="/alumni/portal" replace />;
    }

    // Special verification check for student hub
    if (userRole === 'student' && userStatus === 'pending_admin_approval') {
        if (location.pathname !== '/student/waiting-room') {
            return <Navigate to="/student/waiting-room" replace />;
        }
    } else if (userRole === 'student' && userStatus !== 'pending_admin_approval' && location.pathname === '/student/waiting-room') {
        return <Navigate to="/student-dashboard" replace />;
    }

    return children;
}
