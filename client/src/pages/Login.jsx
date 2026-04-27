import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Building, ArrowRight, ShieldCheck, User, QrCode } from 'lucide-react';
import api from '../api';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine initial tab from URL or default to 'admin'
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') === 'scanner' ? 'scanner' : 'admin';
    
    const [loginType, setLoginType] = useState(initialType);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Admin Form State (Super Admin & Company Admin)
    const [adminIdentifier, setAdminIdentifier] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Scanner Form State (Employee)
    const [scannerCompanyCode, setScannerCompanyCode] = useState('');
    const [scannerEmployeeId, setScannerEmployeeId] = useState('');
    const [scannerPassword, setScannerPassword] = useState('');

    useEffect(() => {
        const type = new URLSearchParams(location.search).get('type');
        if (type === 'scanner') setLoginType('scanner');
        else if (type === 'admin') setLoginType('admin');
    }, [location.search]);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check for Super Admin
            if (adminIdentifier === 'main-0001' && adminPassword === 'Shreyas@031103') {
                localStorage.setItem('superAdminPassword', adminPassword);
                localStorage.setItem('token', 'super-admin-session');
                localStorage.setItem('role', 'super-admin');
                navigate('/super-admin');
                window.location.reload();
                return;
            }

            // Regular Company Admin Login
            const res = await api.post('/auth/login', { 
                companyCode: adminIdentifier, 
                password: adminPassword 
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('company', JSON.stringify(res.data.company));
            localStorage.setItem('role', 'company-admin');
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleScannerLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/employees/login', { 
                companyCode: scannerCompanyCode, 
                employeeId: scannerEmployeeId, 
                scannerPassword 
            });
            
            if (res.data.success) {
                localStorage.setItem('scannerUser', JSON.stringify(res.data.employee));
                navigate('/scan');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Scanner login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-card">
                <div className="login-header">
                    <div className="logo-circle">
                        {loginType === 'admin' ? <ShieldCheck size={32} /> : <QrCode size={32} />}
                    </div>
                    <h1>{loginType === 'admin' ? 'Admin Portal' : 'Employee Scanner'}</h1>
                    <p className="text-muted">
                        {loginType === 'admin' 
                            ? 'Sign in as Super Admin or Company Admin' 
                            : 'Sign in to record your attendance'}
                    </p>
                </div>

                <div className="login-tabs">
                    <button 
                        className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
                        onClick={() => { setLoginType('admin'); setError(''); }}
                    >
                        Admin
                    </button>
                    <button 
                        className={`tab-btn ${loginType === 'scanner' ? 'active' : ''}`}
                        onClick={() => { setLoginType('scanner'); setError(''); }}
                    >
                        Scanner
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loginType === 'admin' ? (
                    <form onSubmit={handleAdminLogin} className="login-form">
                        <div className="input-group">
                            <label>Username / Company Code</label>
                            <div className="input-wrapper">
                                <Building size={18} className="icon" />
                                <input 
                                    type="text" 
                                    placeholder="main-0001 or TECH01" 
                                    value={adminIdentifier}
                                    onChange={(e) => setAdminIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="icon" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                            {loading ? 'Verifying...' : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleScannerLogin} className="login-form">
                        <div className="input-group">
                            <label>Company Code</label>
                            <div className="input-wrapper">
                                <Building size={18} className="icon" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. TECH01" 
                                    value={scannerCompanyCode}
                                    onChange={(e) => setScannerCompanyCode(e.target.value.toUpperCase())}
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
                                    value={scannerEmployeeId}
                                    onChange={(e) => setScannerEmployeeId(e.target.value.toUpperCase())}
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
                )}

                <div className="login-footer">
                    <p className="text-muted small">
                        {loginType === 'admin' 
                            ? 'Need an account? Contact the Super Admin.' 
                            : 'Forgot scanner password? Contact your admin.'}
                    </p>
                </div>
            </div>

            <style>{`
                .login-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .login-card {
                    width: 100%;
                    max-width: 500px;
                    padding: 1.5rem 2.5rem;
                    text-align: center;
                    animation: slideUp 0.6s ease-out;
                    height: 95vh;
                    overflow-y: auto;
                    scrollbar-width: none;
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
                    box-shadow: 0 8px 16px rgba(0, 242, 254, 0.2);
                }
                .login-header h1 { margin-bottom: 0.5rem; font-size: 1.75rem; }
                
                .login-tabs {
                    display: flex;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    padding: 4px;
                    margin: 2rem 0;
                    border: 1px solid var(--border);
                }
                .tab-btn {
                    flex: 1;
                    padding: 0.6rem;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    background: var(--primary);
                    color: white;
                }

                .login-form { text-align: left; }
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
                .input-wrapper input:focus { border-color: var(--primary); outline: none; background: rgba(255,255,255,0.05); }
                
                .login-btn { width: 100%; margin-top: 1rem; padding: 1rem; display: flex; justify-content: center; gap: 0.75rem; }
                .error-message { 
                    background: rgba(255, 71, 87, 0.1); 
                    color: #ff4757; 
                    padding: 0.75rem; 
                    border-radius: 10px; 
                    margin-bottom: 1.5rem; 
                    font-size: 0.875rem;
                }
                .login-footer { margin-top: 2rem; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .text-muted { font-size: 14px; line-height: 1.5; }
            `}</style>
        </div>
    );
};

export default Login;

