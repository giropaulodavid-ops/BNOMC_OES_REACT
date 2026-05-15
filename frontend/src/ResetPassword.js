import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email'); // Grabs the email from the URL
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ text: "Passwords do not match!", isError: true });
        }

        try {
            const res = await axios.post('http://localhost:5000/api/reset-password', {
                email: email,
                newPassword: passwords.newPassword
            });
            
            setMessage({ text: "Password updated! Redirecting to login...", isError: false });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || "Reset failed.", isError: true });
        }
    };

    return (
            <div style={styles.container}>
                {/* Optional: Add an overlay div here if you want that "photo shows through" look */}
                <div style={styles.overlay}>
                    <div style={styles.card}>
                        <h2 style={styles.title}>RESET PASSWORD</h2>
                        <p style={styles.subtitle}>Setting new password for: <strong>{email}</strong></p>

                        {message.text && (
                            <div style={{ ...styles.alert, backgroundColor: message.isError ? '#ffcccb' : '#d4f0c6' }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleReset}>
                            <label style={styles.label}>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                style={styles.input}
                                onChange={handleChange}
                            />

                            <label style={styles.label}>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                style={styles.input}
                                onChange={handleChange}
                            />

                            <button type="submit" style={styles.button}>
                                UPDATE PASSWORD
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const styles = {
        container: { 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            // Matches StudentDashboard loading/error background
            backgroundColor: '#0a4d92', 
            // If your DashboardLayout uses a background image, add it here:
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url("/BNOMC_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: 'Montserrat, sans-serif' 
        },
        overlay: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        },
        card: { 
            background: '#0a4d92', 
            padding: '40px', 
            borderRadius: '16px', // Matches the Card radius in StudentDashboard
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)', // Matches StudentDashboard Card shadow
            width: '100%', 
            maxWidth: '400px', 
            textAlign: 'center' 
        },
        title: { 
            color: 'white', 
            fontWeight: 900, 
            marginBottom: '10px',
            letterSpacing: '0.1em' 
        },
        subtitle: { 
            fontSize: '0.85rem', 
            color: 'white', 
            marginBottom: '20px' 
        },
        label: { 
            display: 'block', 
            textAlign: 'left', 
            fontWeight: 'bold', 
            marginBottom: '5px', 
            fontSize: '0.72rem', // Adjusted to match Field label size
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.12em'
        },
        input: { 
            width: '100%', 
            padding: '12px', 
            marginBottom: '20px', 
            borderRadius: '10px', // Matches StudentDashboard input radius
            border: '1px solid #ddd', 
            boxSizing: 'border-box',
            background: '#f9f9f9'
        },
        button: { 
            width: '100%', 
            padding: '12px', 
            background: '#e6e94e', // Matches StudentDashboard yellow
            color: '#073b75',      // Matches StudentDashboard button text
            border: 'none', 
            borderRadius: '30px',  // Matches StudentDashboard EDIT button
            fontWeight: 800, 
            cursor: 'pointer',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'transform 0.15s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        },
        alert: { 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px', 
            fontSize: '0.85rem',
            fontWeight: 600
        }
    };

    export default ResetPassword;