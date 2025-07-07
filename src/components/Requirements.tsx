import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaTools,
} from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const API_URL = import.meta.env.VITE_API_URL;

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, requirementId: 0, position: "" });

  const [newRequirement, setNewRequirement] = useState({
    position: "",
    location: "",
    company: "",
    description: "",
    salary: "",
    skills_required: "",
    experience: "",
  });

  const token = localStorage.getItem("token");
  const axiosWithAuth = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchRequirements = () => {
    axiosWithAuth
      .get("/requirements")
      .then((res) => setRequirements(res.data))
      .catch((err) => console.error("Error fetching requirements:", err));
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const closeToast = () => setToast((prev) => ({ ...prev, show: false }));

  const resetForm = () => {
    setNewRequirement({
      position: "",
      location: "",
      company: "",
      description: "",
      salary: "",
      skills_required: "",
      experience: "",
    });
    setIsEditMode(false);
    setEditRequirementId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const action = isEditMode && editRequirementId
      ? axiosWithAuth.put(`/requirements/${editRequirementId}`, newRequirement)
      : axiosWithAuth.post("/requirements", newRequirement);

    action
      .then(() => {
        fetchRequirements();
        resetForm();
        setToast({
          show: true,
          message: isEditMode
            ? `${newRequirement.position} updated successfully!`
            : `New requirement for ${newRequirement.position} added successfully!`,
          type: "success",
        });
      })
      .catch((err) => {
        console.error("Error submitting requirement:", err);
        setToast({
          show: true,
          message: isEditMode ? "Update failed. Try again." : "Addition failed. Try again.",
          type: "error",
        });
      });
  };

  const handleEdit = (req: Requirement) => {
  setEditRequirementId(req.id);
  setNewRequirement({
    ...req,
    salary: String(req.salary),
    experience: String(req.experience),
  });
  setIsEditMode(true);
  setShowForm(true);
};


  const confirmDelete = (id: number, position: string) =>
    setDeleteConfirmation({ show: true, requirementId: id, position });

  const cancelDelete = () =>
    setDeleteConfirmation({ show: false, requirementId: 0, position: "" });

  const handleDelete = () => {
    axiosWithAuth
      .delete(`/requirements/${deleteConfirmation.requirementId}`)
      .then(() => {
        fetchRequirements();
        setToast({
          show: true,
          message: `${deleteConfirmation.position} requirement deleted successfully!`,
          type: "success",
        });
        cancelDelete();
      })
      .catch((err) => {
        console.error("Error deleting requirement:", err);
        setToast({ show: true, message: "Failed to delete. Try again.", type: "error" });
        cancelDelete();
      });
  };

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border hover:border-blue-200 transition-transform transform hover:-translate-y-1">
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{requirement.position}</h3>
          <p className="text-sm text-gray-500">{requirement.company}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleEdit(requirement)} className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
          <button onClick={() => confirmDelete(requirement.id, requirement.position)} className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
          <FaMapMarkerAlt /> {requirement.location}
        </span>
        <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded">
          <FaBriefcase /> {requirement.experience} yrs
        </span>
        <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded">
          <FaMoneyBillWave /> {requirement.salary}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{requirement.description}</p>
      <div className="text-xs">
        <div className="mb-1 font-medium text-gray-700 flex items-center gap-1">
          <FaTools /> Required Skills:
        </div>
        <div className="flex flex-wrap gap-1">
          {requirement.skills_required.split(",").map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-6">
      <ToastNotification {...toast} onClose={closeToast} />
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        title="Delete Requirement"
        message="Are you sure you want to delete this requirement?"
        itemName={deleteConfirmation.position}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Job Requirements</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaPlus /> Add Requirement
        </button>
      </div>

      {requirements.length === 0 ? (
        <div className="text-center p-6 bg-blue-50 rounded-lg text-blue-600">
          <FaBriefcase size={32} className="mx-auto mb-2" />
          <p>No job requirements posted yet</p>
          <p className="text-sm">Click the + button to add one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((r) => (
            <RequirementCard key={r.id} requirement={r} />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit Requirement" : "Add New Requirement"}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["position", "company", "location", "salary", "experience", "skills_required"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize block mb-1">{field.replace("_", " ")}</label>
                  <input
                    type={field === "salary" || field === "experience" ? "number" : "text"}
                    value={(newRequirement as any)[field]}
                    onChange={(e) =>
                      setNewRequirement((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isEditMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requirements;
