import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Candidate Registration</h2>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'email', label: 'Email Address', type: 'email' },
            { name: 'contact', label: 'Contact Number', type: 'text' },
            { name: 'city', label: 'City', type: 'text' },
            { name: 'skills', label: 'Skills', type: 'text' },
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' }
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                id={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/candidatelogin" className="text-indigo-600 font-medium hover:text-indigo-500 transition">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegister;
