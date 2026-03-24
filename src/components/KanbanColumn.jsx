import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { JobCard } from './JobCard';

export const KanbanColumn = ({ id, title, jobs, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {title}
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs py-0.5 px-2 rounded-full font-medium">
            {jobs.length}
          </span>
        </h3>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 bg-gray-100 dark:bg-gray-900/50 flex flex-col gap-3 min-h-[150px] overflow-y-auto transition-colors ${isOver ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};
