import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUserCircle, FaBriefcase } from 'react-icons/fa';

interface NavHeaderProps {
  userType: 'candidate' | 'recruiter';
}

const NavHeader: React.FC<NavHeaderProps> = ({ userType }) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleHomeClick = () => {
    setShowConfirmation(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    setShowConfirmation(false);
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <div>
            <button 
              className="btn btn-outline-light rounded-pill d-flex align-items-center px-3"
              onClick={handleHomeClick}
              style={{ 
                transition: 'all 0.3s ease',
                borderWidth: '2px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <FaHome className="me-2" /> Home
            </button>
          </div>
          
          <div className="navbar-brand mx-auto d-flex align-items-center">
            {userType === 'candidate' 
              ? <FaUserCircle className="me-2 text-warning" size={24} /> 
              : <FaBriefcase className="me-2 text-warning" size={22} />
            }
            <span className="fw-bold">Job Portal</span>
            <span className="badge bg-light text-primary ms-2 text-uppercase" style={{ fontSize: '0.6rem' }}>
              {userType}
            </span>
          </div>
          
          {/* Empty div to help with flex spacing */}
          <div style={{ width: '105px' }}></div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirmation && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button type="button" className="btn-close" onClick={handleCancelLogout}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout? Any unsaved changes will be lost.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelLogout}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavHeader; 