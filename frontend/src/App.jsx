import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import JobListings from './pages/JobListings';
import ApplyJob from './pages/ApplyJob';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import AdminCandidates from './pages/AdminCandidates';
import GlassCard from './components/GlassCard';
import { Sparkles, Shield, ArrowRight, Brain } from 'lucide-react';

// Futuristic Landing page / Home
const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 relative">
      <div className="max-w-4xl text-center space-y-8 relative z-10 py-12">
        {/* Glow Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-glow mx-auto animate-pulse">
          <Brain className="w-3.5 h-3.5" />
          <span>Next-Generation ATS Screening</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans leading-none">
            Hire Smarter with <span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 bg-clip-text text-transparent text-glow">AURA AI</span>
          </h1>
        </div>

        {/* Selection portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
          {/* Candidate Portal */}
          <GlassCard className="text-left space-y-4 border-purple-500/10">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Candidate Portal</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Explore active job roles, upload your resume for immediate AI screening, and track your application matching details in real-time.
            </p>
            <Link
              to="/jobs"
              className="glow-btn inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-glow"
            >
              <span>Browse Open Positions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </GlassCard>

          {/* Admin Control Center */}
          <GlassCard className="text-left space-y-4 border-cyan-500/10">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Admin Terminal</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Publish vacancies, filter applicants by minimum AI score thresholds, preview uploaded PDF resumes, and update recruitment status sheets.
            </p>
            <Link
              to="/admin/login"
              className="glow-btn inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2.5 rounded-xl transition-all shadow-glow"
            >
              <span>Access Control Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* USER PANEL ROUTES */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
          <Route path="/jobs" element={<><Navbar /><JobListings /></>} />
          
          {/* Protected Candidate Routes */}
          <Route
            path="/apply/:jobId"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Navbar />
                <ApplyJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ADMIN PANEL ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCandidates />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
