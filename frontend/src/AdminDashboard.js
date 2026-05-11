import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, enrollees: 0, pending: 0 });
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    // State initialized with empty strings
    const [settings, setSettings] = useState({ academic_year: '', semester: '', status: 'Open' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resStudents = await fetch('http://localhost:5000/api/admin/students');
                const dataStudents = await resStudents.json();
                setStudents(Array.isArray(dataStudents) ? dataStudents : []);

                const resStats = await fetch('http://localhost:5000/api/admin/stats');
                const dataStats = await resStats.json();
                setStats(dataStats);

                const resActivities = await fetch('http://localhost:5000/api/admin/activities');
                const dataActivities = await resActivities.json();
                setActivities(Array.isArray(dataActivities) ? dataActivities : []);

                const resSettings = await fetch('http://localhost:5000/api/system-settings');
                const dataSettings = await resSettings.json();
                
                // FIX: Added fallbacks (|| '') to ensure state never becomes undefined
                setSettings({
                    academic_year: dataSettings.current_academic_year || '',
                    semester: dataSettings.current_semester || '',
                    status: dataSettings.enrollment_status || 'Open'
                });
                
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    const handleUpdateSettings = async () => {
        const res = await fetch('http://localhost:5000/api/admin/update-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if(res.ok) {
            alert(`System updated to ${settings.semester}, AY ${settings.academic_year}`);
        } else {
            alert("Failed to update settings.");
        }
    };

    const handleSaveSettings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/update-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings), // Ensure 'settings' has AY, Semester, and Status
            });
            const data = await response.json();
            if (data.success) alert("Saved!");
            else console.error(data.error);
        } catch (err) {
            console.error("Network Error:", err);
        }
    };

    return (
        <div style={{
            fontFamily: "'Montserrat', sans-serif",
            backgroundColor: "#eef2f5",
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url('/BNOMC_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
            color: "#333"
        }}>
            <header style={{
                backgroundColor: "#0a4d92",
                color: "white",
                padding: "15px 40px",
                display: "flex",
                alignItems: "center",
                gap: "20px"
            }}>
                <img src="/BNOMC_Logo.png" alt="Logo" style={{ width: "60px", height: "60px" }} />
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>Blessed Name of Mary College, Inc.</h1>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.9, margin: 0 }}>San Isidro Pili, Camarines Sur | Admin Portal</p>
                </div>
                <button onClick={handleLogout} style={{
                    backgroundColor: "#e6e94e",
                    color: "#073b75",
                    padding: "10px 30px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase"
                }}>Logout</button>
            </header>

            <div style={{ display: "flex", padding: "40px", gap: "30px", maxWidth: "1600px", margin: "0 auto" }}>
                <div style={{ flex: 1 }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.95)", padding: "25px", borderRadius: "15px", marginBottom: "30px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", borderLeft: "8px solid #0a4d92" }}>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: "1rem", fontWeight: 800, color: "#0a4d92", textTransform: "uppercase" }}>Active Enrollment Term</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", alignItems: "flex-end" }}>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, marginBottom: "5px", color: "#666" }}>ACADEMIC YEAR</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 2024-2025"
                                    // FIX: Added "|| ''" as a secondary safeguard
                                    value={settings.academic_year || ''} 
                                    onChange={e => setSettings({...settings, academic_year: e.target.value})} 
                                    style={{ padding: "10px 15px", borderRadius: "8px", border: "2px solid #ddd", fontWeight: 700, width: "150px" }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, marginBottom: "5px", color: "#666" }}>SELECT SEMESTER</label>
                                <div style={{ display: "flex", gap: "5px", background: "#f0f0f0", padding: "5px", borderRadius: "10px" }}>
                                    {['1st Semester', '2nd Semester', 'Summer'].map(sem => (
                                        <button 
                                            key={sem}
                                            onClick={() => setSettings({...settings, semester: sem})}
                                            style={{
                                                padding: "8px 15px",
                                                border: "none",
                                                borderRadius: "7px",
                                                cursor: "pointer",
                                                fontWeight: 800,
                                                fontSize: "0.75rem",
                                                backgroundColor: settings.semester === sem ? "#0a4d92" : "transparent",
                                                color: settings.semester === sem ? "white" : "#666",
                                                transition: "all 0.2s"
                                            }}
                                        >{sem.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleUpdateSettings}
                                style={{ 
                                    background: "#e6e94e", 
                                    color: "#073b75", 
                                    padding: "11px 25px", 
                                    borderRadius: "10px", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    fontWeight: 900,
                                    fontSize: "0.85rem",
                                    boxShadow: "0 4px 10px rgba(230, 233, 78, 0.3)"
                                }}
                            >
                                UPDATE SYSTEM
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
                        <div style={{ background: "#1a5b9d", color: "white", padding: "25px", borderRadius: "15px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                            <h2 style={{ fontSize: "3rem", fontWeight: 900, margin: 0 }}>{stats.total || 0}</h2>
                            <p style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase" }}>Total Applicants</p>
                        </div>
                        <div style={{ background: "#1a5b9d", color: "white", padding: "25px", borderRadius: "15px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                            <h2 style={{ fontSize: "3rem", fontWeight: 900, margin: 0 }}>{stats.enrollees || 0}</h2>
                            <p style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase" }}>Total Enrollees</p>
                        </div>
                        <div style={{ background: "#1a5b9d", color: "white", padding: "25px", borderRadius: "15px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                            <h2 style={{ fontSize: "3rem", fontWeight: 900, margin: 0 }}>{stats.pending || 0}</h2>
                            <p style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase" }}>Pending Verifications</p>
                        </div>
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#0a4d92", color: "white" }}>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>STUDENT ID</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>STUDENT NAME</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>APPLIED LEVEL</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>DATE</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>DOCUMENTS</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>PAYMENT</th>
                                    <th style={{ padding: "15px", textAlign: "center", fontSize: "0.8rem", fontWeight: 800 }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map((student) => (
                                    <tr key={student.student_id} style={{ borderBottom: "1px solid #ddd" }}>
                                        <td style={{ padding: "15px", textAlign: "center", fontWeight: 600 }}>{String(student.student_id).padStart(4, '0')}</td>
                                        <td style={{ padding: "15px", textAlign: "center", fontWeight: 700 }}>{`${student.last_name}, ${student.first_name}`}</td>
                                        <td style={{ padding: "15px", textAlign: "center", fontWeight: 600 }}>{student.applied_level || 'N/A'}</td>
                                        <td style={{ padding: "15px", textAlign: "center", fontWeight: 600 }}>{student.applied_date ? new Date(student.applied_date).toLocaleDateString() : 'N/A'}</td>
                                        
                                        <td style={{ padding: "15px", textAlign: "center" }}>
                                            <span style={{ 
                                                padding: "5px 12px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 800,
                                                background: student.doc_status === 'Verified' ? '#00ff00' : 
                                                            student.doc_status === 'Rejected' ? '#ff4d4d' : '#ffff00',
                                                color: "#000", display: "inline-block", minWidth: "90px"
                                            }}>{student.doc_status || 'Pending'}</span>
                                        </td>

                                        <td style={{ padding: "15px", textAlign: "center" }}>
                                            <span style={{ 
                                                padding: "5px 12px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 800,
                                                background: student.pay_status === 'Verified' ? '#00ff00' : 
                                                            student.pay_status === 'Rejected' ? '#ff4d4d' : '#ffff00',
                                                color: "#000", display: "inline-block", minWidth: "90px"
                                            }}>{student.pay_status || 'Pending'}</span>
                                        </td>

                                        <td style={{ padding: "15px", textAlign: "center" }}>
                                            <button onClick={() => navigate(`/admin/student/${student.student_id}`)} style={{ background: "#8c9096", color: "white", border: "none", padding: "5px 15px", borderRadius: "15px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", marginRight: "5px" }}>DETAIL</button>
                                            <button onClick={() => navigate(`/admin/verify/${student.student_id}`)} style={{ background: "#8c9096", color: "white", border: "none", padding: "5px 15px", borderRadius: "15px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>VERIFY</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#888", fontWeight: 600 }}>No applicants found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ width: "350px", background: "#0a4d92", borderRadius: "15px", padding: "30px", color: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", height: "fit-content" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px", marginBottom: "20px" }}>Recent Activity</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {activities.map((act, index) => (
                            <div key={index} style={{ background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, borderLeft: "4px solid #e6e94e" }}>
                                {act.activity_text}
                                <div style={{ fontSize: "0.7rem", opacity: 0.5, marginTop: "5px", fontWeight: 400 }}>
                                    {new Date(act.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontStyle: "italic", fontSize: "0.8rem" }}>No recent activity found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;