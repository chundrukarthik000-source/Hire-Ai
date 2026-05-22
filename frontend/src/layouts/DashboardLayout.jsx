import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-gray-100">
      {/* Global Top Navbar */}
      <Navbar />
      
      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-1">
        <Sidebar />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
