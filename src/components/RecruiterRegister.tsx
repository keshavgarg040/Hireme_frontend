import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserTie, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const RecruiterRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/recruiter/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/recruiterlogin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const inputFields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: <FaUser className="text-success" /> },
    { name: 'email', label: 'Email Address', type: 'email', icon: <FaEnvelope className="text-success" /> },
    { name: 'password', label: 'Password', type: 'password', icon: <FaLock className="text-success" /> }
  ];

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <FaUserTie className="text-success mb-2" size={50} />
                  <h2 className="h3 fw-bold">Recruiter Registration</h2>
                  <p className="text-muted">Create your recruiter account</p>
                </div>

                {error && (
                  <div className="alert alert-danger mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {inputFields.map(({ name, label, type, icon }) => (
                    <div className="mb-3" key={name}>
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
                          value={formData[name as keyof typeof formData]}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 mt-4 mb-4"
                  >
                    Register
                  </button>

                  <div className="text-center">
                    <Link to="/recruiterlogin" className="text-success text-decoration-none">
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

export default RecruiterRegister;