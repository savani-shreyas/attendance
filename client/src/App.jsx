import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Camera, LogOut, Settings as SettingsIcon } from 'lucide-react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceLogs from './pages/AttendanceLogs';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { title: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
    { title: 'Scan QR', path: '/scanner', icon: <Camera size={20} /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">QR</div>
        <span>AMS Admin</span>
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
        <button className="nav-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<AttendanceLogs />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
