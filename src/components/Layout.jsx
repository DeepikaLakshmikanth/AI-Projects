import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, History, Bell, Sun, Moon, Download, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getJobs, getReminders, importData } from '../lib/db';

const Layout = () => {
  const { theme, toggleTheme } = useTheme();

  const fileInputRef = React.useRef(null);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Board', path: '/board', icon: <KanbanSquare size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Reminder', path: '/reminder', icon: <Bell size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Work Pilot
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          
          <button
            onClick={async () => {
              const jobs = await getJobs();
              const reminders = await getReminders();
              const data = { jobs, reminders };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `work-pilot-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:bg-gray-800/50"
          >
            <Download size={20} />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:bg-gray-800/50"
          >
            <Upload size={20} />
            <span>Import JSON</span>
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (event) => {
                try {
                  const json = JSON.parse(event.target.result);
                  await importData(json);
                  alert('Data imported successfully! Reloading...');
                  window.location.reload();
                } catch (err) {
                  alert('Invalid JSON file.');
                }
              };
              reader.readAsText(file);
            }}
          />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:bg-gray-800/50"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="h-full w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
