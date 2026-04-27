import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Camera, LogOut, Settings as SettingsIcon, ShieldEllipsis, Scan } from 'lucide-react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceLogs from './pages/AttendanceLogs';
import Scanner from './pages/Scanner';
import EmployeeScan from './pages/EmployeeScan';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

const SuperAdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  const superPass = localStorage.getItem('superAdminPassword');
  if (role !== 'super-admin' || superPass !== 'Shreyas@031103') {
    return <Navigate to="/login" />;
  }
  return children;
};

const Sidebar = ({ onLogout, companyName }) => {
  const location = useLocation();
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { title: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  // Don't show sidebar on login, scanner-login, scan, and super admin pages
  if (['/login', '/super-admin', '/scanner-login', '/scan'].includes(location.pathname)) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">QR</div>
        <div>
            <span>{companyName || 'AMS Admin'}</span>
            <p className="small text-primary" style={{ fontSize: '0.7rem', marginTop: '10px' }}>Company Dashboard</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link to="/login?type=scanner" className="nav-item">
            <Scan size={20} />
            <span>Employee Scan</span>
        </Link>
        <button className="nav-item logout" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [company, setCompany] = useState(JSON.parse(localStorage.getItem('company') || 'null'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedCompany = JSON.parse(localStorage.getItem('company') || 'null');
    setIsLoggedIn(!!token);
    setCompany(storedCompany);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('company');
    localStorage.removeItem('role');
    localStorage.removeItem('superAdminPassword');
    localStorage.removeItem('scannerUser');
    setIsLoggedIn(false);
    setCompany(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <AppContent onLogout={handleLogout} company={company} />
    </Router>
  );
}

// Separate component to use useLocation()
const AppContent = ({ onLogout, company }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/super-admin', '/scanner-login', '/scan'].includes(location.pathname);

  return (
    <div className="app-container">
        <Sidebar onLogout={onLogout} companyName={company?.name} />
        <main className={`content ${isAuthPage ? 'full-width' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
            <Route path="/scanner-login" element={<Navigate to="/login?type=scanner" replace />} />
            <Route path="/scan" element={<EmployeeScan />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><AttendanceLogs /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
  );
}

export default App;
