import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//angas
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, enrollees: 0, pending: 0 });
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Students List
                const resStudents = await fetch('http://localhost:5000/api/admin/students');
                const dataStudents = await resStudents.json();
                setStudents(Array.isArray(dataStudents) ? dataStudents : []);

                // Fetch Stats
                const resStats = await fetch('http://localhost:5000/api/admin/stats');
                const dataStats = await resStats.json();
                setStats(dataStats);

                // Fetch Recent Activity (Limited to 10 by the backend)
                const resActivities = await fetch('http://localhost:5000/api/admin/activities');
                const dataActivities = await resActivities.json();
                setActivities(Array.isArray(dataActivities) ? dataActivities : []);
                
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
            {/* Header */}
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
                
                {/* Main Content Area */}
                <div style={{ flex: 1 }}>
                    {/* Stats Grid */}
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

                    {/* Table Section */}
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
                                        
                                        {/* Document Status Column */}
                                        <td style={{ padding: "15px", textAlign: "center" }}>
                                            <span style={{ 
                                                padding: "5px 12px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 800,
                                                background: student.doc_status === 'Verified' ? '#00ff00' : 
                                                            student.doc_status === 'Rejected' ? '#ff4d4d' : '#ffff00',
                                                color: "#000", display: "inline-block", minWidth: "90px"
                                            }}>{student.doc_status || 'Pending'}</span>
                                        </td>

                                        {/* Payment Status Column */}
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

                {/* Sidebar - Recent Activity */}
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