import { useState, useEffect, useCallback } from 'react';
import { jobService } from '@/services/api/apiServices';
import { useUserStore } from '@/store/userStore';
import socketClient from '@/services/socket/socketClient';

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: string; // e.g., 'Full-Time', 'Part-Time', 'Contract', 'Internship'
  daysLeft: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  competencies: string[];
  benefits: string[];
  isSaved: boolean;
  isApplied: boolean;
  postedDate: string;
  website?: string;
}

/**
 * Helper to parse stringified lists from backend
 * Example: "\"React\", \"Next.js\"" -> ["React", "Next.js"]
 */
const parseBackendList = (listStr: any): string[] => {
  if (Array.isArray(listStr)) return listStr;
  if (!listStr || typeof listStr !== 'string') return [];
  
  try {
    // If it looks like a JSON array, try parsing it
    if (listStr.trim().startsWith('[') && listStr.trim().endsWith(']')) {
      return JSON.parse(listStr);
    }
    
    // Otherwise handle the custom escaped string format: "\"Item 1\", \"Item 2\""
    const cleaned = listStr.trim();
    // Use a regex to find all matches inside escaped quotes
    const matches = cleaned.match(/"([^"]+)"/g);
    if (matches) {
      return matches.map(m => m.replace(/"/g, '').trim()).filter(Boolean);
    }
    
    // Fallback: just split by comma if no quotes found
    return cleaned.split(',').map(s => s.trim()).filter(Boolean);
  } catch (err) {
    console.warn('Failed to parse backend list:', listStr);
    return [];
  }
};

/**
 * Maps backend job object to frontend Job interface
 */
const mapBackendJobToFrontend = (bj: any): Job => {
  // Calculate days left
  let diffDays = 0;
  if (bj.ending_date) {
    const endingDate = new Date(bj.ending_date);
    const now = new Date();
    const diffTime = endingDate.getTime() - now.getTime();
    diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return {
    id: bj.id.toString(),
    title: bj.job_title || 'Untitled Role',
    company: bj.company_name || 'Generic Company',
    logo: bj.company_logo || 'https://via.placeholder.com/150',
    location: bj.job_location || 'Remote',
    salary: bj.job_pay ? `$${bj.job_pay}/hr` : 'Negotiable',
    type: bj.job_type || 'Full-Time',
    daysLeft: diffDays,
    summary: bj.job_summary || '',
    responsibilities: parseBackendList(bj.responsibilities),
    requirements: parseBackendList(bj.requirements),
    competencies: parseBackendList(bj.competencies),
    benefits: parseBackendList(bj.benefits),
    isSaved: bj.isSaved || false,
    isApplied: bj.isApplied || false,
    postedDate: bj.created_at || new Date().toISOString(),
    website: bj.company_website || '#',
  };
};


/**
 * Custom hook to handle job fetching and real-time updates
 */

export function useJobs(activeTab: string = 'Active', filters: { location?: string; roleType?: string; datePosted?: string; search?: string } = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authToken } = useUserStore();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let rawData: any = [];
      if (activeTab === 'Saved' || activeTab === 'Applied') {
        rawData = await jobService.getUserJobs(activeTab.toLowerCase() as 'applied' | 'saved', authToken || undefined);
      } else {
        // Active tab or default
        const params = {
          location: filters.location,
          roleType: filters.roleType !== 'All' ? filters.roleType : undefined,
          datePosted: filters.datePosted !== 'All' ? filters.datePosted : undefined,
          search: filters.search
        };
        console.log('📡 Sending job fetch request with params:', JSON.stringify(params, null, 2));
        rawData = await jobService.getJobs(params);
      }
      
      // Extract the jobs array from the wrapped response if necessary
      let jobList: any[] = [];
      if (Array.isArray(rawData)) {
        jobList = rawData;
      } else if (rawData && Array.isArray(rawData.jobs)) {
        jobList = rawData.jobs;
      } else if (rawData && rawData.data && Array.isArray(rawData.data)) {
        jobList = rawData.data;
      }
      
      // Map backend objects to frontend Job interface
      const mappedJobs = jobList.map(mapBackendJobToFrontend);
      
      setJobs(mappedJobs);
      console.log('✅ Jobs fetched from backend:', mappedJobs.length, 'jobs found');
      if (mappedJobs.length > 0) {
        console.log('📋 First mapped job sample:', JSON.stringify(mappedJobs[0], null, 2));
      }
    } catch (err: any) {
      console.error('Error in useJobs fetch:', err);
      setError('Could not load jobs. Please check your connection.');
      // Keep existing jobs if refresh fails, or clear if first load
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters.location, filters.roleType, filters.datePosted, filters.search, authToken]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Socket.io Real-time implementation
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketClient.connect({ token: authToken });
        
        const handleNewJob = (newJob: Job) => {
          setJobs(prev => {
            // Avoid duplicates
            if (prev.some(j => j.id === newJob.id)) return prev;
            return [newJob, ...prev];
          });
        };

        const handleUpdateJob = (updatedJob: Job) => {
          setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        };

        const handleDeleteJob = (jobId: string) => {
          setJobs(prev => prev.filter(j => j.id !== jobId));
        };

        // Listen for events (adjust event names based on backend)
        await socketClient.on('job_added', handleNewJob);
        await socketClient.on('job_updated', handleUpdateJob);
        await socketClient.on('job_deleted', handleDeleteJob);

        return () => {
          socketClient.off('job_added');
          socketClient.off('job_updated');
          socketClient.off('job_deleted');
        };
      } catch (err: any) {
        console.error('Socket initialization failed in useJobs:', err);
      }
    };

    initializeSocket();
  }, [authToken]);

  const toggleSaveJob = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    try {
      // Optimistic update
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isSaved: !j.isSaved } : j));
      
      await jobService.updateUserJobStatus({
        job_id: id,
        status: 'saved'
      }, authToken || undefined);
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      // Rollback on error
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isSaved: !j.isSaved } : j));
    }
  };

  const applyForJob = async (id: string | number, cv?: string, coverLetter?: string) => {
    try {
      // Optimistic update
      setJobs(prev => prev.map(j => j.id.toString() === id.toString() ? { ...j, isApplied: true } : j));
      
      if (cv && coverLetter) {
        await jobService.applyToJob({
          job_id: id.toString(),
          cv,
          cover_letter: coverLetter
        }, authToken || undefined);
      } else {
        await jobService.updateUserJobStatus({
          job_id: id.toString(),
          status: 'applied'
        }, authToken || undefined);
      }
    } catch (err) {
      console.error('Failed to apply for job:', err);
      // Rollback on error
      setJobs(prev => prev.map(j => j.id.toString() === id.toString() ? { ...j, isApplied: false } : j));
      throw err;
    }
  };

  return {
    jobs,
    isLoading,
    error,
    toggleSaveJob,
    applyForJob,
    refresh: fetchJobs
  };
}

