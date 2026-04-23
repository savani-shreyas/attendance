import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Building, Key, Trash2, CheckCircle2, Lock, Edit2, X, RefreshCw, Eye, EyeOff, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api';

const SuperAdmin = () => {
    const [superPass, setSuperPass] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    const [companies, setCompanies] = useState([]);
    const [showPasswords, setShowPasswords] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    
    // Create Form State
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ id: '', companyName: '', password: '' });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedQR, setSelectedQR] = useState(null);

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar looking chars like I, O, 0, 1
        return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    // Auto-generate password on mount or tab switch
    useEffect(() => {
        if (!password) setPassword(generateRandomPassword());
    }, []);

    const handleAuth = (e) => {
        e.preventDefault();
        if (superPass === 'admin123') {
            setIsAuthorized(true);
            fetchCompanies();
        } else {
            alert('Invalid Super Admin Password');
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await api.get(`/auth/companies?superAdminPassword=${superPass}`);
            setCompanies(res.data);
        } catch (err) {
            console.error("Error fetching companies:", err);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/auth/register', {
                companyName,
                password,
                superAdminPassword: superPass
            });
            setMessage({ type: 'success', text: res.data.message });
            setCompanyName('');
            setPassword(generateRandomPassword()); // Generate new for next
            fetchCompanies();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to connect to server';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (comp) => {
        setEditData({ id: comp._id, companyName: comp.companyName, password: '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateCompany = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/auth/companies/${editData.id}`, {
                companyName: editData.companyName,
                password: editData.password,
                superAdminPassword: superPass
            });
            setIsEditModalOpen(false);
            fetchCompanies();
            alert("Company details updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"? ALL DATA FOR THIS COMPANY WILL BE DELETED.`)) return;
        try {
            await api.delete(`/auth/companies/${id}`, { data: { superAdminPassword: superPass } });
            fetchCompanies();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete company");
        }
    };

    const downloadQR = (code, name) => {
        const canvas = document.getElementById(`qr-${code}`);
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!isAuthorized) {
        return (
            <div className="super-admin-auth">
                <div className="glass-card auth-card">
                    <ShieldAlert size={48} className="text-primary margin-bottom" />
                    <h2>Super Admin Access</h2>
                    <p className="text-muted">Enter the master password to manage company accounts.</p>
                    <form onSubmit={handleAuth} className="margin-top">
                        <input 
                            type="password" 
                            placeholder="Master password..." 
                            className="master-input"
                            value={superPass}
                            onChange={(e) => setSuperPass(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary full-width margin-top">Authorize</button>
                    </form>
                </div>
                <style>{`
                    .super-admin-auth { height: 80vh; display: flex; align-items: center; justify-content: center; }
                    .auth-card { padding: 3rem; text-align: center; max-width: 400px; }
                    .master-input { width: 100%; margin-bottom: 15px; padding: 0.875rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; color: white; margin-top: 1rem; }
                    .full-width { width: 100%; }
                    .margin-bottom { margin-bottom: 1.5rem; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <header className="page-header">
                <h1 style={{ textAlign: 'center' }}>Super Admin Dashboard</h1>
                <p className="text-muted" style={{ textAlign: 'center' }}>Manage the multi-company attendance infrastructure.</p>
            </header>

            <div className="super-admin-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    <Plus size={18} /> Create Company
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('list'); fetchCompanies(); }}
                >
                    <Building size={18} /> Company List ({companies.length})
                </button>
            </div>

            <div className="super-admin-grid">
                {activeTab === 'create' ? (
                    <div className="glass-card create-section">
                        <div className="section-header">
                            <Plus size={24} className="text-primary" />
                            <h3>Create New Company</h3>
                        </div>
                        
                        <form onSubmit={handleCreateCompany} className="company-form">
                            <div className="input-field">
                                <label>Company Display Name</label>
                                <div className="field-row">
                                    <Building size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Acme Corporation" 
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-field">
                                <label>Autogenerated Password</label>
                                <div className="field-row">
                                    <Lock size={18} />
                                    <input 
                                        type="text" 
                                        value={password}
                                        readOnly
                                        className="readonly-input"
                                    />
                                    <button 
                                        type="button" 
                                        className="refresh-btn" 
                                        onClick={() => setPassword(generateRandomPassword())}
                                        title="Regenerate Password"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                                <p className="field-hint">4-character secure password will be assigned.</p>
                            </div>

                            {message.text && (
                                <div className={`message-box ${message.type}`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <button className="btn btn-primary full-width" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Company Account'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-card list-section">
                        <div className="section-header space-between">
                            <div className="title-group">
                                <Building size={24} className="text-secondary" />
                                <h3>Registered Companies</h3>
                            </div>
                            <button 
                                className="toggle-view-btn" 
                                onClick={() => setShowPasswords(!showPasswords)}
                                title={showPasswords ? "Hide Passwords" : "Show Passwords"}
                            >
                                {showPasswords ? (
                                    <><EyeOff size={16} /> Hide Passwords</>
                                ) : (
                                    <><Eye size={16} /> View Passwords</>
                                )}
                            </button>
                        </div>

                        {companies.length === 0 ? (
                            <div className="empty-state">
                                <Building size={48} opacity={0.2} />
                                <p className="text-muted">No companies found.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Password</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map(comp => (
                                            <tr key={comp._id}>
                                                <td><strong>{comp.companyName}</strong></td>
                                                <td><span className="code-badge">{comp.companyCode}</span></td>
                                                <td>
                                                    <div className="password-display">
                                                        <span className={`password-badge ${!comp.displayPassword ? 'missing' : ''}`}>
                                                            {(showPasswords || visiblePasswords[comp._id]) 
                                                                ? (comp.displayPassword || 'Edit to set')
                                                                : '••••'
                                                            }
                                                        </span>
                                                        <button 
                                                            className="eye-btn"
                                                            onClick={() => setVisiblePasswords(prev => ({...prev, [comp._id]: !prev[comp._id]}))}
                                                        >
                                                            {(showPasswords || visiblePasswords[comp._id]) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                                                <td className="actions-cell">
                                                    <button 
                                                        className="action-btn"
                                                        onClick={() => setSelectedQR(comp)}
                                                        title="View Company QR"
                                                    >
                                                        <QrCode size={16} /> QR
                                                    </button>
                                                    <button 
                                                        className="action-btn"
                                                        onClick={() => openEditModal(comp)}
                                                    >
                                                        <Edit2 size={16} /> Edit
                                                    </button>
                                                    <button 
                                                        className="action-btn danger"
                                                        onClick={() => handleDeleteCompany(comp._id, comp.companyName)}
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-in">
                        <div className="modal-header">
                            <h3>Edit Company Details</h3>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCompany} className="company-form">
                            <div className="input-field">
                                <label>Company Name</label>
                                <div className="field-row">
                                    <Building size={18} />
                                    <input 
                                        type="text" 
                                        value={editData.companyName}
                                        onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="input-field">
                                <label>Reset Password (leave blank for no change)</label>
                                <div className="field-row">
                                    <Lock size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter new 4-char password..."
                                        value={editData.password}
                                        onChange={(e) => setEditData({...editData, password: e.target.value.toUpperCase().slice(0, 4)})}
                                    />
                                    <button 
                                        type="button" 
                                        className="refresh-btn" 
                                        onClick={() => setEditData({...editData, password: generateRandomPassword()})}
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {selectedQR && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content qr-modal animate-in">
                        <div className="modal-header">
                            <h3>Company QR Code</h3>
                            <button className="close-btn" onClick={() => setSelectedQR(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="qr-display-wrapper">
                            <QRCodeCanvas 
                                id={`qr-${selectedQR.companyCode}`}
                                value={selectedQR.companyCode} 
                                size={256}
                                level={"H"}
                                includeMargin={true}
                            />
                            <div className="qr-meta">
                                <h2>{selectedQR.companyName}</h2>
                                <span className="code-badge">{selectedQR.companyCode}</span>
                            </div>
                        </div>
                        <p className="text-muted small margin-top">Employees can scan this code to record their attendance.</p>
                        <button 
                            className="btn btn-primary full-width margin-top" 
                            onClick={() => downloadQR(selectedQR.companyCode, selectedQR.companyName)}
                        >
                            <Download size={20} /> Download QR Image
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .super-admin-tabs { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; }
                .tab-btn { 
                    padding: 0.75rem 1.5rem; 
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid var(--border); 
                    border-radius: 12px; 
                    color: var(--text-muted); 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .tab-btn:hover { background: rgba(255,255,255,0.06); color: white; }
                .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }

                .super-admin-grid { display: grid; gap: 2rem; max-width: 800px; margin: 2rem auto 0; }
                .create-section, .list-section { padding: 2rem; width: 100%; }
                
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
                .section-header.space-between { justify-content: space-between; }
                .title-group { display: flex; align-items: center; gap: 0.75rem; }
                .section-header h3 { margin: 0; font-size: 1.25rem; }

                .toggle-view-btn { 
                    background: rgba(255,255,255,0.05); 
                    border: 1px solid var(--border); 
                    border-radius: 8px; 
                    color: var(--text-muted); 
                    padding: 0.5rem 1rem; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    cursor: pointer; 
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .toggle-view-btn:hover { background: rgba(255,255,255,0.1); color: white; border-color: var(--primary); }

                .company-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .input-field label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
                .field-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
                .field-row input { background: transparent; border: none; color: white; width: 100%; outline: none; }
                .readonly-input { color: var(--text-muted) !important; cursor: default; }
                .refresh-btn { background: none; border: none; color: var(--primary); cursor: pointer; padding: 0.25rem; display: flex; align-items: center; transition: transform 0.2s; }
                .refresh-btn:hover { transform: rotate(90deg); color: var(--secondary); }
                .field-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }
                
                .message-box { padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; }
                .message-box.success { background: rgba(38, 222, 129, 0.1); color: #26de81; }
                .message-box.error { background: rgba(255, 71, 87, 0.1); color: #ff4757; }

                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 1rem; color: var(--text-muted); border-bottom: 1px solid var(--border); font-size: 0.75rem; text-transform: uppercase; }
                .admin-table td { padding: 1rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
                .code-badge { background: rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: 6px; font-family: monospace; }
                .password-badge { color: var(--secondary); font-family: monospace; font-weight: 500; letter-spacing: 1px; }
                .password-badge.missing { color: var(--text-muted); font-size: 0.75rem; font-style: italic; letter-spacing: 0; }
                
                .password-display { display: flex; align-items: center; gap: 0.5rem; }
                .eye-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; align-items: center; transition: color 0.2s; }
                .eye-btn:hover { color: var(--primary); }

                .empty-state { padding: 4rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                
                .actions-cell { display: flex; gap: 1rem; }
                .action-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s; }
                .action-btn:hover { color: var(--primary); }
                .action-btn.danger:hover { color: var(--danger); }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-content { width: 100%; max-width: 500px; padding: 2rem; position: relative; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
                .close-btn:hover { color: white; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

                .qr-modal { text-align: center; }
                .qr-display-wrapper { background: white; padding: 2rem; border-radius: 16px; display: inline-block; margin: 1rem 0; }
                .qr-meta { margin-top: 1.5rem; color: #1a2238; }
                .qr-meta h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #1a2238; }
                
                .full-width { width: 100%; }
            `}</style>
        </div>
    );
};

export default SuperAdmin;
