import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ToastNotification from './ToastNotification';

interface Job {
  id: number;
  position: string;
  location: string;
  company: string;
  description: string;
  salary: number | string;
  skills_required: string;
  experience: number | string;
}

const RequirementsTab = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [newJobs, setNewJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [filteredNewJobs, setFilteredNewJobs] = useState<Job[]>([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const token = localStorage.getItem('token');

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/requirements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewJobs(res.data);
    } catch (error) {
      console.error('Error fetching new jobs:', error);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppliedJobs(res.data);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  // Filter out already applied jobs from new jobs
  useEffect(() => {
    if (newJobs.length > 0 && appliedJobs.length > 0) {
      // Create array of applied job IDs
      const appliedJobIds = appliedJobs.map(job => job.id);
      
      // Filter newJobs to exclude already applied jobs
      const filtered = newJobs.filter(job => !appliedJobIds.includes(job.id));
      setFilteredNewJobs(filtered);
    } else {
      setFilteredNewJobs(newJobs);
    }
  }, [newJobs, appliedJobs]);

  const applyJob = async (jobId: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/apply/${jobId}`,
        { jobId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Display success toast
      const job = newJobs.find(job => job.id === jobId);
      setToast({
        show: true,
        message: `Successfully applied for ${job?.position} at ${job?.company}!`,
        type: 'success'
      });
      
      fetchJobs();
      fetchAppliedJobs();
    } catch (error) {
      console.error('Error applying to job:', error);
      
      // Display error toast
      setToast({
        show: true,
        message: 'Failed to apply for the job. Please try again.',
        type: 'error'
      });
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const renderTable = (jobs: Job[], isNew: boolean) => {
    if (jobs.length === 0) {
      return (
        <div className="alert alert-info text-center">
          {isNew ? "No new jobs available" : "You haven't applied to any jobs yet"}
        </div>
      );
    }
    
    return (
      <div className="table-responsive mt-3">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Position</th>
              <th>Location</th>
              <th>Company</th>
              <th>Description</th>
              <th>Salary</th>
              <th>Skills Required</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.position}</td>
                <td>{job.location}</td>
                <td>{job.company}</td>
                <td>{job.description}</td>
                <td>{job.salary}</td>
                <td>{job.skills_required}</td>
                <td>{job.experience}</td>
                <td>
                  {isNew ? (
                    <button
                      onClick={() => applyJob(job.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Apply
                    </button>
                  ) : (
                    <span className="badge bg-success">Applied</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Jobs ({filteredNewJobs.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            Applied Jobs ({appliedJobs.length})
          </button>
        </li>
      </ul>

      {activeTab === 'new' ? renderTable(filteredNewJobs, true) : renderTable(appliedJobs, false)}
    </div>
  );
};

export default RequirementsTab;
