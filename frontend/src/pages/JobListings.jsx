import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import { Search, Briefcase, Calendar, Award, ArrowRight, DollarSign } from 'lucide-react';

export const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedJobs, setExpandedJobs] = useState({});

  const toggleExpand = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        // Only show open jobs for candidates
        const openJobs = response.data.filter(job => job.status === 'open');
        setJobs(openJobs);
      } catch (err) {
        setError("Failed to retrieve active job postings.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(query);
    const descMatch = job.description.toLowerCase().includes(query);
    const skillsMatch = job.required_skills.some(s => s.toLowerCase().includes(query));
    return titleMatch || descMatch || skillsMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Available Positions
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium tracking-wide">
            Browse active career openings and evaluate your skills compatibility
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            placeholder="Search by role or skill..."
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Skeletons Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 rounded-lg w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
              </div>
              <div className="flex space-x-2 pt-2">
                <div className="h-6 bg-slate-800 rounded w-16"></div>
                <div className="h-6 bg-slate-800 rounded w-20"></div>
              </div>
              <div className="h-10 bg-slate-800 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No active roles found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            We don't have any openings matching your search right now. Check back shortly!
          </p>
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job, idx) => (
            <GlassCard key={job.id} delay={idx * 0.05} className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{job.experience_required}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{job.salary || 'Not Specified'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Deadline: {job.deadline}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className={`text-sm text-gray-300 leading-relaxed ${expandedJobs[job.id] ? '' : 'line-clamp-4'}`}>
                    {job.description}
                  </p>
                  {job.description.length > 150 && (
                    <button
                      onClick={() => toggleExpand(job.id)}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 mt-1 cursor-pointer focus:outline-none block"
                    >
                      {expandedJobs[job.id] ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-[10px] font-semibold text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate(`/apply/${job.id}`)}
                className="mt-6 w-full glow-btn flex items-center justify-center space-x-2 py-2.5 bg-white/5 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Apply to Role</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListings;
