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
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B4E94' },
    card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    title: { color: '#0B4E94', fontWeight: 900, marginBottom: '10px' },
    subtitle: { fontSize: '0.85rem', color: '#666', marginBottom: '20px' },
    label: { display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.8rem', color: '#0B4E94' },
    input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', background: '#E8E657', color: '#0B4E94', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    alert: { padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }
};

export default ResetPassword;