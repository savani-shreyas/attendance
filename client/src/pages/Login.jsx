import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api';

const Login = () => {
    const [companyCode, setCompanyCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { companyCode, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('company', JSON.stringify(res.data.company));
            navigate('/');
            window.location.reload(); // Quick way to refresh auth state in App.jsx
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-card">
                <div className="login-header">
                    <div className="logo-circle">
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Company Login</h1>
                    <p className="text-muted">Enter your company credentials to access the dashboard</p>
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
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="icon" />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="text-muted small">Need an account? Contact the Super Admin.</p>
                </div>
            </div>

            <style>{`
                .login-container {
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
                    animation: slideUp 0.6s ease-out;
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
                .login-form { text-align: left; margin-top: 2.5rem; }
                .input-group { margin-bottom: 1.5rem; }
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
                    transition: all 0.2s;
                }
                .input-wrapper input:focus { border-color: var(--primary); outline: none; background: rgba(255,255,255,0.05); }
                .login-btn { width: 100%; margin-top: 2rem; padding: 1rem; display: flex; justify-content: center; gap: 0.75rem; }
                .error-message { 
                    background: rgba(255, 71, 87, 0.1); 
                    color: #ff4757; 
                    padding: 0.75rem; 
                    border-radius: 10px; 
                    margin-top: 1.5rem; 
                    font-size: 0.875rem;
                }
                .login-footer { margin-top: 2rem; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
