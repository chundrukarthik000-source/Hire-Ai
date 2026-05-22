import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import GlassCard from '../components/GlassCard';
import ResumePreview from '../components/ResumePreview';
import { Search, Eye, Filter, Check, X, Award, CheckCircle, XCircle, Clock, FileText, Briefcase } from 'lucide-react';

export const AdminCandidates = () => {
  const routerLocation = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minScore, setMinScore] = useState('');

  // Selected Candidate for Inspection Panel
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Status change loading indicators
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch jobs for filter dropdown
      const jobResponse = await api.get('/jobs');
      setJobs(jobResponse.data);

      // Fetch candidates (ranked by score by default)
      const candResponse = await api.get('/admin/candidates');
      setCandidates(candResponse.data);

      // If we came from the dashboard with a specific application highlight
      const highlightAppId = routerLocation.state?.highlightAppId;
      if (highlightAppId) {
        const found = candResponse.data.find(c => c.id === highlightAppId);
        if (found) setSelectedCandidate(found);
      } else if (candResponse.data.length > 0) {
        // Default to selecting the first candidate
        setSelectedCandidate(candResponse.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve candidate lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [routerLocation]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      // Update local state
      setCandidates(prev => 
        prev.map(c => c.id === appId ? { ...c, status: newStatus } : c)
      );
      if (selectedCandidate && selectedCandidate.id === appId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update candidate application status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter candidates locally
  const filteredCandidates = candidates.filter(cand => {
    // Search filter
    const query = searchQuery.trim().toLowerCase();
    
    const nameMatch = cand.candidateName ? cand.candidateName.toLowerCase().includes(query) : false;
    const emailMatch = cand.candidateEmail ? cand.candidateEmail.toLowerCase().includes(query) : false;
    const collegeMatch = cand.college ? cand.college.toLowerCase().includes(query) : false;
    const jobTitleMatch = cand.jobTitle ? cand.jobTitle.toLowerCase().includes(query) : false;
    
    const skillsMatch = Array.isArray(cand.skills)
      ? cand.skills.some(s => s && s.toLowerCase().includes(query))
      : (typeof cand.skills === 'string' ? cand.skills.toLowerCase().includes(query) : false);
      
    const experienceMatch = cand.experience ? cand.experience.toLowerCase().includes(query) : false;
    
    const matchSearch = !query || nameMatch || emailMatch || collegeMatch || jobTitleMatch || skillsMatch || experienceMatch;

    // Job filter
    const matchJob = selectedJobId ? cand.jobId === selectedJobId : true;

    // Status filter
    const matchStatus = selectedStatus ? cand.status === selectedStatus : true;

    // Score filter
    const score = cand.aiAnalysis?.resumeScore || 0;
    const matchScore = minScore ? score >= parseInt(minScore) : true;

    return matchSearch && matchJob && matchStatus && matchScore;
  });

  // Sync selected candidate with filtered candidates list
  useEffect(() => {
    if (filteredCandidates.length > 0) {
      const stillExists = filteredCandidates.some(c => c.id === selectedCandidate?.id);
      if (!stillExists) {
        setSelectedCandidate(filteredCandidates[0]);
      }
    } else {
      setSelectedCandidate(null);
    }
  }, [searchQuery, selectedJobId, selectedStatus, minScore, candidates, selectedCandidate?.id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'text-emerald-400 bg-emerald-950/20 border border-emerald-800/30';
      case 'rejected':
        return 'text-red-400 bg-red-950/20 border border-red-800/30';
      default:
        return 'text-amber-400 bg-amber-950/20 border border-amber-800/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Applicant Tracker</h1>
        <p className="text-gray-400 text-sm">Review candidate profile sheets, evaluate skill matches, and update status</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Filter Control Dashboard */}
      <GlassCard hoverEffect={false} className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              placeholder="Search by name, skill..."
            />
          </div>

          {/* Job Selection */}
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="">All Job Roles</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Min Score Selection */}
          <div className="relative">
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="">Any AI Score</option>
              <option value="90">90% or above</option>
              <option value="80">80% or above</option>
              <option value="70">70% or above</option>
              <option value="60">60% or above</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Main Split Interface */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-1 h-96 bg-slate-800 rounded-2xl"></div>
          <div className="lg:col-span-2 h-96 bg-slate-800 rounded-2xl"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No applications received yet</h3>
          <p className="text-sm text-gray-400 mt-1">Once candidates apply, their resumes will be displayed here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Candidates List (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[700px] overflow-y-auto pr-1">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-gray-400 font-mono">
                ROSTER ({filteredCandidates.length} CANDIDATES)
              </span>
              <span className="text-[10px] text-cyan-400 font-bold font-mono">RANKED BY AI</span>
            </div>
            
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-2xl text-xs text-gray-500 font-mono">
                NO MATCHES FOUND
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const isSelected = selectedCandidate && selectedCandidate.id === cand.id;
                const score = cand.aiAnalysis?.resumeScore || 0;

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-600/10 border-purple-500/30 shadow-glow' 
                        : 'bg-slate-950/40 hover:bg-slate-900 border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="truncate space-y-1">
                        <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-purple-300 font-bold' : 'text-white'}`}>
                          {cand.candidateName}
                        </h4>
                        <p className="text-xs text-gray-400 truncate font-medium">{cand.jobTitle}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-mono font-bold text-xs ${getScoreColor(score)}`}>
                        {score}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full border capitalize font-bold ${getStatusBadge(cand.status)}`}>
                        {cand.status}
                      </span>
                      <span className="text-gray-500 font-mono">{new Date(cand.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Inspection Panel (Right 8 cols) */}
          <div className="lg:col-span-8">
            {selectedCandidate ? (
              <div className="space-y-6">
                {/* Profile Header card */}
                <GlassCard hoverEffect={false} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedCandidate.candidateName}</h2>
                      <p className="text-sm text-purple-400 font-medium mt-0.5">Applicant for: {selectedCandidate.jobTitle}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400 font-sans">
                        <span>Email: {selectedCandidate.candidateEmail}</span>
                        <span>•</span>
                        <span>Phone: {selectedCandidate.candidatePhone}</span>
                        <span>•</span>
                        <span>College: {selectedCandidate.college}</span>
                      </div>
                    </div>

                    {/* Status Management */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'shortlisted')}
                        disabled={updatingStatus || selectedCandidate.status === 'shortlisted'}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Shortlist</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                        disabled={updatingStatus || selectedCandidate.status === 'rejected'}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Scores Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">AI Resume Match</p>
                      <p className="text-3xl font-extrabold text-white mt-1">{selectedCandidate.aiAnalysis?.resumeScore || 0}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Skill Relevance</p>
                      <p className="text-3xl font-extrabold text-white mt-1">{selectedCandidate.aiAnalysis?.skillsMatch || 0}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col justify-center">
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Status</p>
                      <div className="mt-2.5">
                        <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusBadge(selectedCandidate.status)}`}>
                          {selectedCandidate.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Skills details */}
                  <div className="mt-6 space-y-4 border-t border-white/5 pt-5">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Professional Experience Summary</h4>
                      <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">{selectedCandidate.experience}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Skills Provided</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedCandidate.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 text-[10px] font-semibold text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* AI Screening Review Breakdown card */}
                <GlassCard hoverEffect={false} className="p-6">
                  <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
                    <Award className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white tracking-tight">AI Assessment report</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Strengths */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">• Strengths</h4>
                      <ul className="space-y-1.5 text-sm text-gray-300">
                        {selectedCandidate.aiAnalysis?.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-cyan-400 mt-0.5">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono">• Weaknesses</h4>
                      <ul className="space-y-1.5 text-sm text-gray-300">
                        {selectedCandidate.aiAnalysis?.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-purple-400 mt-0.5">⚠</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>

                {/* Inline Resume Viewer */}
                <div>
                  <div className="px-1 py-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">Resume PDF Attachment</span>
                  </div>
                  <ResumePreview 
                    resumeUrl={selectedCandidate.resumeUrl} 
                    candidateName={selectedCandidate.candidateName} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20 glass-panel rounded-2xl text-gray-500 font-mono">
                SELECT A CANDIDATE FROM ROSTER TO INSPECT PROFILE
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCandidates;
