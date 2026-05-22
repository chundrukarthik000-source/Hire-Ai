import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import GlassCard from '../components/GlassCard';
import { Users, Briefcase, Award, ArrowRight, Clock, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplicants: 0,
    totalJobs: 0,
    shortlistedCandidates: 0,
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  const [scoreDistData, setScoreDistData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
        
        // Fetch candidates for visual chart aggregation
        const candResponse = await api.get('/admin/candidates');
        const applications = candResponse.data;
        
        // 1. Group applications by job title (BarChart)
        const jobCounts = {};
        applications.forEach(app => {
          const title = app.jobTitle || 'Unknown';
          jobCounts[title] = (jobCounts[title] || 0) + 1;
        });
        const formattedJobCounts = Object.keys(jobCounts).map(title => ({
          name: title.length > 15 ? `${title.substring(0, 15)}...` : title,
          applicants: jobCounts[title]
        }));
        setChartData(formattedJobCounts);

        // 2. Score distributions (AreaChart)
        const buckets = {
          '0-49': 0,
          '50-59': 0,
          '60-69': 0,
          '70-79': 0,
          '80-89': 0,
          '90-100': 0
        };
        applications.forEach(app => {
          const score = app.aiAnalysis?.resumeScore || 0;
          if (score < 50) buckets['0-49']++;
          else if (score < 60) buckets['50-59']++;
          else if (score < 70) buckets['60-69']++;
          else if (score < 80) buckets['70-79']++;
          else if (score < 90) buckets['80-89']++;
          else buckets['90-100']++;
        });
        const formattedScoreDist = Object.keys(buckets).map(bucket => ({
          range: bucket,
          candidates: buckets[bucket]
        }));
        setScoreDistData(formattedScoreDist);

      } catch (err) {
        console.error(err);
        setError("Failed to compile analytics dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30';
      case 'rejected':
        return 'text-red-400 bg-red-950/20 border-red-800/30';
      default:
        return 'text-amber-400 bg-amber-950/20 border-amber-800/30';
    }
  };

  const statCards = [
    {
      title: 'TOTAL APPLICATIONS',
      value: stats.totalApplicants,
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10',
      borderColor: 'border-t-cyan-500',
      desc: 'Resumes parsed & logged'
    },
    {
      title: 'JOB POSTINGS',
      value: stats.totalJobs,
      icon: <Briefcase className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/10',
      borderColor: 'border-t-purple-500',
      desc: 'Active vacancies published'
    },
    {
      title: 'SHORTLISTED TALENT',
      value: stats.shortlistedCandidates,
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10',
      borderColor: 'border-t-emerald-500',
      desc: 'Approved by AI & Admins'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-800 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-800 rounded-2xl"></div>
            <div className="h-32 bg-slate-800 rounded-2xl"></div>
            <div className="h-32 bg-slate-800 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-800 rounded-2xl"></div>
            <div className="h-80 bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          {getGreeting()}, {user?.displayName || 'Admin'} 👋
        </h1>
        <p className="text-gray-400 text-sm font-medium tracking-wide">
          Here's your systems analytics overview for {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <GlassCard hoverEffect={false} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="text-md font-bold text-white tracking-tight">Applicants by Role</h3>
          </div>
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 font-mono">
                NO PLOTTING DATA AVAILABLE
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="applicants" fill="#06B6D4" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Score Distribution Chart */}
        <GlassCard hoverEffect={false} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-md font-bold text-white tracking-tight">AI Resume Score Spread</h3>
          </div>
          <div className="h-72 w-full">
            {scoreDistData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 font-mono">
                NO PLOTTING DATA AVAILABLE
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="range" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <defs>
                    <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="candidates" stroke="#A855F7" fillOpacity={1} fill="url(#scoreGlow)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Applications Table */}
      <GlassCard hoverEffect={false} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4.5 h-4.5 text-gray-400" />
            <h3 className="text-md font-bold text-white tracking-tight">Recent Applications</h3>
          </div>
          <Link
            to="/admin/candidates"
            className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {stats.recentApplications.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500 font-mono">
              NO RECENT CANDIDATE TRANSACTIONS
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-mono uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Applied Role</th>
                  <th className="pb-3 font-semibold text-center">AI Match Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">{app.candidateName}</p>
                        <p className="text-xs text-gray-400">{app.candidateEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300 font-medium">{app.jobTitle}</td>
                    <td className="py-4 text-center">
                      <span className="inline-flex px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-white font-mono">
                        {app.aiAnalysis?.resumeScore || 0}%
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate('/admin/candidates', { state: { highlightAppId: app.id } })}
                        className="p-1 px-3 bg-white/5 hover:bg-purple-600 text-xs text-gray-300 hover:text-white rounded-lg border border-white/5 hover:border-purple-500 transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
};

export default AdminDashboard;
