import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, User, LogOut } from 'lucide-react';

const EmployeeScan = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [status, setStatus] = useState('ready'); // ready, processing, result
    const scannerRef = useRef(null);
    const navigate = useNavigate();

    // Get scanner session
    const scannerUser = JSON.parse(localStorage.getItem('scannerUser') || 'null');

    useEffect(() => {
        if (!scannerUser) {
            navigate('/scanner-login');
            return;
        }

        if (isScanning && status === 'ready') {
            scannerRef.current = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            });

            scannerRef.current.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Error clearing scanner", err));
            }
        };
    }, [isScanning, status, navigate]);

    async function onScanSuccess(decodedText) {
        // decodedText is the companyCode from the scanned QR
        if (decodedText !== scannerUser.companyCode) {
            setScanResult({
                success: false,
                message: "This QR code belongs to a different company."
            });
            setStatus('result');
            return;
        }

        setStatus('processing');
        setIsScanning(false);
        if (scannerRef.current) {
            await scannerRef.current.clear();
        }

        try {
            const res = await api.post('/attendance/public-scan', {
                employeeId: scannerUser.id,
                companyCode: decodedText
            });
            
            setScanResult({
                success: true,
                message: res.data.message
            });
            setStatus('result');
        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.message || "Verification failed."
            });
            setStatus('result');
        }
    }

    function onScanFailure(error) {
        // Silent failure
    }

    const resetFlow = () => {
        setScanResult(null);
        setStatus('ready');
        setIsScanning(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('scannerUser');
        navigate('/scanner-login');
    };

    if (!scannerUser) return null;

    return (
        <div className="employee-scan-page animate-in">
            <div className="scan-card glass-card">
                <header className="scan-header text-center">
                    <div className="logo-circle">
                        <Camera size={32} />
                    </div>
                    <h1>Scan Company QR</h1>
                    <div className="user-info-bar">
                        <span><User size={14} /> {scannerUser.name}</span>
                        <button onClick={handleLogout} className="logout-small"><LogOut size={14} /></button>
                    </div>
                </header>

                <div className="step-content">
                    {status === 'ready' && (
                        <div className="scanner-section">
                            <p className="text-center margin-bottom">Point your camera at the Company QR code displayed at the office.</p>
                            <div className="scanner-wrapper">
                                <div id="reader"></div>
                            </div>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center padding-xl">
                            <div className="spinner"></div>
                            <p className="margin-top">Recording your attendance...</p>
                        </div>
                    )}

                    {status === 'result' && (
                        <div className={`result-card ${scanResult?.success ? 'success' : 'error'}`}>
                            {scanResult?.success ? (
                                <CheckCircle2 size={64} className="icon" />
                            ) : (
                                <AlertCircle size={64} className="icon" />
                            )}
                            <h2>{scanResult?.success ? 'Success!' : 'Failed'}</h2>
                            <p>{scanResult?.message}</p>
                            <button className="btn btn-primary margin-top full-width" onClick={resetFlow}>
                                <RefreshCw size={20} /> Scan Again
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .employee-scan-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top left, #1a2238 0%, #0c0e14 100%);
                    padding: 1.5rem;
                }
                .scan-card { width: 100%; max-width: 440px; padding: 2.5rem; }
                .logo-circle { width: 64px; height: 64px; background: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
                .user-info-bar { display: flex; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
                .logout-small { background: none; border: none; color: var(--danger); cursor: pointer; display: flex; align-items: center; }
                
                .scanner-wrapper { border-radius: 16px; overflow: hidden; border: 1px solid var(--border); }
                #reader { border: none !important; }
                
                .result-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .result-card.success .icon { color: var(--success); }
                .result-card.error .icon { color: var(--danger); }
                
                .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .padding-xl { padding: 3rem 0; }
                .full-width { width: 100%; }
                .text-center { text-align: center; }
                .margin-top { margin-top: 1.5rem; }
                .margin-bottom { margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default EmployeeScan;
