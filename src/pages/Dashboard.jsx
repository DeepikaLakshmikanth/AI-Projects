import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../lib/db';
import { BarChart, Briefcase, Building } from 'lucide-react';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => ['Applied', 'Follow-up', 'Interview'].includes(j.status)).length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  // Get unique companies
  const companies = [...new Set(jobs.map(j => j.company))];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-sans text-gray-900 dark:text-gray-100">Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">At-a-glance insights into your job search.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saved</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <BarChart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Applications</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offers Received</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.offers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <BarChart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.rejected}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 font-sans">Pipeline Status</h3>
          <div className="space-y-4">
            {['Wishlist', 'Applied', 'Follow-up', 'Interview', 'Offer'].map(status => {
              const count = statusCounts[status] || 0;
              const width = Math.max((count / maxCount) * 100, 2); // At least 2% for visibility if not 0
              
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {status}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden">
                    {count > 0 && (
                      <div 
                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${width}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="w-8 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full max-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 font-sans">Applied Companies</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {companies.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No companies recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companies.map(company => (
                  <button
                    key={company}
                    onClick={() => navigate(`/board?q=${encodeURIComponent(company)}`)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left group"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Building size={16} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{company}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
