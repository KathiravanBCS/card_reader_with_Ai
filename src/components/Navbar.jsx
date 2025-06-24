import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './custom-navbar.css';

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="custom-navbar navbar fixed-bottom border-top d-flex justify-content-around">
      <Link to="/" className={`nav-link text-center${location.pathname === '/' ? ' active' : ''}`}>
        <i className="bi bi-house"></i>
        <div>Home</div>
      </Link>
      <Link to="/camera" className={`nav-link text-center${location.pathname === '/camera' ? ' active' : ''}`}>
        <i className="bi bi-camera"></i>
        <div>Add Card</div>
      </Link>
      {/* <Link to="/add-card" className="nav-link text-center">
        <i className="bi bi-plus-circle"></i>
        <div>Add Card</div>
      </Link> */}
      <Link to="/profile" className={`nav-link text-center${location.pathname === '/profile' ? ' active' : ''}`}>
        <i className="bi bi-person"></i>
        <div>Profile</div>
      </Link>
      <Link to="/settings" className={`nav-link text-center${location.pathname === '/settings' ? ' active' : ''}`}>
        <i className="bi bi-gear"></i>
        <div>Settings</div>
      </Link>
    </nav>
  );
};

export default Navbar;