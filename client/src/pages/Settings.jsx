import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings as SettingsIcon, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        morningStart: 8, morningEnd: 11,
        breakInStart: 12, breakInEnd: 13,
        breakOutStart: 14, breakOutEnd: 15,
        eveningStart: 17, eveningEnd: 20,
        testMode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Error fetching settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('http://localhost:5000/api/settings', settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-in">Loading settings...</div>;

    return (
        <div className="animate-in settings-page">
            <header className="page-header flex-between">
                <div>
                    <h1>System Settings</h1>
                    <p className="text-muted">Configure attendance time windows and system behavior.</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
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
                        <h3>Time Slots (24h Format)</h3>
                    </div>
                    <div className="card-body">
                        <div className="slot-config">
                            <label>Morning Clock-In</label>
                            <div className="range-inputs">
                                <input type="number" value={settings.morningStart} onChange={(e) => setSettings({...settings, morningStart: parseInt(e.target.value)})} min="0" max="23"/>
                                <span>to</span>
                                <input type="number" value={settings.morningEnd} onChange={(e) => setSettings({...settings, morningEnd: parseInt(e.target.value)})} min="0" max="23"/>
                            </div>
                        </div>
                        <div className="slot-config">
                            <label>Break-In (Lunch Start)</label>
                            <div className="range-inputs">
                                <input type="number" value={settings.breakInStart} onChange={(e) => setSettings({...settings, breakInStart: parseInt(e.target.value)})} min="0" max="23"/>
                                <span>to</span>
                                <input type="number" value={settings.breakInEnd} onChange={(e) => setSettings({...settings, breakInEnd: parseInt(e.target.value)})} min="0" max="23"/>
                            </div>
                        </div>
                        <div className="slot-config">
                            <label>Break-Out (Lunch End)</label>
                            <div className="range-inputs">
                                <input type="number" value={settings.breakOutStart} onChange={(e) => setSettings({...settings, breakOutStart: parseInt(e.target.value)})} min="0" max="23"/>
                                <span>to</span>
                                <input type="number" value={settings.breakOutEnd} onChange={(e) => setSettings({...settings, breakOutEnd: parseInt(e.target.value)})} min="0" max="23"/>
                            </div>
                        </div>
                        <div className="slot-config">
                            <label>Evening Clock-Out</label>
                            <div className="range-inputs">
                                <input type="number" value={settings.eveningStart} onChange={(e) => setSettings({...settings, eveningStart: parseInt(e.target.value)})} min="0" max="23"/>
                                <span>to</span>
                                <input type="number" value={settings.eveningEnd} onChange={(e) => setSettings({...settings, eveningEnd: parseInt(e.target.value)})} min="0" max="23"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card settings-card mode-card">
                    <div className="card-header">
                        <AlertTriangle size={20} color="var(--secondary)" />
                        <h3>Development Mode</h3>
                    </div>
                    <div className="card-body">
                        <div className="toggle-group">
                            <div className="toggle-info">
                                <strong>Enable Test Mode</strong>
                                <p className="text-muted">Allows scanning QR codes at any time of day for testing purposes. It will automatically fill the next available slot.</p>
                            </div>
                            <button className={`toggle-btn ${settings.testMode ? 'active' : ''}`} onClick={() => setSettings({...settings, testMode: !settings.testMode})}>
                                {settings.testMode ? <ToggleRight size={32} color="var(--success)" /> : <ToggleLeft size={32} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
                .settings-card { padding: 0; overflow: hidden; }
                .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.02); }
                .card-body { padding: 1.5rem; }
                
                .slot-config { margin-bottom: 1.5rem; }
                .slot-config label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-muted); }
                .range-inputs { display: flex; align-items: center; gap: 1rem; }
                .range-inputs input { width: 80px; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: white; text-align: center; }
                
                .toggle-group { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
                .toggle-btn { background: none; border: none; cursor: pointer; }
                
                .alert { padding: 1rem; border-radius: 12px; margin-top: 1rem; }
                .alert-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
                .alert-error { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
            `}</style>
        </div>
    );
};

export default Settings;
