import React, { useState, useEffect } from 'react';
import api from '../api';
import { Download, Search, Filter, FileSpreadsheet } from 'lucide-react';

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState({ date: new Date().toISOString().split('T')[0], employeeId: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const query = new URLSearchParams(filter).toString();
            const res = await api.get(`/attendance?${query}`);
            setLogs(res.data);
        } catch (err) {
            console.error("Error fetching logs", err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const filteredLogs = logs.filter(log => 
        log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateTimes = (log) => {
        const parseTime = (timeStr) => {
            if (!timeStr || timeStr === "--") return null;
            const segments = timeStr.split(':').map(Number);
            let seconds = 0;
            if (segments.length === 3) {
                seconds = segments[0] * 3600 + segments[1] * 60 + segments[2];
            } else if (segments.length === 2) {
                seconds = segments[0] * 3600 + segments[1] * 60;
            }
            return seconds;
        };

        const formatDuration = (totalSeconds) => {
            if (totalSeconds <= 0 || isNaN(totalSeconds)) return "--";
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} hr`;
        };

        const formatTime = (totalSeconds) => {
            if (totalSeconds === null) return "--";
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // Extract all non-empty timestamps and sort them
        const rawTimes = [log.morningIn, log.breakIn, log.breakOut, log.eveningOut]
            .filter(t => t && t !== "--");
        
        const sortedSeconds = rawTimes
            .map(parseTime)
            .sort((a, b) => a - b);

        const mIn = sortedSeconds[0] ?? null;
        const bIn = sortedSeconds[1] ?? null;
        const bOut = sortedSeconds[2] ?? null;
        const eOut = sortedSeconds[3] ?? null;

        let workSeconds = 0;
        let breakSeconds = 0;

        // Work Segment 1: Shift Start to Break Start
        if (mIn !== null && bIn !== null) {
            workSeconds += (bIn - mIn);
        }

        // Break Segment: Break Start to Break End
        if (bIn !== null && bOut !== null) {
            breakSeconds = (bOut - bIn);
        }

        // Work Segment 2: Break End to Shift End
        if (bOut !== null && eOut !== null) {
            workSeconds += (eOut - bOut);
        }

        return {
            display: {
                start: formatTime(mIn),
                breakStart: formatTime(bIn),
                breakEnd: formatTime(bOut),
                end: formatTime(eOut)
            },
            work: formatDuration(workSeconds),
            break: formatDuration(breakSeconds)
        };
    };

    const exportToCSV = () => {
        if (filteredLogs.length === 0) return;
        
        const headers = ["Date", "Day", "Emp ID", "Name", "Shift Start", "Break Start", "Break End", "Shift End", "Break Time", "Total Time"];
        const rows = filteredLogs.map(log => {
            const times = calculateTimes(log);
            return [
                log.date,
                log.day,
                log.employeeId,
                log.employeeName,
                times.display.start,
                times.display.breakStart,
                times.display.breakEnd,
                times.display.end,
                times.break,
                times.work
            ];
        });

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${filter.date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Attendance Records</h1>
                    <p className="text-muted">Review and export daily attendance logs.</p>
                </div>
                <button className="btn btn-primary" onClick={exportToCSV}>
                    <FileSpreadsheet size={20} /> Export CSV
                </button>
            </header>

            <div className="filters-bar glass-card margin-top">
                <div className="filter-group">
                    <Search size={18} className="icon" />
                    <input 
                        type="text" 
                        placeholder="Search employee name or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} className="icon" />
                    <input 
                        type="date" 
                        value={filter.date}
                        onChange={(e) => setFilter({...filter, date: e.target.value})}
                    />
                </div>
            </div>

            <div className="glass-card table-container margin-top">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Emp ID</th>
                            <th>Name</th>
                            <th>Shift Start</th>
                            <th>Break Start</th>
                            <th>Break End</th>
                            <th>Shift End</th>
                            <th>Break Time</th>
                            <th>Total Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                            const times = calculateTimes(log);
                            return (
                                <tr key={log._id}>
                                    <td>{log.date}</td>
                                    <td>{log.day}</td>
                                    <td><code>{log.employeeId}</code></td>
                                    <td style={{ fontWeight: 500 }}>{log.employeeName}</td>
                                    <td><span className={`badge ${times.display.start !== "--" ? 'badge-success' : ''}`}>{times.display.start}</span></td>
                                    <td><span className={`badge ${times.display.breakStart !== "--" ? 'badge-success' : ''}`}>{times.display.breakStart}</span></td>
                                    <td><span className={`badge ${times.display.breakEnd !== "--" ? 'badge-success' : ''}`}>{times.display.breakEnd}</span></td>
                                    <td><span className={`badge ${times.display.end !== "--" ? 'badge-success' : ''}`}>{times.display.end}</span></td>
                                    <td style={{ fontWeight: 500, color: 'var(--secondary)' }}>{times.break}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{times.work}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No records found for the selected date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                .margin-top { margin-top: 2rem; }
                .filters-bar { padding: 1rem 1.5rem; display: flex; gap: 1.5rem; align-items: center; }
                .filter-group { display: flex; align-items: center; gap: 0.75rem; flex: 1; position: relative; }
                .filter-group .icon { color: var(--text-muted); position: absolute; left: 1rem; }
                .filter-group input { 
                    width: 100%; 
                    padding: 0.75rem 1rem 0.75rem 2.75rem; 
                    border-radius: 10px; 
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid var(--border); 
                    color: white; 
                }
                .filter-group input[type="date"] { max-width: 200px; }
            `}</style>
        </div>
    );
};

export default AttendanceLogs;
