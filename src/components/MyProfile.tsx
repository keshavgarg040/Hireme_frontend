import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaTimes } from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Candidate {
  id: number;
  name: string;
  email: string;
  skills: string;
  contact: string;
  city: string;
}

const MyProfile: React.FC = () => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    skills: "",
    contact: "",
    city: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    candidateName: "",
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/candidates/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidate(res.data);
      setUpdatedData(res.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/candidates/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const confirmDelete = () => {
    if (candidate) {
      setDeleteConfirmation({
        show: true,
        candidateName: candidate.name,
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      show: false,
      candidateName: "",
    });
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete("http://localhost:5000/api/candidates/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Show success toast and redirect after a short delay
      setToast({
        show: true,
        message: "Your profile has been deleted successfully.",
        type: 'success'
      });
      
      // Close the confirmation dialog
      cancelDelete();
      
      // Wait a moment before redirecting so user can see the toast
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "http://localhost:5173/";
      }, 2000);
    } catch (err) {
      console.error("Error deleting profile", err);
      
      // Show error toast
      setToast({
        show: true,
        message: "Failed to delete profile. Please try again.",
        type: 'error'
      });
      
      // Close the confirmation dialog
      cancelDelete();
    }
  };

  if (!candidate) return <p className="text-center mt-4">Loading profile...</p>;

  // Helper function to create colored skill badges
  const renderSkills = (skillsString: string) => {
    const colors = ['primary', 'success', 'danger', 'warning', 'info'];
    return skillsString.split(',').map((skill, index) => (
      <span 
        key={index} 
        className={`badge bg-${colors[index % colors.length]} me-2 mb-2`}
        style={{ fontSize: '0.9rem', padding: '0.5rem 0.7rem' }}
      >
        {skill.trim()}
      </span>
    ));
  };

  // Button styles with hover effects
  const actionButtonStyle = {
    cursor: 'pointer',
    fontSize: '22px',
    transition: 'all 0.3s ease',
    padding: '8px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    margin: '0 5px'
  };

  return (
    <div className="container py-5">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        title="Delete Your Profile"
        message="Are you sure you want to delete your profile? This action cannot be undone."
        itemName={deleteConfirmation.candidateName}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
      
      {!editMode ? (
        <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
          <div className="card-header bg-primary text-white p-4">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="m-0">Candidate Profile</h3>
              <div className="d-flex">
                <div 
                  className="btn btn-outline-light me-2" 
                  style={actionButtonStyle as React.CSSProperties}
                  onClick={() => setEditMode(true)} 
                  title="Edit Profile"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaEdit />
                </div>
                <div 
                  className="btn btn-outline-danger" 
                  style={actionButtonStyle as React.CSSProperties}
                  onClick={confirmDelete} 
                  title="Delete Profile"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaTrash />
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-body p-5">
            <div className="row g-4">
              <div className="col-md-4 text-center border-end">
                <div className="py-4">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '160px', height: '160px' }}>
                    <FaUser style={{ fontSize: '85px', color: '#6c757d' }} />
                  </div>
                  <h4 className="mt-3 mb-0">{candidate.name}</h4>
                  <p className="text-muted">Candidate</p>
                </div>
              </div>
              
              <div className="col-md-8">
                <div className="p-4">
                  <h4 className="border-bottom pb-3 mb-4">Personal Information</h4>
                  
                  <div className="mb-4 d-flex align-items-center">
                    <div className="me-4" style={{ width: '40px', textAlign: 'center' }}>
                      <FaEnvelope className="text-primary" style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Email</p>
                      <p className="fs-5 mb-0">{candidate.email}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 d-flex align-items-center">
                    <div className="me-4" style={{ width: '40px', textAlign: 'center' }}>
                      <FaPhone className="text-primary" style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Contact</p>
                      <p className="fs-5 mb-0">{candidate.contact}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 d-flex align-items-center">
                    <div className="me-4" style={{ width: '40px', textAlign: 'center' }}>
                      <FaMapMarkerAlt className="text-primary" style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Location</p>
                      <p className="fs-5 mb-0">{candidate.city}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 d-flex">
                    <div className="me-4" style={{ width: '40px', textAlign: 'center' }}>
                      <FaTools className="text-primary" style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <p className="text-muted mb-0 small">Skills</p>
                      <div className="d-flex flex-wrap mt-2">
                        {renderSkills(candidate.skills)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0, 0, 0, 0.6)", zIndex: 1050 }}>
          <div className="card border-0 shadow-lg rounded-3" style={{ width: "500px", maxWidth: "95%" }}>
            <div className="card-header bg-primary text-white p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">Edit Profile</h4>
                <div 
                  className="btn btn-outline-light p-1 d-flex align-items-center justify-content-center" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  onClick={() => setEditMode(false)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaTimes style={{ fontSize: "16px" }} />
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={updatedData.name} 
                    onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={updatedData.email} 
                    onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Contact</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={updatedData.contact} 
                    onChange={(e) => setUpdatedData({ ...updatedData, contact: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={updatedData.city} 
                    onChange={(e) => setUpdatedData({ ...updatedData, city: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Skills (separate with commas)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={updatedData.skills} 
                    onChange={(e) => setUpdatedData({ ...updatedData, skills: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary px-4" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
