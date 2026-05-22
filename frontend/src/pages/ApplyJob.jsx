import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import { UploadCloud, ChevronLeft, Check, Sparkles, AlertCircle, FileText } from 'lucide-react';

export const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  
  // Submission & Loader Status
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0: None, 1: Uploading, 2: Extracting, 3: AI Matching, 4: Done

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
        // Pre-fill user data if logged in
        const profileToken = localStorage.getItem('authToken');
        if (profileToken) {
          try {
            const meResponse = await api.get('/auth/me');
            setName(meResponse.data.displayName || '');
            setEmail(meResponse.data.email || '');
          } catch (e) {
            console.warn("Could not prefill user details", e);
          }
        }
      } catch (err) {
        setError("Failed to fetch job details.");
        console.error(err);
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'pdf' && extension !== 'docx') {
        setError("Only PDF and DOCX formats are supported.");
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'pdf' && extension !== 'docx') {
        setError("Only PDF and DOCX formats are supported.");
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }
    
    setError('');
    setSubmitting(true);
    
    // Simulate multi-step progress bar for better UX
    setSubmitStep(1); // Uploading
    
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('college', college);
    formData.append('experience', experience);
    formData.append('skills', skills);
    formData.append('resume', resumeFile);

    try {
      // Transition steps slowly to look premium
      setTimeout(() => setSubmitStep(2), 1200); // Extracting Text
      setTimeout(() => setSubmitStep(3), 2400); // AI Resume Matching

      const response = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setTimeout(() => {
        setSubmitStep(4); // Done
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }, 3500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Application submission failed. Verify your input fields.");
      setSubmitting(false);
      setSubmitStep(0);
    }
  };

  if (loadingJob) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded-lg w-1/4"></div>
        <div className="h-32 bg-slate-800 rounded-2xl"></div>
        <div className="h-64 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">Job not found</h3>
        <Link to="/jobs" className="text-purple-400 underline text-sm">Return to jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Apply for Role
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Applying for: <span className="text-purple-400 font-semibold">{job.title}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Application Form */}
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="+1 (555) 019-2834"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 tracking-wider">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="Stanford University"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 tracking-wider">Professional Experience Summary</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              placeholder="e.g. 2 years as a Frontend Dev at Acme Corp. Led React migration."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 tracking-wider">Core Skills (Comma Separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              placeholder="React, JavaScript, Tailwind, Redux, Node.js"
              required
            />
          </div>

          {/* Custom File Upload Container */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 tracking-wider">Upload Resume (PDF/DOCX)</label>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                resumeFile 
                  ? 'border-purple-500/50 bg-purple-500/5' 
                  : 'border-white/10 hover:border-purple-500/30 bg-slate-950/20'
              }`}
            >
              <input
                type="file"
                id="resume-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
              />
              
              {resumeFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-xs">{resumeFile.name}</p>
                    <p className="text-xs text-gray-400">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <label
                    htmlFor="resume-upload"
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 rounded-lg cursor-pointer transition-colors"
                  >
                    Change File
                  </label>
                </div>
              ) : (
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <UploadCloud className="w-10 h-10 text-purple-400 animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-white">Drag & drop your resume, or <span className="text-purple-400 underline">browse</span></p>
                    <p className="text-xs text-gray-500 mt-1">Supports PDF or Word Documents (.docx)</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full glow-btn flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-glow hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Apply and Run AI Screening</span>
          </button>
        </form>
      </GlassCard>

      {/* AI Processing Overlay Modal */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 space-y-6 text-center shadow-glow">
            {/* Loader animation */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin animation-delay-150"></div>
              <Sparkles className="absolute top-6 left-6 w-8 h-8 text-purple-400 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">AURA Resume Analysis</h3>
              <p className="text-gray-400 text-xs mt-1">Processing application data via Gemini LLM...</p>
            </div>

            {/* Checklist */}
            <div className="text-left space-y-3 max-w-xs mx-auto text-sm border-t border-white/5 pt-5">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  submitStep >= 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-500 border border-white/5'
                }`}>
                  {submitStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                </div>
                <span className={submitStep === 1 ? 'text-white font-medium' : 'text-gray-400'}>Uploading resume attachment...</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  submitStep >= 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-500 border border-white/5'
                }`}>
                  {submitStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                </div>
                <span className={submitStep === 2 ? 'text-white font-medium' : 'text-gray-400'}>Extracting document syntax...</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  submitStep >= 3 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-500 border border-white/5'
                }`}>
                  {submitStep > 3 ? <Check className="w-3 h-3" /> : '3'}
                </div>
                <span className={submitStep === 3 ? 'text-white font-medium' : 'text-gray-400'}>Evaluating skills & experiences...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;
