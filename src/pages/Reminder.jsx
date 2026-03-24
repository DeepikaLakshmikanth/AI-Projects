import React, { useEffect, useState } from 'react';
import { getReminders, addReminder, deleteReminder, getJobs } from '../lib/db';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bell, Calendar, Trash2, Plus } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useForm } from 'react-hook-form';

const Reminder = () => {
  const [reminders, setReminders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const rData = await getReminders();
    rData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    setReminders(rData);

    const jData = await getJobs();
    setJobs(jData);
  };

  const handleAddSubmit = async (data) => {
    const newRem = {
      id: crypto.randomUUID(),
      title: data.title,
      jobId: data.jobId || null,
      dueDate: data.dueDate,
    };
    await addReminder(newRem);
    reset();
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id) => {
    await deleteReminder(id);
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Helper to format date label with color insight
  const getDueLabel = (dateStr) => {
    const d = new Date(dateStr);
    if (isPast(d) && !isToday(d)) {
      return <Badge variant="danger">Overdue</Badge>;
    } else if (isToday(d)) {
      return <Badge variant="warning">Today</Badge>;
    }
    return <Badge variant="default">Upcoming</Badge>;
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-gray-100">Reminders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of your next steps.</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={18} />
          New Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.length === 0 ? (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Bell size={48} className="mb-4 text-gray-400 opacity-50" />
            <p>No reminders set. Stay on top of your job hunt!</p>
          </div>
        ) : (
          reminders.map(r => {
            const linkedJob = jobs.find(j => j.id === r.jobId);
            return (
              <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative group">
                <button 
                  onClick={() => handleDelete(r.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
                
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg pr-8">{r.title}</h3>
                
                {linkedJob && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {linkedJob.company} — {linkedJob.role}
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-3">
                  {getDueLabel(r.dueDate)}
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                    {format(new Date(r.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Reminder">
        <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4">
          <Input 
            label="Reminder Title *"
            placeholder="e.g. Email recruiter, Prepare for technical round..."
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />

          <Input 
            label="Due Date *"
            type="date"
            {...register('dueDate', { required: 'Due date is required' })}
            error={errors.dueDate?.message}
          />

          <Select
            label="Link to Job (Optional)"
            options={[
              { value: '', label: 'Select a job...' },
              ...jobs.map(j => ({ value: j.id, label: `${j.company} - ${j.role}` }))
            ]}
            {...register('jobId')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reminder;
