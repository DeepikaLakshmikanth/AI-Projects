import React, { useEffect, useState } from 'react';
import { getJobs } from '../lib/db';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';

const History = () => {
  const [jobs, setJobs] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const data = await getJobs();
    data.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
    setJobs(data);
  };

  const filteredJobs = jobs.filter(job => {
    if (!filterStartDate && !filterEndDate) return true;
    
    const jobDate = new Date(job.dateApplied).getTime();
    const start = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
    const end = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
    
    return jobDate >= start && jobDate <= end;
  });

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Complete log of all your applications</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Input 
            type="date" 
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-40 border-none shadow-none focus:ring-0 text-sm h-8"
          />
          <span className="text-gray-400">to</span>
          <Input 
            type="date" 
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-40 border-none shadow-none focus:ring-0 text-sm h-8"
          />
          {(filterStartDate || filterEndDate) && (
            <button 
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
              className="px-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded h-8"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Role / Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No jobs found for the selected dates.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                       {job.company}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{job.role}</div>
                      <div className="text-xs">{job.type} {job.workMode && `• ${job.workMode}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={['Offer', 'Interview'].includes(job.status) ? 'success' : job.status === 'Rejected' ? 'danger' : 'primary'}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {job.dateApplied ? format(new Date(job.dateApplied), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={job.notes}>
                      {job.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
