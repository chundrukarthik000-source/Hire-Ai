import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import GlassCard from '../components/GlassCard';
import { Plus, Edit2, Trash2, X, AlertCircle, Briefcase, Calendar, Award, CheckCircle } from 'lucide-react';

export const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null means adding a new job
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formExp, setFormExp] = useState('');
  const [formSalary, setFormSalary] = useState('Not Specified');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState('open');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve jobs list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingJob(null);
    setFormTitle('');
    setFormDesc('');
    setFormSkills('');
    setFormExp('');
    setFormSalary('Not Specified');
    setFormDeadline('');
    setFormStatus('open');
    setShowModal(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormTitle(job.title);
    setFormDesc(job.description);
    setFormSkills(job.required_skills.join(', '));
    setFormExp(job.experience_required);
    setFormSalary(job.salary || 'Not Specified');
    setFormDeadline(job.deadline);
    setFormStatus(job.status);
    setShowModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? All applicants associated with it will remain, but the position will no longer accept new entries.")) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      triggerToast("Job posting deleted successfully.");
      fetchJobs();
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete job posting.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formSkills || !formExp || !formDeadline || !formSalary) {
      alert("All fields are required.");
      return;
    }

    setModalSubmitting(true);
    const skillsArray = formSkills.split(',').map(s => s.trim()).filter(s => s !== '');
    
    const payload = {
      title: formTitle,
      description: formDesc,
      required_skills: skillsArray,
      experience_required: formExp,
      salary: formSalary,
      deadline: formDeadline,
      status: formStatus
    };

    try {
      if (editingJob) {
        // Edit flow
        await api.put(`/jobs/${editingJob.id}`, payload);
        triggerToast("Job role updated successfully.");
      } else {
        // Add flow
        await api.post('/jobs', payload);
        triggerToast("New job posting added successfully.");
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Action failed.");
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Job Openings Manager</h1>
          <p className="text-gray-400 text-sm">Add, remove, or edit job vacancies displayed to talent pools</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="glow-btn flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-glow hover:scale-[1.01] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 glass-panel p-4 rounded-2xl border border-emerald-500/20 text-emerald-400 shadow-glow flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium text-white">{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Jobs Table Panel */}
      <GlassCard hoverEffect={false}>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-800 rounded"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No job postings created</h3>
            <p className="text-sm text-gray-400 mt-1">Click the button above to publish your first role!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-mono uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Required Skills</th>
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Deadline</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {job.title}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {job.required_skills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 text-[9px] font-semibold text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-gray-300 font-medium">
                      {job.experience_required}
                    </td>
                    <td className="py-4 text-gray-400 font-mono text-xs">
                      {job.deadline}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                        job.status === 'open' 
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30' 
                          : 'text-gray-400 bg-slate-900 border-white/5'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="p-1.5 bg-white/5 hover:bg-purple-600 text-gray-400 hover:text-white rounded-lg border border-white/5 hover:border-purple-500 transition-all cursor-pointer inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg border border-white/5 hover:border-red-500 transition-all cursor-pointer inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Add / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-white/10 relative shadow-glow">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingJob ? "Edit Job Posting" : "Post New Position"}
              </h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Job Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. Senior Backend Engineer"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Job Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="Summarize developer responsibilities, daily workflows, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Experience Required</label>
                  <input
                    type="text"
                    value={formExp}
                    onChange={(e) => setFormExp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="e.g. 2+ years / Senior level"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Salary Details</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="e.g. $120,000 - $150,000 / year"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Application Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="open">Open (Accepting applicants)</option>
                    <option value="closed">Closed (Locked)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="React, JavaScript, Redux"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={modalSubmitting}
                className="w-full glow-btn flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                <span>{modalSubmitting ? "Saving..." : "Save Job Position"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminJobs;
