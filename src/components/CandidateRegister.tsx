import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaUserTag, FaLock } from 'react-icons/fa';

const CandidateRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    city: '',
    skills: '',
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/candidate/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/candidatelogin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const inputFields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: <FaUser className="text-primary" /> },
    { name: 'email', label: 'Email Address', type: 'email', icon: <FaEnvelope className="text-primary" /> },
    { name: 'contact', label: 'Contact Number', type: 'text', icon: <FaPhone className="text-primary" /> },
    { name: 'city', label: 'City', type: 'text', icon: <FaMapMarkerAlt className="text-primary" /> },
    { name: 'skills', label: 'Skills (separated by commas)', type: 'text', icon: <FaTools className="text-primary" /> },
    { name: 'username', label: 'Username', type: 'text', icon: <FaUserTag className="text-primary" /> },
    { name: 'password', label: 'Password', type: 'password', icon: <FaLock className="text-primary" /> }
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <FaUserPlus className="text-primary mb-2" size={50} />
                  <h2 className="h3 fw-bold">Candidate Registration</h2>
                  <p className="text-muted">Create your candidate account</p>
                </div>

                {error && (
                  <div className="alert alert-danger mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {inputFields.map(({ name, label, type, icon }) => (
                      <div className="col-md-6" key={name}>
                        <div className="mb-3">
                          <label htmlFor={name} className="form-label">
                            {label}
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              {icon}
                            </span>
                            <input
                              type={type}
                              className="form-control"
                              id={name}
                              name={name}
                              value={(formData as any)[name]}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 mb-3">
                    <button type="submit" className="btn btn-primary w-100 py-2">
                      Register
                    </button>
                  </div>

                  <div className="text-center">
                    <Link to="/candidatelogin" className="text-primary text-decoration-none">
                      Already have an account? Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegister;
