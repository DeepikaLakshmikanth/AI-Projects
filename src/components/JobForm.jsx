import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

const STATUS_OPTIONS = [
  { value: 'Wishlist', label: 'Wishlist' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Rejected', label: 'Rejected' },
];

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'Select Job Type' },
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
];

const WORK_MODE_OPTIONS = [
  { value: '', label: 'Select Work Mode' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

export const JobForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      company: '',
      role: '',
      url: '',
      resume: '',
      dateApplied: new Date().toISOString().split('T')[0],
      type: '',
      workMode: '',
      notes: '',
      status: 'Wishlist',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Company Name *"
        {...register('company', { required: 'Company name is required' })}
        error={errors.company?.message}
      />
      
      <Input
        label="Job Title / Role *"
        {...register('role', { required: 'Role is required' })}
        error={errors.role?.message}
      />
      
      <Input
        label="LinkedIn / Job URL"
        type="url"
        {...register('url')}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Job Type *"
          options={JOB_TYPE_OPTIONS}
          {...register('type', { required: 'Job type is required' })}
          error={errors.type?.message}
        />
        
        <Select
          label="Work Mode *"
          options={WORK_MODE_OPTIONS}
          {...register('workMode', { required: 'Work mode is required' })}
          error={errors.workMode?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Resume Used"
          placeholder="e.g. SDE_Resume_v3"
          {...register('resume')}
        />
        
        <Input
          label="Date Applied"
          type="date"
          {...register('dateApplied')}
        />
      </div>

      <Select
        label="Status *"
        options={STATUS_OPTIONS}
        {...register('status', { required: 'Status is required' })}
        error={errors.status?.message}
      />
      
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:text-gray-50 dark:focus:ring-blue-500"
          placeholder="Recruiter info, referrals, etc."
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 !mt-6 border-t border-gray-200 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Job</Button>
      </div>
    </form>
  );
};
