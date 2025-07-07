import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaEnvelope, FaLock } from 'react-icons/fa';
import ToastNotification from './ToastNotification';
const API_URL = import.meta.env.VITE_API_URL;

const RecruiterLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/recruiter/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Show success toast
      setToast({
        show: true,
        message: "Login successful! Redirecting to your dashboard...",
        type: "success"
      });
      
      // Set a delay before redirecting to allow the toast to be visible
      setTimeout(() => {
        navigate('/candidatedashboard');
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      
      // Show error toast
      setToast({
        show: true,
        message: "Login failed. Please check your credentials.",
        type: "error"
      });
    }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <ToastNotification
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={closeToast}
      />
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <FaBriefcase className="text-success mb-2" size={60} />
                  <h2 className="h3 fw-bold">Recruiter Login</h2>
                  <p className="text-muted">Access your recruiter account</p>
                </div>

                {error && (
                  <div className="alert alert-danger mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaEnvelope className="text-success" />
                      </span>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaLock className="text-success" />
                      </span>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 mb-4"
                  >
                    Sign In
                  </button>

                  <div className="text-center">
                    <Link
                      to="/recruiterregister"
                      className="text-success text-decoration-none"
                    >
                      Don't have an account? Sign up
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

export default RecruiterLogin;