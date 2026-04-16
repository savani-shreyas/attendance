import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Camera, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (isScanning) {
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
    }, [isScanning]);

    async function onScanSuccess(decodedText) {
        // Pause scanning to process
        setIsScanning(false);
        if (scannerRef.current) {
            await scannerRef.current.clear();
        }

        try {
            const res = await axios.post('http://localhost:5000/api/attendance/scan', {
                employeeId: decodedText
            });
            setScanResult({
                success: true,
                message: res.data.message
            });
        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.message || "Verification failed."
            });
        }
    }

    function onScanFailure(error) {
        // Silent failure for continuous scanning
    }

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
        setIsScanning(true);
    };

    return (
        <div className="animate-in scanner-page">
            <header className="page-header text-center">
                <h1>Attendance Scanner</h1>
                <p className="text-muted">Point your QR code to the camera to record attendance.</p>
            </header>

            <div className="scanner-container">
                {isScanning ? (
                    <div className="glass-card scanner-wrapper">
                        <div id="reader"></div>
                        <div className="scanner-overlay">
                            <div className="scan-frame"></div>
                        </div>
                    </div>
                ) : (
                    <div className={`glass-card result-card ${scanResult?.success ? 'success' : 'error'}`}>
                        {scanResult?.success ? (
                            <CheckCircle2 size={64} className="icon" />
                        ) : (
                            <AlertCircle size={64} className="icon" />
                        )}
                        <h2>{scanResult?.success ? 'Success!' : 'Oops!'}</h2>
                        <p>{scanResult?.message}</p>
                        <button className="btn btn-primary margin-top" onClick={resetScanner}>
                            <RefreshCw size={20} /> Scan Next
                        </button>
                    </div>
                )}
            </div>

            <div className="time-info margin-top text-center">
                <p className="text-muted">Today's Valid Time Slots:</p>
                <div className="slots-grid">
                    <span className="slot-item">Morning: 8-11 AM</span>
                    <span className="slot-item">Break In: 12-1 PM</span>
                    <span className="slot-item">Break Out: 2-3 PM</span>
                    <span className="slot-item">Evening: 5-8 PM</span>
                </div>
            </div>

            <style>{`
                .scanner-page { display: flex; flex-direction: column; align-items: center; }
                .text-center { text-align: center; }
                .scanner-container { width: 100%; max-width: 500px; margin-top: 2rem; position: relative; }
                .scanner-wrapper { padding: 1rem; overflow: hidden; position: relative; }
                #reader { width: 100% !important; border: none !important; }
                #reader__scan_region { background: #000; }
                #reader__dashboard_section_csr button { 
                    padding: 0.5rem 1rem; 
                    background: var(--primary); 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    margin-top: 10px;
                    cursor: pointer;
                }
                
                .result-card { padding: 3rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .result-card.success .icon { color: var(--success); }
                .result-card.error .icon { color: var(--danger); }
                .result-card h2 { font-size: 2rem; }
                
                .slots-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 0.5rem; }
                .slot-item { background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default Scanner;
