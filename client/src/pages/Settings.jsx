import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings as SettingsIcon, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        systemName: "Attendance QR"
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Error fetching settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);


    if (loading) return <div className="animate-in">Loading settings...</div>;

    return (
        <div className="animate-in settings-page">
            <header className="page-header flex-between">
                <div>
                    <h1>System Settings</h1>
                    <p className="text-muted" style={{ margin: '15px 0' }}>Current system configuration and status.</p>
                </div>
            </header>

            {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-in`}>
                    {message.text}
                </div>
            )}

            <div className="settings-grid margin-top">
                <div className="glass-card settings-card">
                    <div className="card-header">
                        <SettingsIcon size={20} />
                        <h3>System Configuration</h3>
                    </div>
                    <div className="card-body">
                        <div className="status-info">
                            <div className="status-badge success">Active</div>
                            <strong>Flexible Attendance Mode</strong>
                            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                                The system is currently configured to automatically record attendance in the next available slot for each employee, regardless of the time of day.
                            </p>
                        </div>
                        <div className="info-list" style={{ marginTop: '1.5rem' }}>
                            <div className="info-item">
                                <span className="dot"></span>
                                <span>No fixed time windows required</span>
                            </div>
                            <div className="info-item">
                                <span className="dot"></span>
                                <span>Up to 4 scans recorded daily</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .settings-grid { display: grid; grid-template-columns: 1fr; }
                .settings-card { padding: 0; overflow: hidden; }
                .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.02); }
                .card-body { padding: 1.5rem; }
                
                .status-info { background: rgba(16, 185, 129, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.1); }
                .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin: 0 1rem 1rem 0; }
                .status-badge.success { background: var(--success); color: black; }
                
                .info-list { display: flex; flex-direction: column; gap: 1rem; }
                .info-item { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.95rem; }
                .dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; }
                
                .alert { padding: 1rem; border-radius: 12px; margin-top: 1rem; }
                .alert-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
                .alert-error { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
            `}</style>
        </div>
    );
};

export default Settings;
