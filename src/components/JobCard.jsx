import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Building2, Calendar, FileText, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export const JobCard = ({ job, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: job
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const daysSince = formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });

  const statusColors = {
    'Wishlist': 'border-l-gray-400',
    'Applied': 'border-l-blue-400',
    'Follow-up': 'border-l-yellow-400',
    'Interview': 'border-l-purple-400',
    'Offer': 'border-l-green-400',
    'Rejected': 'border-l-red-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4 ${statusColors[job.status] || 'border-l-gray-400'} ${isDragging ? 'opacity-50 z-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{job.role}</h4>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={(e) => { e.stopPropagation(); onEdit(job); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button 
            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
        <Building2 size={14} />
        <span className="truncate">{job.company}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.type && <Badge variant="primary">{job.type}</Badge>}
        {job.workMode && <Badge variant="default">{job.workMode}</Badge>}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1" title="Date Applied">
            <Calendar size={12} />
            {daysSince}
          </div>
          {job.resume && (
            <div className="flex items-center gap-1" title="Resume Used">
              <FileText size={12} />
              <span className="truncate max-w-[100px]">{job.resume}</span>
            </div>
          )}
        </div>
        
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title="View Job Post"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
};
