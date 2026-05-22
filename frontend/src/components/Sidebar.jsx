import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { LayoutDashboard, Briefcase, Users, LogOut, ArrowLeft, Shield } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Analytics Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Manage Jobs',
      path: '/admin/jobs',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      name: 'Applicant Tracker',
      path: '/admin/candidates',
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-slate-950/80 backdrop-blur-md flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Title Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Shield className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest font-mono">Control Center</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to User Panel</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
