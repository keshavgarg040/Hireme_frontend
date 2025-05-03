import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
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

interface Application {
  candidate_id: number;
  requirement_id: number;
  applied_date: string;
  status: string;
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateApplications, setCandidateApplications] = useState<{[candidateId: number]: number[]}>({}); 
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    contact: "",
    city: "",
    skills: "",
    username: "",
    password: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCandidateId, setEditCandidateId] = useState<number | null>(null);
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

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditMode
      ? `http://localhost:5000/candidates/${editCandidateId}`
      : "http://localhost:5000/api/auth/candidate/register";

    const method = isEditMode ? axios.put : axios.post;

    method(
      url,
      {
        ...newCandidate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
        });
        setShowForm(false);
        setIsEditMode(false);
        setEditCandidateId(null);
        
        // Show success toast
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
        
        // Show error toast
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
      .delete(`http://localhost:5000/candidates/${id}`, {
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
      username: "", 
      password: "", 
    });
    setEditCandidateId(candidate.id);
    setIsEditMode(true);
    setShowForm(true);
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
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate?"
        itemName={deleteConfirmation.candidateName}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
      
      <div className="table-responsive mt-3">
        {candidates.length === 0 ? (
          <p className="text-center">No Candidates found</p>
        ) : (
          <table className="table table-hover shadow-sm rounded overflow-hidden">
            <thead className="table-dark text-center">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Skills</th>
                <th>Contact</th>
                <th>City</th>
                <th>Applied Job IDs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.skills}</td>
                  <td>{candidate.contact}</td>
                  <td>{candidate.city}</td>
                  <td>
                    {candidateApplications[candidate.id]?.length > 0 
                      ? candidateApplications[candidate.id].join(', ')
                      : "No applications"}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <FaEdit
                        className="cursor-pointer text-primary mx-2"
                        style={{ fontSize: "20px" }}
                        onClick={() => handleEdit(candidate)}
                      />
                      <FaTrash
                        className="cursor-pointer text-danger mx-2"
                        style={{ fontSize: "20px" }}
                        onClick={() => confirmDelete(candidate.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
        >
          <div className="card p-4 shadow-lg rounded" style={{ width: "400px", background: "#fff" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0">{isEditMode ? "Edit Candidate" : "Add Candidate"}</h4>
              <FaTimes className="cursor-pointer" style={{ fontSize: "20px" }} onClick={() => {
                setShowForm(false);
                setIsEditMode(false);
                setNewCandidate({
                  name: "",
                  email: "",
                  contact: "",
                  city: "",
                  skills: "",
                  username: "",
                  password: "",
                });
              }} />
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" className="form-control mb-2" placeholder="Name" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} required />
              <input type="email" className="form-control mb-2" placeholder="Email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Contact" value={newCandidate.contact} onChange={(e) => setNewCandidate({ ...newCandidate, contact: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="City" value={newCandidate.city} onChange={(e) => setNewCandidate({ ...newCandidate, city: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Skills" value={newCandidate.skills} onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })} required />
              {!isEditMode && (
                <>
                  <input type="text" className="form-control mb-2" placeholder="Username" value={newCandidate.username} onChange={(e) => setNewCandidate({ ...newCandidate, username: e.target.value })} required />
                  <input type="password" className="form-control mb-3" placeholder="Password" value={newCandidate.password} onChange={(e) => setNewCandidate({ ...newCandidate, password: e.target.value })} required />
                </>
              )}
              <button type="submit" className="btn btn-primary w-100">{isEditMode ? "Update Candidate" : "Add Candidate"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <div className="position-fixed" style={{ right: "20px", bottom: "20px" }}>
        <button
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow"
          style={{ width: "60px", height: "60px", fontSize: "24px" }}
          onClick={() => {
            setNewCandidate({
              name: "",
              email: "",
              contact: "",
              city: "",
              skills: "",
              username: "",
              password: "",
            });
            setIsEditMode(false);
            setShowForm(true);
          }}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Candidates;
