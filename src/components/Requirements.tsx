import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Requirement {
  id: number;
  position: string;
  location: string;
  company: string;
  description: string;
  salary: number;
  skills_required: string;
  experience: number;
}

const Requirements: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [newRequirement, setNewRequirement] = useState<Requirement>({
    id: 0,
    position: "",
    location: "",
    company: "",
    description: "",
    salary: 0,
    skills_required: "",
    experience: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRequirement, setCurrentRequirement] = useState<Requirement | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    requirementId: 0,
    position: ""
  });

  const token = localStorage.getItem("token");

  const axiosWithAuth = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchRequirements = () => {
    axiosWithAuth
      .get("/requirements")
      .then((response) => {
        setRequirements(response.data);
      })
      .catch((error) => {
        console.error("Error fetching requirements:", error);
      });
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentRequirement) {
      // Update existing requirement
      axiosWithAuth
        .put(`/requirements/${currentRequirement.id}`, newRequirement)
        .then(() => {
          fetchRequirements();
          setNewRequirement({
            id: 0,
            position: "",
            location: "",
            company: "",
            description: "",
            salary: 0,
            skills_required: "",
            experience: 0,
          });
          setShowForm(false);
          setIsEditing(false);
          setCurrentRequirement(null);
          
          // Show success toast
          setToast({
            show: true,
            message: `${newRequirement.position} requirement has been updated successfully!`,
            type: 'success'
          });
        })
        .catch((error) => {
          console.error("Error updating requirement:", error);
          
          // Show error toast
          setToast({
            show: true,
            message: "Failed to update requirement. Please try again.",
            type: 'error'
          });
        });
    } else {
      // Add new requirement
      axiosWithAuth
        .post("/requirements", newRequirement)
        .then(() => {
          fetchRequirements();
          setNewRequirement({
            id: 0,
            position: "",
            location: "",
            company: "",
            description: "",
            salary: 0,
            skills_required: "",
            experience: 0,
          });
          setShowForm(false);
          
          // Show success toast
          setToast({
            show: true,
            message: `New requirement for ${newRequirement.position} has been added successfully!`,
            type: 'success'
          });
        })
        .catch((error) => {
          console.error("Error adding requirement:", error);
          
          // Show error toast
          setToast({
            show: true,
            message: "Failed to add requirement. Please try again.",
            type: 'error'
          });
        });
    }
  };

  const handleEdit = (requirement: Requirement) => {
    setCurrentRequirement(requirement);
    setNewRequirement(requirement);
    setIsEditing(true);
    setShowForm(true);
  };

  const confirmDelete = (id: number) => {
    const requirementToDelete = requirements.find(req => req.id === id);
    if (requirementToDelete) {
      setDeleteConfirmation({
        show: true,
        requirementId: id,
        position: requirementToDelete.position
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      show: false,
      requirementId: 0,
      position: ""
    });
  };

  const handleDelete = () => {
    const id = deleteConfirmation.requirementId;
    
    axiosWithAuth
      .delete(`/requirements/${id}`)
      .then(() => {
        fetchRequirements();
        
        // Show success toast
        setToast({
          show: true,
          message: `${deleteConfirmation.position} requirement has been deleted successfully!`,
          type: 'success'
        });
        
        // Close the confirmation dialog
        cancelDelete();
      })
      .catch((error) => {
        console.error("Error deleting requirement:", error);
        
        // Show error toast
        setToast({
          show: true,
          message: "Failed to delete requirement. Please try again.",
          type: 'error'
        });
        
        // Close the confirmation dialog
        cancelDelete();
      });
  };

  const resetForm = () => {
    setNewRequirement({
      id: 0,
      position: "",
      location: "",
      company: "",
      description: "",
      salary: 0,
      skills_required: "",
      experience: 0,
    });
    setIsEditing(false);
    setCurrentRequirement(null);
    setShowForm(false);
  };

  return (
    <div className="container py-4">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        title="Delete Requirement"
        message="Are you sure you want to delete this job requirement?"
        itemName={deleteConfirmation.position}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
      
      <div className="table-responsive mt-3">
        {requirements.length === 0 ? (
          <p className="text-center">No Requirements found</p>
        ) : (
          <table className="table table-striped shadow-sm rounded overflow-hidden">
            <thead className="table-dark text-center">
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
            <tbody className="text-center">
              {requirements.map((req) => (
                <tr key={req.id}>
                  <td>{req.position}</td>
                  <td>{req.location}</td>
                  <td>{req.company}</td>
                  <td>{req.description}</td>
                  <td>{req.salary}</td>
                  <td>{req.skills_required}</td>
                  <td>{req.experience}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <FaEdit
                        className="text-primary mx-2 cursor-pointer"
                        style={{ fontSize: "20px" }}
                        onClick={() => handleEdit(req)}
                      />
                      <FaTrash
                        className="text-danger mx-2 cursor-pointer"
                        style={{ fontSize: "20px" }}
                        onClick={() => confirmDelete(req.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Requirement Popup */}
      {showForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0, 0, 0, 0.4)" }}>
          <div className="card p-4 shadow-lg rounded" style={{ width: "400px", background: "#fff" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0">{isEditing ? "Edit Requirement" : "Add Requirement"}</h4>
              <FaTimes className="cursor-pointer" style={{ fontSize: "20px" }} onClick={resetForm} />
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" className="form-control mb-2" placeholder="Position" value={newRequirement.position} onChange={(e) => setNewRequirement({ ...newRequirement, position: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Location" value={newRequirement.location} onChange={(e) => setNewRequirement({ ...newRequirement, location: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Company" value={newRequirement.company} onChange={(e) => setNewRequirement({ ...newRequirement, company: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Description" value={newRequirement.description} onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })} required />
              <input type="number" className="form-control mb-2" placeholder="Salary" value={newRequirement.salary} onChange={(e) => setNewRequirement({ ...newRequirement, salary: parseFloat(e.target.value) })} required />
              <input type="text" className="form-control mb-2" placeholder="Skills Required" value={newRequirement.skills_required} onChange={(e) => setNewRequirement({ ...newRequirement, skills_required: e.target.value })} required />
              <input type="number" className="form-control mb-3" placeholder="Experience" value={newRequirement.experience} onChange={(e) => setNewRequirement({ ...newRequirement, experience: parseInt(e.target.value) })} required />
              <button type="submit" className="btn btn-primary w-100">{isEditing ? "Update" : "Add"} Requirement</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <div className="position-fixed" style={{ right: "20px", bottom: "20px" }}>
        <button className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: "60px", height: "60px", fontSize: "24px" }} onClick={() => setShowForm(true)}>
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Requirements;
