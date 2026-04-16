import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    missedScans: 0,
    activeNow: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const empRes = await axios.get('http://localhost:5000/api/employees');
        const attRes = await axios.get(`http://localhost:5000/api/attendance?date=${new Date().toISOString().split('T')[0]}`);
        
        setStats({
          totalEmployees: empRes.data.length,
          presentToday: attRes.data.length,
          missedScans: empRes.data.length - attRes.data.length,
          activeNow: attRes.data.filter(a => a.eveningOut === "--").length
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: <Users />, color: 'var(--primary)' },
    { title: "Today's Attendance", value: stats.presentToday, icon: <Clock />, color: 'var(--success)' },
    { title: 'Absent / Late', value: stats.missedScans, icon: <AlertCircle />, color: 'var(--danger)' },
    { title: 'Active (On-site)', value: stats.activeNow, icon: <CheckCircle />, color: 'var(--secondary)' },
  ];

  return (
    <div className="animate-in">
      <header className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome back. Here's what's happening today.</p>
      </header>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className="glass-card stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-title">{card.title}</span>
              <h2 className="stat-value">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts margin-top">
        <div className="glass-card chart-container">
            <h3>Recent Scan Activity</h3>
            <div className="placeholder-chart">
                <p className="text-muted">Attendance analytics visualization would appear here.</p>
            </div>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-title { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; }
        .stat-value { font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }
        .margin-top { margin-top: 2rem; }
        .chart-container { padding: 2rem; min-height: 300px; }
        .placeholder-chart { height: 200px; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--border); border-radius: 12px; margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;
