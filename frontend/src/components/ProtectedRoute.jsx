import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          {/* Inner pulsating glow */}
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/10 border-t-purple-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <p className="text-gray-400 text-sm tracking-wider animate-pulse">VERIFYING QUANTUM KEY...</p>
      </div>
    );
  }

  if (!user) {
    // If it's an admin route, redirect to /admin/login
    const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
    return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the permission, redirect to appropriate home
    return <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;
