import React, { useState, useEffect, useMemo } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use consistent date format (YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const [empRes, attRes] = await Promise.all([
          api.get('/employees'),
          api.get(`/attendance?date=${dateStr}`)
        ]);
        
        setStats({
          totalEmployees: empRes.data.length,
          presentToday: attRes.data.length
        });
        setAttendanceData(attRes.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    const hourlyCounts = Array.from({ length: 16 }, (_, i) => {
      const hour = i + 6; // From 6 AM to 9 PM
      return {
        hour,
        time: `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}${hour >= 12 ? 'PM' : 'AM'}`,
        Arrivals: 0
      };
    });

    attendanceData.forEach(record => {
      const times = [record.morningIn, record.breakIn, record.breakOut, record.eveningOut]
        .filter(t => t && t !== "--");
      
      if (times.length > 0) {
        const sortedTimes = [...times].sort();
        const firstScan = sortedTimes[0];
        const hour = parseInt(firstScan.split(':')[0]);
        
        const dataPoint = hourlyCounts.find(d => d.hour === hour);
        if (dataPoint) {
           dataPoint.Arrivals++;
        }
      }
    });

    return hourlyCounts;
  }, [attendanceData]);

  const cards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: <Users />, color: 'var(--primary)' },
    { title: "Today's Attendance", value: stats.presentToday, icon: <Clock />, color: 'var(--success)' }
  ];

  if (loading) return <div className="loading-state">Loading dashboard analytics...</div>;

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
            <div className="chart-header flex-between">
                <div>
                    <h3>Today's Arrival Distribution</h3>
                    <p className="text-muted">Number of employees arriving per hour</p>
                </div>
                {stats.presentToday === 0 && <span className="text-muted small">No data yet</span>}
            </div>
            
            <div className="main-chart">
                {stats.presentToday > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="time" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip 
                                contentStyle={{ background: '#1a1c24', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="Arrivals" 
                                stroke="var(--primary)" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorArrivals)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-chart">
                        <BarChart2 size={48} className="text-muted" opacity={0.3} />
                        <p className="text-muted">Chart will populate once scans are recorded today.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon svg { width: 24px; height: 24px; }
        .stat-title { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; }
        .stat-value { font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }
        .margin-top { margin-top: 2rem; }
        .chart-container { padding: 2rem; min-height: 400px; }
        .chart-header { margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .chart-header h3 { margin-bottom: 0.25rem; font-size: 1.25rem; }
        .main-chart { margin-left: -20px; }
        .empty-chart { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; border: 1px dashed var(--border); border-radius: 16px; margin-left: 20px; }
        .loading-state { height: 80vh; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default Dashboard;
