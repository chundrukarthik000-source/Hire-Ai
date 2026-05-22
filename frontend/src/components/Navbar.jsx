import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { LogOut, User, Briefcase, LayoutDashboard, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-glow">
              <span className="font-extrabold text-white text-lg tracking-wider">H</span>
            </div>
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent group-hover:text-purple-400 transition-colors">
              HIRE<span className="text-cyan-400">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/jobs"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                isActive('/jobs') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Jobs</span>
            </Link>

            {user && user.role === 'candidate' && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400">Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/5">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/30">
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-200 truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-xl transition-all shadow-glow hover:scale-[1.02] cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/5 bg-slate-950/95 py-3 px-4 space-y-3">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Explore Jobs</span>
          </Link>

          {user && user.role === 'candidate' && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>My Dashboard</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="border-t border-white/5 pt-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                    {user.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">{user.displayName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-gray-300 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-white/5 hover:bg-white/5 text-sm font-medium text-gray-300 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white rounded-xl transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
