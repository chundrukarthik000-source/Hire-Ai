import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import GlassCard from '../components/GlassCard';
import { Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';

export const AdminLogin = () => {
  const { login, isMock } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hiringagent.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Provide admin email and credentials.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'admin') {
        setError("Your account does not possess admin access credentials.");
        setSubmitting(false);
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || "Authentication failed. Validate email/password.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back link */}
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Candidate Sign In</span>
        </button>

        <GlassCard className="border border-cyan-500/10 shadow-glow">
          {/* Header */}
          <div className="text-center pb-4">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              Admin Portal
            </h2>
            <p className="mt-1.5 text-xs text-cyan-400/80 font-mono tracking-wider">
              AURA SECURITY GATEWAY
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm border-cyan-500/20 focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm border-cyan-500/20 focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full glow-btn flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-xl font-bold text-sm transition-all shadow-glow hover:scale-[1.01] cursor-pointer"
            >
              <span>{submitting ? "AUTHORIZING..." : "ACCESS SYSTEMS"}</span>
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminLogin;
