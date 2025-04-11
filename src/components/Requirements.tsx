import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaTrash, FaEdit } from "react-icons/fa";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      })
      .catch((error) => {
        console.error("Error adding requirement:", error);
      });
  };

  const handleDelete = (id: number) => {
    axiosWithAuth
      .delete(`/requirements/${id}`)
      .then(() => {
        fetchRequirements();
      })
      .catch((error) => {
        console.error("Error deleting requirement:", error);
      });
  };

  return (
    <div className="container py-4">
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
                        onClick={() => alert("Edit functionality coming soon!")}
                      />
                      <FaTrash
                        className="text-danger mx-2 cursor-pointer"
                        style={{ fontSize: "20px" }}
                        onClick={() => handleDelete(req.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Requirement Popup */}
      {showForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0, 0, 0, 0.4)" }}>
          <div className="card p-4 shadow-lg rounded" style={{ width: "400px", background: "#fff" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0">Add Requirement</h4>
              <FaTimes className="cursor-pointer" style={{ fontSize: "20px" }} onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" className="form-control mb-2" placeholder="Position" value={newRequirement.position} onChange={(e) => setNewRequirement({ ...newRequirement, position: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Location" value={newRequirement.location} onChange={(e) => setNewRequirement({ ...newRequirement, location: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Company" value={newRequirement.company} onChange={(e) => setNewRequirement({ ...newRequirement, company: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Description" value={newRequirement.description} onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })} required />
              <input type="number" className="form-control mb-2" placeholder="Salary" value={newRequirement.salary} onChange={(e) => setNewRequirement({ ...newRequirement, salary: parseFloat(e.target.value) })} required />
              <input type="text" className="form-control mb-2" placeholder="Skills Required" value={newRequirement.skills_required} onChange={(e) => setNewRequirement({ ...newRequirement, skills_required: e.target.value })} required />
              <input type="number" className="form-control mb-3" placeholder="Experience" value={newRequirement.experience} onChange={(e) => setNewRequirement({ ...newRequirement, experience: parseInt(e.target.value) })} required />
              <button type="submit" className="btn btn-primary w-100">Add Requirement</button>
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
