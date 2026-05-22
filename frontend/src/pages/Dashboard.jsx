import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import GlassCard from '../components/GlassCard';
import { Briefcase, ArrowRight, Sparkles, Plus, AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Users, Award } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/my');
        // Sort by appliedAt descending
        const sorted = response.data.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(sorted);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch applications. Confirm API is online.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const toggleExpand = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-800/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Shortlisted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/30 text-red-400 border border-red-800/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/30 text-amber-400 border border-amber-800/30">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  };

  const totalApps = applications.length;
  const shortlistedApps = applications.filter(app => app.status === 'shortlisted').length;
  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((sum, app) => sum + (app.aiAnalysis?.resumeScore || 0), 0) / applications.length)
    : 0;

  const statCards = [
    {
      title: 'TOTAL APPLICATIONS',
      value: totalApps,
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10',
      borderColor: 'border-t-cyan-500',
      desc: 'Active job submissions',
    },
    {
      title: 'SHORTLISTED APPLICATIONS',
      value: shortlistedApps,
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10',
      borderColor: 'border-t-emerald-500',
      desc: 'Status: shortlisted',
    },
    {
      title: 'AVERAGE MATCH SCORE',
      value: `${avgScore}%`,
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/10',
      borderColor: 'border-t-purple-500',
      desc: 'AI evaluation ranking',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            {getGreeting()}, {user?.displayName || 'Candidate'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium tracking-wide">
            Here's your professional tracking overview for {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <Link
          to="/jobs"
          className="glow-btn inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-glow hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Explore Jobs</span>
        </Link>
      </div>

      {/* Metric Cards Grid matching the requested style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <GlassCard key={idx} hoverEffect={true} delay={idx * 0.05} className={`p-5 border-t-4 ${card.borderColor}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-4 ${card.iconBg} rounded-2xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">{card.title}</span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">{card.value}</h3>
                <p className="text-[11px] font-medium text-gray-500 mt-1">{card.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel h-28 rounded-2xl p-6"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5 space-y-4">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white">No active applications</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              You haven't submitted your resume to any open positions yet. Get started today!
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white rounded-xl transition-all"
          >
            <span>Browse Job Vacancies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Applications List */
        <div className="space-y-4">
          {applications.map((app) => {
            const hasAi = !!app.aiAnalysis;
            const score = app.aiAnalysis?.resumeScore || 0;
            const skillMatch = app.aiAnalysis?.skillsMatch || 0;
            const isExpanded = expandedAppId === app.id;

            return (
              <GlassCard key={app.id} hoverEffect={false} className="p-0">
                {/* Header Collapsible Trigger */}
                <div 
                  onClick={() => toggleExpand(app.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-white tracking-tight">{app.jobTitle}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-gray-400">
                      Applied on: {new Date(app.appliedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                  </div>

                  {/* AI Quick score */}
                  {hasAi && (
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border ${getScoreColor(score)}`}>
                          <span className="text-sm font-bold">{score}%</span>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-gray-400 mt-0.5">Score</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border ${getScoreColor(skillMatch)}`}>
                          <span className="text-sm font-bold">{skillMatch}%</span>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-gray-400 mt-0.5">Skills</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accordion toggle */}
                  <div className="text-gray-400 hover:text-white flex justify-center">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded AI Report Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6">
                    {hasAi ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {/* Strengths */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Key Strengths</span>
                          </h4>
                          <ul className="space-y-1.5 text-sm text-gray-300">
                            {app.aiAnalysis.strengths.map((str, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-cyan-400 font-mono mt-0.5">✓</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                            <span>Areas for Growth</span>
                          </h4>
                          <ul className="space-y-1.5 text-sm text-gray-300">
                            {app.aiAnalysis.weaknesses.map((weak, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-purple-400 font-mono mt-0.5">⚠</span>
                                <span>{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-sm text-gray-400">
                        AI Resume matching score is being computed. Check back shortly.
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
