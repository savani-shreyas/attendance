import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, QrCode, Trash2, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const [formData, setFormData] = useState({ name: '', employeeId: '' });
    const [loading, setLoading] = useState(false);

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
            await api.post('/employees', formData);
            setFormData({ name: '', employeeId: '' });
            setIsModalOpen(false);
            fetchEmployees();
        } catch (err) {
            alert(err.response?.data?.message || "Error adding employee");
        } finally {
            setLoading(false);
        }
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

    const downloadQR = (id, name) => {
        const canvas = document.getElementById(id);
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${name}.png`;
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
                    <p className="text-muted">Manage your workforce and generate QR codes.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} /> Add Employee
                </button>
            </header>

            <div className="glass-card table-container margin-top">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Employee ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp._id}>
                                <td>{emp.name}</td>
                                <td><code className="emp-id">{emp.employeeId}</code></td>
                                <td className="actions-cell">
                                    <button className="action-btn" onClick={() => setSelectedQR(emp)}>
                                        <QrCode size={18} /> View QR
                                    </button>
                                    <button className="action-btn danger" onClick={() => handleDelete(emp._id)}>
                                        <Trash2 size={18} />
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
                            <h3>Add New Employee</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X /></button>
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
                            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                                {loading ? "Adding..." : "Add Employee"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR View Modal */}
            {selectedQR && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content qr-modal animate-in">
                        <header className="modal-header">
                            <h3>Employee QR Code</h3>
                            <button className="close-btn" onClick={() => setSelectedQR(null)}><X /></button>
                        </header>
                        <div className="qr-display">
                            <QRCodeCanvas 
                                id={`qr-${selectedQR.employeeId}`}
                                value={selectedQR.employeeId} 
                                size={256}
                                level={"H"}
                                includeMargin={true}
                            />
                            <div className="qr-info">
                                <h2>{selectedQR.name}</h2>
                                <span>ID: {selectedQR.employeeId}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary full-width" onClick={() => downloadQR(`qr-${selectedQR.employeeId}`, selectedQR.name)}>
                            <Download size={20} /> Download QR Image
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                .margin-top { margin-top: 2rem; }
                .emp-id { background: rgba(255, 255, 255, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; }
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
                
                .qr-modal { text-align: center; }
                .qr-display { margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 12px; display: inline-block; }
                .qr-info { margin-top: 1rem; color: var(--bg); }
                .qr-info h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
                .qr-info span { font-size: 0.9rem; opacity: 0.7; }
            `}</style>
        </>
    );
};

export default Employees;
