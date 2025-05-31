import { useEffect, useState } from 'react';
import axios from 'axios';
import ToastNotification from './ToastNotification';
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTools, 
  FaPaperPlane,
  FaBookmark,
  FaRegBookmark,
  FaClock,
  FaBuilding,
  FaExternalLinkAlt
} from 'react-icons/fa';

interface Job {
  id: number;
  position: string;
  location: string;
  company: string;
  description: string;
  salary: number | string;
  skills_required: string;
  experience: number | string;
  posted_date?: string;
  is_remote?: boolean;
  is_hybrid?: boolean;
  company_logo?: string;
}

const RequirementsTab = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
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

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return 'Recently posted';
    const posted = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  const JobCard = ({ job, isNew, isCompact = false }: { job: Job; isNew: boolean; isCompact?: boolean }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 group transform hover:-translate-y-1 ${
        isCompact ? 'p-3 cursor-pointer' : 'p-5'
      } ${selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => isCompact && setSelectedJob(job)}
    >
      <div className={`flex items-start gap-4 ${isCompact ? 'gap-3' : ''}`}>
        {/* Company Logo */}
        <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-300 flex-shrink-0 overflow-hidden ${
          isCompact ? 'w-12 h-12' : 'w-14 h-14'
        }`}>
          {job.company_logo ? (
            <img 
              src={job.company_logo} 
              alt={`${job.company} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`font-bold text-blue-600 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {job.company.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0">
              <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate ${
                isCompact ? 'text-base' : 'text-xl'
              }`}>
                {job.position}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-600 font-medium truncate">{job.company}</span>
                {job.is_remote && (
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                    Remote
                  </span>
                )}
                {job.is_hybrid && (
                  <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                    Hybrid
                  </span>
                )}
              </div>
            </div>
            {!isCompact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveJob(job.id);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title={savedJobs.includes(job.id) ? "Remove from saved" : "Save job"}
              >
                {savedJobs.includes(job.id) ? (
                  <FaBookmark size={16} />
                ) : (
                  <FaRegBookmark size={16} />
                )}
              </button>
            )}
          </div>

          {!isCompact && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
                  <FaMapMarkerAlt className="mr-1.5" size={12} />
                  {job.location}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors duration-300">
                  <FaBriefcase className="mr-1.5" size={12} />
                  {job.experience} years
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition-colors duration-300">
                  <FaMoneyBillWave className="mr-1.5" size={12} />
                  {job.salary}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                  <FaClock className="mr-1.5" size={12} />
                  {formatPostedDate(job.posted_date)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                {job.description}
              </p>

              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <FaTools className="mr-1.5 text-blue-600" size={12} />
                  Required Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills_required.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium group-hover:bg-blue-100 transition-colors duration-300"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {isNew ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                applyJob(job.id);
              }}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md group-hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isCompact ? 'px-3 py-1.5' : ''
              }`}
            >
              <FaPaperPlane className="mr-1" size={12} />
              Apply Now
            </button>
          ) : (
            <div className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              <FaCheckCircle className="mr-1.5" size={12} />
              Applied
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderJobs = (jobs: Job[], isNew: boolean) => {
    if (jobs.length === 0) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 p-8 rounded-xl text-center">
          <FaBriefcase className="text-4xl mb-4 mx-auto" />
          <p className="text-xl font-medium">
            {isNew ? "No new jobs available" : "You haven't applied to any jobs yet"}
          </p>
          {isNew && (
            <p className="text-blue-500 mt-2 text-sm">Check back later for new opportunities</p>
          )}
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* List Panel */}
          <div className="w-1/3 overflow-y-auto pr-4 space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isNew={isNew} isCompact={true} />
            ))}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
            {selectedJob ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.position}</h2>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="flex items-center">
                        <FaBuilding className="mr-1.5" size={14} />
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-1.5" size={14} />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center">
                        <FaClock className="mr-1.5" size={14} />
                        {formatPostedDate(selectedJob.posted_date)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveJob(selectedJob.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title={savedJobs.includes(selectedJob.id) ? "Remove from saved" : "Save job"}
                  >
                    {savedJobs.includes(selectedJob.id) ? (
                      <FaBookmark size={20} />
                    ) : (
                      <FaRegBookmark size={20} />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                    <FaBriefcase className="mr-2" size={14} />
                    {selectedJob.experience} years experience
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                    <FaMoneyBillWave className="mr-2" size={14} />
                    {selectedJob.salary}
                  </span>
                  {selectedJob.is_remote && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      Remote
                    </span>
                  )}
                  {selectedJob.is_hybrid && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                      Hybrid
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills_required.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sticky bottom-0 pt-4 bg-white border-t border-gray-100">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => window.open(`mailto:?subject=Job Application: ${selectedJob.position} at ${selectedJob.company}&body=I'm interested in the ${selectedJob.position} position at ${selectedJob.company}.`)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <FaExternalLinkAlt size={14} />
                      Share
                    </button>
                    {isNew && (
                      <button
                        onClick={() => applyJob(selectedJob.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                      >
                        <FaPaperPlane size={14} />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a job to view details
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isNew={isNew} />
        ))}
      </div>
    );
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  return (
    <div className="container py-6">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <ul className="flex gap-4">
            <li>
              <button
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'new'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('new')}
              >
                New Jobs ({filteredNewJobs.length})
              </button>
            </li>
            <li>
              <button
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'applied'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('applied')}
              >
                Applied Jobs ({appliedJobs.length})
              </button>
            </li>
          </ul>

          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Cards
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'new' ? renderJobs(filteredNewJobs, true) : renderJobs(appliedJobs, false)}
    </div>
  );
};

export default RequirementsTab;
