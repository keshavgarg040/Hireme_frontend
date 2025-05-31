import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaTools, 
  FaBriefcase, 
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaSort,
  //FaDownload,
  //FaEllipsisH,
  FaStar,
  //FaRegStar,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaTimes
} from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Candidate {
  id: number;
  name: string;
  email: string;
  skills: string;
  contact: string;
  city: string;
  profile_image?: string;
  experience?: number;
  current_role?: string;
  education?: string;
  expected_salary?: number | string;
  availability?: 'immediate' | 'notice_period' | 'not_available';
  applied_jobs?: number[];
  status?: 'active' | 'shortlisted' | 'rejected';
}

interface Application {
  candidate_id: number;
  requirement_id: number;
  applied_date: string;
  status: string;
}

interface FilterState {
  skills: string;
  experience: string;
  location: string;
  education: string;
  availability: string;
  status: string;
}

interface NewCandidate {
  name: string;
  email: string;
  contact: string;
  city: string;
  skills: string;
  username: string;
  password: string;
  experience: string;
  current_role?: string;
  education?: string;
  expected_salary?: string;
  availability?: 'immediate' | 'notice_period' | 'not_available';
  status?: 'active' | 'shortlisted' | 'rejected';
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [candidateApplications, setCandidateApplications] = useState<{[candidateId: number]: number[]}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    skills: '',
    experience: '',
    location: '',
    education: '',
    availability: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCandidateId, setEditCandidateId] = useState<number | null>(null);
  const [newCandidate, setNewCandidate] = useState<NewCandidate>({
    name: "",
    email: "",
    contact: "",
    city: "",
    skills: "",
    username: "",
    password: "",
    experience: "",
    current_role: "",
    education: "",
    expected_salary: "",
    availability: "immediate",
    status: "active"
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    candidateId: 0,
    candidateName: ""
  });

  const fetchCandidates = () => {
    const token = localStorage.getItem("token");

    axios
      .get<Candidate[]>("http://localhost:5000/candidates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCandidates(response.data);
        // After fetching candidates, fetch their job applications
        fetchCandidateApplications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching candidates:", error);
      });
  };

  const fetchCandidateApplications = (candidatesList: Candidate[]) => {
    const token = localStorage.getItem("token");
    
    // Create a map to store candidateId -> jobIds
    const applications: {[candidateId: number]: number[]} = {};
    
    // Initialize empty arrays for each candidate
    candidatesList.forEach(candidate => {
      applications[candidate.id] = [];
    });

    // Fetch all job applications from the database
    axios.get("http://localhost:5000/api/all-applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      // Group applications by candidate ID
      response.data.forEach((app: Application) => {
        if (applications[app.candidate_id]) {
          applications[app.candidate_id].push(app.requirement_id);
        }
      });
      
      setCandidateApplications(applications);
    })
    .catch(error => {
      console.error("Error fetching candidate applications:", error);
    });
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    let filtered = [...candidates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.skills.toLowerCase().includes(query) ||
        candidate.city.toLowerCase().includes(query) ||
        candidate.current_role?.toLowerCase().includes(query) ||
        candidate.education?.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.skills) {
      filtered = filtered.filter(candidate =>
        candidate.skills.toLowerCase().includes(filters.skills.toLowerCase())
      );
    }
    if (filters.experience) {
      const [min, max] = filters.experience.split('-').map(Number);
      filtered = filtered.filter(candidate => {
        const exp = candidate.experience || 0;
        if (max) return exp >= min && exp <= max;
        return exp >= min; // For "10+" case
      });
    }
    if (filters.location) {
      filtered = filtered.filter(candidate =>
        candidate.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.education) {
      filtered = filtered.filter(candidate =>
        candidate.education?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }
    if (filters.availability) {
      filtered = filtered.filter(candidate =>
        candidate.availability === filters.availability
      );
    }
    if (filters.status) {
      filtered = filtered.filter(candidate =>
        candidate.status === filters.status
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'experience':
          comparison = (a.experience || 0) - (b.experience || 0);
          break;
        case 'date':
        default:
          comparison = (b.id || 0) - (a.id || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery, filters, sortBy, sortOrder]);

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditMode
      ? `http://localhost:5000/api/candidates/${editCandidateId}`
      : "http://localhost:5000/api/auth/candidate/register";

    const method = isEditMode ? axios.put : axios.post;

    // Format the data before sending
    const candidateData = isEditMode ? {
      name: newCandidate.name,
      email: newCandidate.email,
      contact: newCandidate.contact,
      city: newCandidate.city,
      skills: newCandidate.skills,
      experience: newCandidate.experience ? parseInt(newCandidate.experience) : 0,
      current_role: newCandidate.current_role || null,
      education: newCandidate.education || null,
      expected_salary: newCandidate.expected_salary || null,
      availability: newCandidate.availability || 'immediate',
      status: newCandidate.status || 'active'
    } : {
      // For new candidate registration, send all required fields
      name: newCandidate.name,
      email: newCandidate.email,
      contact: newCandidate.contact,
      city: newCandidate.city,
      skills: newCandidate.skills,
      username: newCandidate.username, // Username must be provided
      password: newCandidate.password  // Password must be provided
    };

    method(
      url,
      candidateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    )
      .then(() => {
        fetchCandidates();
        setNewCandidate({
          name: "",
          email: "",
          contact: "",
          city: "",
          skills: "",
          username: "",
          password: "",
          experience: "",
          current_role: "",
          education: "",
          expected_salary: "",
          availability: "immediate",
          status: "active"
        });
        setShowForm(false);
        setIsEditMode(false);
        setEditCandidateId(null);
        
        setToast({
          show: true,
          message: isEditMode 
            ? `${newCandidate.name}'s information has been updated successfully!` 
            : `Candidate ${newCandidate.name} has been added successfully!`,
          type: 'success'
        });
      })
      .catch((error) => {
        console.error("Error submitting candidate:", error);
        setToast({
          show: true,
          message: isEditMode 
            ? "Failed to update candidate information. Please try again." 
            : "Failed to add new candidate. Please try again.",
          type: 'error'
        });
      });
  };

  const confirmDelete = (id: number) => {
    const candidateToDelete = candidates.find(c => c.id === id);
    if (candidateToDelete) {
      setDeleteConfirmation({
        show: true,
        candidateId: id,
        candidateName: candidateToDelete.name
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      show: false,
      candidateId: 0,
      candidateName: ""
    });
  };

  const handleDelete = () => {
    const token = localStorage.getItem("token");
    const id = deleteConfirmation.candidateId;
    
    axios
      .delete(`http://localhost:5000/api/candidates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchCandidates();
        
        // Show success toast
        setToast({
          show: true,
          message: `Candidate ${deleteConfirmation.candidateName} has been deleted successfully!`,
          type: 'success'
        });
        
        // Close the confirmation dialog
        cancelDelete();
      })
      .catch((error) => {
        console.error("Error deleting candidate:", error);
        
        // Show error toast
        setToast({
          show: true,
          message: "Failed to delete candidate. Please try again.",
          type: 'error'
        });
        
        // Close the confirmation dialog
        cancelDelete();
      });
  };

  const handleEdit = (candidate: Candidate) => {
    setNewCandidate({
      name: candidate.name,
      email: candidate.email,
      contact: candidate.contact,
      city: candidate.city,
      skills: candidate.skills,
      username: "", // Not needed for edit
      password: "", // Not needed for edit
      experience: candidate.experience?.toString() || "",
      current_role: candidate.current_role || "",
      education: candidate.education || "",
      expected_salary: candidate.expected_salary?.toString() || "",
      availability: candidate.availability || "immediate",
      status: candidate.status || "active"
    });
    setEditCandidateId(candidate.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 group">
      <div className="p-5">
        {/* Header with Profile Image and Actions */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-300 flex-shrink-0 overflow-hidden">
              {candidate.profile_image ? (
                <img 
                  src={candidate.profile_image} 
                  alt={`${candidate.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-2xl text-blue-600" />
              )}
            </div>
            {candidate.status && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                candidate.status === 'shortlisted' ? 'bg-green-500' :
                candidate.status === 'rejected' ? 'bg-red-500' :
                'bg-blue-500'
              }`}>
                {candidate.status === 'shortlisted' ? (
                  <FaCheckCircle className="text-white text-xs" />
                ) : candidate.status === 'rejected' ? (
                  <FaTimesCircle className="text-white text-xs" />
                ) : (
                  <FaStar className="text-white text-xs" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 break-words">
                  {candidate.name}
                </h3>
                {candidate.current_role && (
                  <p className="text-sm text-gray-600 break-words">{candidate.current_role}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleEdit(candidate)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Edit candidate"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(candidate.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="Delete candidate"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Details */}
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${candidate.contact}`}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Call candidate"
            >
              <FaPhone className="mr-1.5" size={12} />
              {candidate.contact}
            </a>
            <a
              href={`mailto:${candidate.email}`}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Email candidate"
            >
              <FaEnvelope className="mr-1.5" size={12} />
              Email
            </a>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
              <FaMapMarkerAlt className="mr-1.5" size={12} />
              {candidate.city}
            </span>
            {candidate.experience && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700">
                <FaBriefcase className="mr-1.5" size={12} />
                {candidate.experience} years
              </span>
            )}
            {candidate.expected_salary && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                <FaMoneyBillWave className="mr-1.5" size={12} />
                {candidate.expected_salary}
              </span>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <FaTools className="mr-1.5 text-blue-600" size={12} />
              Key Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium group-hover:bg-blue-100 transition-colors duration-300"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          {candidate.education && (
            <div className="flex items-center text-sm text-gray-600">
              <FaGraduationCap className="mr-2 text-gray-400" size={14} />
              {candidate.education}
            </div>
          )}

          {/* Availability */}
          {candidate.availability && (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
              candidate.availability === 'immediate' ? 'bg-green-50 text-green-700' :
              candidate.availability === 'notice_period' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {candidate.availability === 'immediate' ? 'Available Immediately' :
               candidate.availability === 'notice_period' ? 'Available on Notice Period' :
               'Not Available'}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">
              {candidateApplications[candidate.id] && candidateApplications[candidate.id].length > 0 ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center">
                    <FaCheckCircle className="mr-1.5 text-green-500" size={14} />
                    Applied to {candidateApplications[candidate.id].length} job{candidateApplications[candidate.id].length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateApplications[candidate.id].map((jobId, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                      >
                        Job #{jobId}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">No applications yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setShowProfileModal(true);
                }}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Profile Modal Component
  const ProfileModal = () => {
    if (!selectedCandidate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Candidate Profile</h2>
            <button
              onClick={() => {
                setShowProfileModal(false);
                setSelectedCandidate(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedCandidate.profile_image ? (
                  <img 
                    src={selectedCandidate.profile_image} 
                    alt={`${selectedCandidate.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-3xl text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                {selectedCandidate.current_role && (
                  <p className="text-gray-600">{selectedCandidate.current_role}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidate.status && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      selectedCandidate.status === 'shortlisted' ? 'bg-green-50 text-green-700' :
                      selectedCandidate.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                    </span>
                  )}
                  {selectedCandidate.availability && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      selectedCandidate.availability === 'immediate' ? 'bg-green-50 text-green-700' :
                      selectedCandidate.availability === 'notice_period' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {selectedCandidate.availability === 'immediate' ? 'Available Immediately' :
                       selectedCandidate.availability === 'notice_period' ? 'Available on Notice Period' :
                       'Not Available'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${selectedCandidate.email}`} className="hover:text-blue-600">
                      {selectedCandidate.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${selectedCandidate.contact}`} className="hover:text-blue-600">
                      {selectedCandidate.contact}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedCandidate.city}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCandidate.experience && (
                  <div className="flex items-center text-gray-700">
                    <FaBriefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedCandidate.experience} years of experience
                  </div>
                )}
                {selectedCandidate.education && (
                  <div className="flex items-center text-gray-700">
                    <FaGraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedCandidate.education}
                  </div>
                )}
                {selectedCandidate.expected_salary && (
                  <div className="flex items-center text-gray-700">
                    <FaMoneyBillWave className="w-4 h-4 mr-2 text-gray-400" />
                    Expected Salary: {selectedCandidate.expected_salary}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Applications */}
            {selectedCandidate && candidateApplications[selectedCandidate.id] && candidateApplications[selectedCandidate.id].length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Job Applications</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <FaCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Applied to {candidateApplications[selectedCandidate.id].length} job{candidateApplications[selectedCandidate.id].length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidateApplications[selectedCandidate.id].map((jobId, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                        >
                          Job #{jobId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div>
          <label htmlFor="skillsFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Skills
          </label>
          <input
            type="text"
            id="skillsFilter"
            value={filters.skills}
            onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
            placeholder="Filter by skills..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="experienceFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <select
            id="experienceFilter"
            value={filters.experience}
            onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="2-5">2-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div>
          <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="locationFilter"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Filter by location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="educationFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            type="text"
            id="educationFilter"
            value={filters.education}
            onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value }))}
            placeholder="Filter by education..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="availabilityFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <select
            id="availabilityFilter"
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Availability</option>
            <option value="immediate">Available Immediately</option>
            <option value="notice_period">Available on Notice Period</option>
            <option value="not_available">Not Available</option>
          </select>
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCandidates = () => {
    if (filteredCandidates.length === 0) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 p-8 rounded-xl text-center">
          <FaUser className="text-4xl mb-4 mx-auto" />
          <p className="text-xl font-medium">No candidates found</p>
          <p className="text-blue-500 mt-2 text-sm">Try adjusting your filters or search criteria</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-6">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate?"
        itemName={deleteConfirmation.candidateName}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal />}

      {/* Edit/Add Candidate Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditMode(false);
                  setEditCandidateId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required fields - shown for both add and edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact *
                  </label>
                  <input
                    type="text"
                    value={newCandidate.contact}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newCandidate.city}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={newCandidate.skills}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Username and Password fields - only shown when adding new candidate */}
                {!isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newCandidate.username}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Enter username for candidate login"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newCandidate.password}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Enter password for candidate login"
                        minLength={6}
                      />
                      <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
                    </div>
                  </>
                )}

                {/* Additional fields - only shown in edit mode */}
                {isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        value={newCandidate.experience}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Role
                      </label>
                      <input
                        type="text"
                        value={newCandidate.current_role}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, current_role: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Education
                      </label>
                      <input
                        type="text"
                        value={newCandidate.education}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, education: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Salary
                      </label>
                      <input
                        type="text"
                        value={newCandidate.expected_salary}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, expected_salary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <select
                        value={newCandidate.availability}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, availability: e.target.value as 'immediate' | 'notice_period' | 'not_available' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="immediate">Available Immediately</option>
                        <option value="notice_period">Available on Notice Period</option>
                        <option value="not_available">Not Available</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={newCandidate.status}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, status: e.target.value as 'active' | 'shortlisted' | 'rejected' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditMode(false);
                    setEditCandidateId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {isEditMode ? 'Update Candidate' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, skills, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter size={14} />
              Filters
            </button>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <FaSort size={14} />
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'experience' | 'date')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Most Recent</option>
              <option value="name">Name</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Candidate Grid */}
      {renderCandidates()}

      {/* Add Candidate Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            setNewCandidate({
              name: "",
              email: "",
              contact: "",
              city: "",
              skills: "",
              username: "",
              password: "",
              experience: "",
              current_role: "",
              education: "",
              expected_salary: "",
              availability: "immediate",
              status: "active"
            });
            setIsEditMode(false);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center aspect-square w-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Add new candidate"
        >
          <FaPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default Candidates;
