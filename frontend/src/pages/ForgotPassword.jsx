import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import GlassCard from '../components/GlassCard';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please input your email.");
      return;
    }
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setMessage("A password recovery link has been dispatched to your email inbox.");
    } catch (err) {
      setError(err.message || "Failed to trigger password recovery. Check your email spelling.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <GlassCard className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Recover your access credentials
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs rounded-xl">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full glow-btn flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-glow hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Sending Link..." : "Request Reset"}</span>
            </button>
          </form>

          <p className="text-center text-xs">
            <Link to="/login" className="inline-flex items-center space-x-1.5 text-purple-400 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
