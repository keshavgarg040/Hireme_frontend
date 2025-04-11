import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

interface Candidate {
  id: number;
  name: string;
  email: string;
  skills: string;
  phone: string;
  experience: string;
  city: string;
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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
      })
      .catch((error) => {
        console.error("Error fetching candidates:", error);
      });
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    axios
      .post("http://localhost:5000/api/auth/candidate/register", newCandidate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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
      })
      .catch((error) => {
        console.error("Error adding candidate:", error);
      });
  };

  const handleDelete = (id: number) => {
    const token = localStorage.getItem("token");

    axios
      .delete(`http://localhost:5000/candidates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchCandidates();
      })
      .catch((error) => {
        console.error("Error deleting candidate:", error);
      });
  };

  return (
    <div className="container py-4">
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
                <th>Phone</th>
                <th>Experience</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.skills}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.experience}</td>
                  <td>{candidate.city}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <FaEdit className="cursor-pointer text-primary mx-2" style={{ fontSize: "20px" }} />
                      <FaTrash
                        className="cursor-pointer text-danger mx-2"
                        style={{ fontSize: "20px" }}
                        onClick={() => handleDelete(candidate.id)}
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
              <h4 className="m-0">Add Candidate</h4>
              <FaTimes className="cursor-pointer" style={{ fontSize: "20px" }} onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" className="form-control mb-2" placeholder="Name" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} required />
              <input type="email" className="form-control mb-2" placeholder="Email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Contact" value={newCandidate.contact} onChange={(e) => setNewCandidate({ ...newCandidate, contact: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="City" value={newCandidate.city} onChange={(e) => setNewCandidate({ ...newCandidate, city: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Skills" value={newCandidate.skills} onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Username" value={newCandidate.username} onChange={(e) => setNewCandidate({ ...newCandidate, username: e.target.value })} required />
              <input type="password" className="form-control mb-3" placeholder="Password" value={newCandidate.password} onChange={(e) => setNewCandidate({ ...newCandidate, password: e.target.value })} required />
              <button type="submit" className="btn btn-primary w-100">Add Candidate</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <div className="position-fixed" style={{ right: "20px", bottom: "20px" }}>
        <button
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow"
          style={{ width: "60px", height: "60px", fontSize: "24px" }}
          onClick={() => setShowForm(true)}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Candidates;
