import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, QrCode, Trash2, Download, X, Eye, EyeOff, Edit2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', employeeId: '', scannerPassword: '' });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const company = JSON.parse(localStorage.getItem('company') || '{}');

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees", err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/employees/${editId}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            closeModal();
            fetchEmployees();
        } catch (err) {
            alert(err.response?.data?.message || `Error ${isEditMode ? 'updating' : 'adding'} employee`);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (emp) => {
        setFormData({ 
            name: emp.name, 
            employeeId: emp.employeeId, 
            scannerPassword: emp.displayScannerPassword || '1234' 
        });
        setEditId(emp._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setFormData({ name: '', employeeId: '', scannerPassword: '' });
        setIsEditMode(false);
        setEditId(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees();
        } catch (err) {
            console.error("Error deleting", err);
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById('company-qr');
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `Company_QR_${company.name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <>
            <div className="animate-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Employees</h1>
                    <p className="text-muted">Manage your workforce. Employees can scan the company QR code below.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} /> Add Employee
                </button>
            </header>

            <div className="glass-card company-qr-section margin-top">
                <div className="qr-container">
                    <QRCodeCanvas 
                        id="company-qr"
                        value={company.companyCode} 
                        size={180}
                        level={"H"}
                        includeMargin={true}
                    />
                    <div className="qr-details">
                        <h3>Company QR Code</h3>
                        <button className="btn btn-secondary margin-top-sm" onClick={downloadQR}>
                            <Download size={18} /> Download for Printing
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card table-container margin-top">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Employee ID</th>
                            <th>Scanner Pass</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp._id}>
                                <td>{emp.name}</td>
                                <td><code className="emp-id">{emp.employeeId}</code></td>
                                <td>
                                    <div className="pass-container">
                                        <span className="pass-text">
                                            {showPasswords[emp._id] ? (emp.displayScannerPassword || '1234') : '••••'}
                                        </span>
                                        <button 
                                            className="eye-btn" 
                                            onClick={() => setShowPasswords(prev => ({...prev, [emp._id]: !prev[emp._id]}))}
                                        >
                                            {showPasswords[emp._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    <button className="action-btn" onClick={() => openEditModal(emp)}>
                                        <Edit2 size={18} /> Edit
                                    </button>
                                    <button className="action-btn danger" onClick={() => handleDelete(emp._id)}>
                                        <Trash2 size={18} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-in">
                        <header className="modal-header">
                            <h3>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button className="close-btn" onClick={closeModal}><X /></button>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Employee ID (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.employeeId} 
                                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                    placeholder="Leave blank for auto-gen"
                                />
                            </div>
                            <div className="form-group">
                                <label>Scanner Password</label>
                                <input 
                                    type="text" 
                                    value={formData.scannerPassword} 
                                    onChange={(e) => setFormData({...formData, scannerPassword: e.target.value})}
                                    placeholder="e.g. 1234"
                                    required
                                />
                                <p className="field-hint">Required for logging into the scanner.</p>
                            </div>
                             <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                                 {loading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Employee")}
                             </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR View Modal Removed as per requirements */}

            <style>{`
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                .margin-top { margin-top: 2rem; }
                .emp-id { background: rgba(255, 255, 255, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; }
                .company-qr-section { padding: 2rem; }
                .qr-container { display: flex; align-items: center; gap: 2rem; }
                .qr-details h3 { margin-bottom: 0.5rem; }
                .margin-top-sm { margin-top: 0.75rem; }
                .pass-text { color: var(--text-muted); font-family: monospace; letter-spacing: 2px; }
                .pass-container { display: flex; align-items: center; gap: 0.5rem; }
                .eye-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; align-items: center; transition: color 0.2s; }
                .eye-btn:hover { color: var(--primary); }
                .field-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; }
                
                .actions-cell { display: flex; gap: 0.75rem; }
                .action-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s; }
                .action-btn:hover { color: var(--primary); }
                .action-btn.danger:hover { color: var(--danger); }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { padding: 2rem; width: 100%; max-width: 450px; background: #161c2d; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
                .form-group input { width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; font-size: 1rem; }
                .full-width { width: 100%; justify-content: center; margin-top: 1rem; }
            `}</style>
        </>
    );
};

export default Employees;
