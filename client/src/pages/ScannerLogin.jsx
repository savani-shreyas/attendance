import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Building, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import api from '../api';

const ScannerLogin = () => {
    const [companyCode, setCompanyCode] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [scannerPassword, setScannerPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/employees/login', { 
                companyCode, 
                employeeId, 
                scannerPassword 
            });
            
            if (res.data.success) {
                // Store employee scanner session
                localStorage.setItem('scannerUser', JSON.stringify(res.data.employee));
                navigate('/scan');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scanner-login-container">
            <div className="login-card glass-card">
                <div className="login-header">
                    <div className="logo-circle">
                        <QrCode size={32} />
                    </div>
                    <h1>Employee Scanner</h1>
                    <p className="text-muted">Sign in to record your attendance</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Company Code</label>
                        <div className="input-wrapper">
                            <Building size={18} className="icon" />
                            <input 
                                type="text" 
                                placeholder="e.g. TECH01" 
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Employee ID</label>
                        <div className="input-wrapper">
                            <User size={18} className="icon" />
                            <input 
                                type="text" 
                                placeholder="e.g. EMP001" 
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Scanner Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="icon" />
                            <input 
                                type="password" 
                                placeholder="••••" 
                                value={scannerPassword}
                                onChange={(e) => setScannerPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Verifying...' : (
                            <>
                                Continue to Scanner <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="text-muted small">Forgot your scanner password? Contact your admin.</p>
                </div>
            </div>

            <style>{`
                .scanner-login-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top left, #1a2238 0%, #0c0e14 100%);
                    padding: 2rem;
                }
                .login-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 3rem;
                    text-align: center;
                }
                .logo-circle {
                    width: 64px;
                    height: 64px;
                    background: var(--primary);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .login-header h1 { margin-bottom: 0.5rem; font-size: 1.75rem; }
                .login-form { text-align: left; margin-top: 2rem; }
                .input-group { margin-bottom: 1.25rem; }
                .input-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
                .input-wrapper { position: relative; }
                .input-wrapper .icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .input-wrapper input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                }
                .login-btn { width: 100%; margin-top: 1.5rem; padding: 1rem; display: flex; justify-content: center; gap: 0.75rem; }
                .error-message { 
                    background: rgba(255, 71, 87, 0.1); 
                    color: #ff4757; 
                    padding: 0.75rem; 
                    border-radius: 10px; 
                    margin-top: 1.5rem; 
                    font-size: 0.875rem;
                }
                .login-footer { margin-top: 2rem; }
            `}</style>
        </div>
    );
};

export default ScannerLogin;
