import React from 'react';
import { FileText, Download, Eye, ExternalLink } from 'lucide-react';

export const ResumePreview = ({ resumeUrl, candidateName = "Candidate" }) => {
  const isPdf = resumeUrl?.toLowerCase().endsWith('.pdf');
  
  // Resolve absolute backend URL if it is a relative mock path
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  let apiOrigin = 'http://localhost:8000';
  if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
    try {
      apiOrigin = new URL(apiBaseUrl).origin;
    } catch (e) {
      console.error('Invalid VITE_API_URL:', e);
    }
  } else {
    apiOrigin = '';
  }

  const absoluteUrl = resumeUrl?.startsWith('/api') 
    ? `${apiOrigin}${resumeUrl}` 
    : resumeUrl;

  return (
    <div className="flex flex-col h-full min-h-[500px] border border-white/10 rounded-xl overflow-hidden bg-slate-950/80">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="font-medium max-w-[200px] truncate">{candidateName}_Resume.{isPdf ? 'pdf' : 'docx'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded-md transition-all font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Tab</span>
          </a>
          
          <a
            href={absoluteUrl}
            download
            className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-xs text-white rounded-md transition-all font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Frame content */}
      <div className="flex-1 relative bg-slate-900/50 flex items-center justify-center p-2">
        {isPdf ? (
          <iframe
            src={`${absoluteUrl}#toolbar=0`}
            title="Resume PDF Preview"
            className="w-full h-full border-none rounded-md"
            type="application/pdf"
          />
        ) : (
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-md font-semibold text-white">DOCX Preview Unsupported</h4>
              <p className="text-sm text-gray-400 mt-1">
                Word Documents (.docx) cannot be rendered natively in browsers. Use the buttons above to download or open the file.
              </p>
            </div>
            
            <a
              href={absoluteUrl}
              download
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Word Doc</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
