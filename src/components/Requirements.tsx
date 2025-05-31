import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaEdit, FaTrash, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaTools } from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Requirement {
  id: number;
  position: string;
  location: string;
  company: string;
  description: string;
  salary: number | string;
  skills_required: string;
  experience: number | string;
}

const Requirements: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRequirementId, setEditRequirementId] = useState<number | null>(null);
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
  const [newRequirement, setNewRequirement] = useState({
    position: "",
    location: "",
    company: "",
    description: "",
    salary: "",
    skills_required: "",
    experience: ""
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
    
    if (isEditMode && editRequirementId) {
      // Update existing requirement
      axiosWithAuth
        .put(`/requirements/${editRequirementId}`, newRequirement)
        .then(() => {
          fetchRequirements();
          setNewRequirement({
            position: "",
            location: "",
            company: "",
            description: "",
            salary: "",
            skills_required: "",
            experience: ""
          });
          setShowForm(false);
          setIsEditMode(false);
          setEditRequirementId(null);
          
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
            position: "",
            location: "",
            company: "",
            description: "",
            salary: "",
            skills_required: "",
            experience: ""
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
    setEditRequirementId(requirement.id);
    setNewRequirement(requirement);
    setIsEditMode(true);
    setShowForm(true);
  };

  const confirmDelete = (id: number, position: string) => {
    setDeleteConfirmation({
      show: true,
      requirementId: id,
      position: position
    });
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

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 hover:border-blue-100 group transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-300 flex-shrink-0">
          <span className="text-2xl font-bold text-blue-600">
            {requirement.company.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 break-words">
                {requirement.position}
              </h3>
              <h4 className="text-base text-gray-600 font-medium break-words">{requirement.company}</h4>
            </div>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => handleEdit(requirement)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit"
              >
                <FaEdit size={16} />
              </button>
              <button
                onClick={() => confirmDelete(requirement.id, requirement.position)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete"
              >
                <FaTrash size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
              <FaMapMarkerAlt className="mr-1.5" size={12} />
              {requirement.location}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors duration-300">
              <FaBriefcase className="mr-1.5" size={12} />
              {requirement.experience} years
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition-colors duration-300">
              <FaMoneyBillWave className="mr-1.5" size={12} />
              {requirement.salary}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
            {requirement.description}
          </p>

          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <FaTools className="mr-1.5 text-blue-600" size={12} />
              Required Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requirement.skills_required.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium group-hover:bg-blue-100 transition-colors duration-300"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => {
    if (requirements.length === 0) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 p-8 rounded-xl text-center">
          <FaBriefcase className="text-4xl mb-4 mx-auto" />
          <p className="text-xl font-medium">No job requirements posted yet</p>
          <p className="text-blue-500 mt-2 text-sm">Click the + button to add your first job requirement</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {requirements.map((requirement) => (
          <RequirementCard key={requirement.id} requirement={requirement} />
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
        title="Delete Requirement"
        message="Are you sure you want to delete this job requirement?"
        itemName={deleteConfirmation.position}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditMode ? "Edit Job Requirement" : "Add New Job Requirement"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditMode(false);
                  setNewRequirement({
                    position: "",
                    location: "",
                    company: "",
                    description: "",
                    salary: "",
                    skills_required: "",
                    experience: ""
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={newRequirement.position}
                    onChange={(e) => setNewRequirement({ ...newRequirement, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newRequirement.company}
                    onChange={(e) => setNewRequirement({ ...newRequirement, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={newRequirement.location}
                    onChange={(e) => setNewRequirement({ ...newRequirement, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={newRequirement.salary}
                    onChange={(e) => setNewRequirement({ ...newRequirement, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={newRequirement.experience}
                    onChange={(e) => setNewRequirement({ ...newRequirement, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills Required (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills_required"
                    value={newRequirement.skills_required}
                    onChange={(e) => setNewRequirement({ ...newRequirement, skills_required: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditMode(false);
                    setNewRequirement({
                      position: "",
                      location: "",
                      company: "",
                      description: "",
                      salary: "",
                      skills_required: "",
                      experience: ""
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditMode ? "Update Requirement" : "Add Requirement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderRequirements()}

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            setNewRequirement({
              position: "",
              location: "",
              company: "",
              description: "",
              salary: "",
              skills_required: "",
              experience: ""
            });
            setIsEditMode(false);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center aspect-square w-14"
        >
          <FaPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default Requirements;
