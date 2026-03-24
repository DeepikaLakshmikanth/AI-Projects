import React, { useEffect, useState, useMemo } from 'react';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  closestCorners
} from '@dnd-kit/core';
import { Plus, Search, Filter } from 'lucide-react';
import { getJobs, addJob, updateJob, deleteJob } from '../lib/db';
import { KanbanColumn } from '../components/KanbanColumn';
import { JobCard } from '../components/JobCard';
import { Modal } from '../components/ui/Modal';
import { JobForm } from '../components/JobForm';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

import { useSearchParams } from 'react-router-dom';

const COLUMNS = ['Wishlist', 'Applied', 'Follow-up', 'Interview', 'Offer', 'Rejected'];

const Board = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  // Drag state
  const [activeJob, setActiveJob] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const data = await getJobs();
    // Default sort by dateApplied desc
    data.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
    setJobs(data);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    setActiveJob(job);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // column id

    const jobIndex = jobs.findIndex(j => j.id === activeId);
    if (jobIndex === -1) return;

    const job = jobs[jobIndex];
    if (job.status !== overId) {
      const updatedJob = { ...job, status: overId };
      
      // Optimistic update
      const newJobs = [...jobs];
      newJobs[jobIndex] = updatedJob;
      setJobs(newJobs);
      
      // DB update
      await updateJob(updatedJob);
    }
  };

  const openAddModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (jobToDelete) {
      await deleteJob(jobToDelete);
      setJobs(jobs.filter(j => j.id !== jobToDelete));
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const handleSaveJob = async (data) => {
    if (editingJob) {
      const updatedJob = { ...editingJob, ...data };
      await updateJob(updatedJob);
      setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    } else {
      const newJob = {
        id: crypto.randomUUID(),
        ...data
      };
      await addJob(newJob);
      setJobs([newJob, ...jobs]);
    }
    setIsModalOpen(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const q = searchQuery.toLowerCase();
      return job.company.toLowerCase().includes(q) || 
             job.role.toLowerCase().includes(q);
    });
  }, [jobs, searchQuery]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Board</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your applications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search companies or roles..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setSearchParams({ q: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="pl-9"
            />
          </div>
          <Button onClick={openAddModal} className="gap-2">
            <Plus size={18} />
            Add Job
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 min-w-max px-2">
            {COLUMNS.map((colName) => (
              <KanbanColumn
                key={colName}
                id={colName}
                title={colName}
                jobs={filteredJobs.filter(j => j.status === colName)}
                onEdit={openEditModal}
                onDelete={confirmDelete}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeJob ? (
              <div className="rotate-2 opacity-90 w-72">
                <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingJob ? "Edit Job" : "Add New Job"}
      >
        <JobForm 
          initialData={editingJob} 
          onSubmit={handleSaveJob} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this job? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Job</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Board;
