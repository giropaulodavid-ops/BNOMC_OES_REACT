import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId');

    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '',
        dob: '', religion: '', gender: '',
        contact_number: '', email_address: '',
        guardian_first_name: '', guardian_middle_name: '', guardian_last_name: '',
        guardian_birth_date: '', guardian_occupation: '',
        prev_school: '', school_address: '', prev_grade: '', school_year: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fmt = (d) => {
        if (!d) return '';
        try { return new Date(d).toISOString().split('T')[0]; } catch { return d; }
    };

    // Pre-fill form with existing student data
    useEffect(() => {
        if (!studentId) { navigate('/login'); return; }

        axios.get(`http://127.0.0.1:5000/api/student/${studentId}`)
            .then(res => {
                const d = res.data;
                setFormData({
                    first_name:            d.first_name           || '',
                    middle_name:           d.middle_name          || '',
                    last_name:             d.last_name            || '',
                    dob:                   fmt(d.date_of_birth),
                    religion:              d.religion             || '',
                    gender:                d.gender               || '',
                    contact_number:        d.contact_number       || '',
                    email_address:         d.email_address        || '',
                    guardian_first_name:   d.guardian_first_name  || '',
                    guardian_middle_name:  d.guardian_middle_name || '',
                    guardian_last_name:    d.guardian_last_name   || '',
                    guardian_birth_date:   fmt(d.guardian_birth_date),
                    guardian_occupation:   d.guardian_occupation  || '',
                    prev_school:           d.previous_school_attended  || '',
                    school_address:        d.previous_school_address   || '',
                    prev_grade:            d.previous_grade_level      || '',
                    school_year:           d.previous_school_year      || '',
                });
            })
            .catch(() => setError('Failed to load student data.'))
            .finally(() => setLoading(false));
    }, [navigate, studentId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const backendData = {
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                date_of_birth: formData.dob,
                religion: formData.religion,
                gender: formData.gender,
                contact_number: formData.contact_number,
                email_address: formData.email_address,
                guardian_first_name: formData.guardian_first_name,
                guardian_middle_name: formData.guardian_middle_name,
                guardian_last_name: formData.guardian_last_name,
                guardian_birth_date: formData.guardian_birth_date,
                guardian_occupation: formData.guardian_occupation,
                previous_school_attended: formData.prev_school,
                previous_school_address: formData.school_address,
                previous_grade_level: formData.prev_grade,
                previous_school_year: formData.school_year,
            };
            const res = await axios.put(`http://127.0.0.1:5000/api/student/${studentId}`, backendData);
            if (res.data.success) {
                navigate('/student-dashboard');
            } else {
                setError(res.data.error || 'Update failed.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        navigate('/student-dashboard');
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a4d92' }}>
            <div style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                Loading student data...
            </div>
        </div>
    );

    const cardStyle = {
        background: '#0B4E94',
        borderRadius: 12,
        padding: '20px 28px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        marginBottom: 28,
    };

    const labelStyle = {
        display: 'block',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 7,
    };

    const inputStyle = {
        width: '100%',
        background: '#fff',
        borderRadius: 8,
        padding: '9px 12px',
        border: 'none',
        outline: 'none',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.88rem',
        fontWeight: 600,
        color: '#1a1a2e',
        boxSizing: 'border-box',
    };

    const sectionHeadStyle = {
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 800,
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.25)',
    };

    const grid3 = { display: 'grid', gridTemplateColumns: '1fr', gap: 12 };
    const grid2 = { display: 'grid', gridTemplateColumns: '1fr', gap: 12 };

    return (
        <div style={{ fontFamily: "'Montserrat', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

            {/* Background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: "url('/BNOMC_bg.jpg')",
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: 0.45,
            }} />

            {/* Header */}
            <header style={{
                position: 'relative', zIndex: 10,
                background: '#0a4d92',
                padding: '8px 28px',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <img src="/BNOMC_Logo.png" alt="Logo"
                    style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', objectFit: 'contain', padding: 2 }} />
                <div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1.25 }}>
                        Blessed Name of Mary College, Inc.
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 2 }}>
                        San Isidro Pili, Camarines Sur
                    </div>
                </div>
            </header>

            {/* Main */}
            <main style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 60px' }}>

                {/* Page titles */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1B63AD', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, lineHeight: 1.2 }}>
                        Blessed Name of Mary College, Inc.
                    </h1>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0B4E94', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '6px 0 0' }}>
                        Online Enrollment System
                    </p>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#000', textTransform: 'uppercase', margin: '14px 0 0', letterSpacing: '0.05em' }}>
                        Edit Student Information
                    </h2>
                </div>

                {error && (
                    <div style={{ background: '#c0392b', color: '#fff', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: '0.9rem', marginBottom: 20, width: '100%', maxWidth: 900, textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} style={{ width: '100%', maxWidth: '750px' }}>

                    {/* ── Student Information ── */}
                    <div style={cardStyle}>
                        <div style={sectionHeadStyle}>Student Information</div>
                        <div style={{ ...grid3, marginBottom: 20 }}>
                            <div><label style={labelStyle}>First Name</label><input name="first_name" style={inputStyle} value={formData.first_name} onChange={handleChange} required /></div>
                            <div><label style={labelStyle}>Middle Name</label><input name="middle_name" style={inputStyle} value={formData.middle_name} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Last Name</label><input name="last_name" style={inputStyle} value={formData.last_name} onChange={handleChange} required /></div>
                        </div>
                        <div style={{ ...grid2, marginBottom: 20 }}>
                            <div><label style={labelStyle}>Date of Birth</label><input name="dob" type="date" style={inputStyle} value={formData.dob} onChange={handleChange} required /></div>
                            <div><label style={labelStyle}>Religion</label><input name="religion" style={inputStyle} value={formData.religion} onChange={handleChange} /></div>
                        </div>
                        <div>
                            <label style={labelStyle}>Gender</label>
                            <select name="gender" style={inputStyle} value={formData.gender} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Contact Information ── */}
                    <div style={cardStyle}>
                        <div style={sectionHeadStyle}>Student Contact Information</div>
                        <div style={grid2}>
                            <div><label style={labelStyle}>Contact Number</label><input name="contact_number" style={inputStyle} value={formData.contact_number} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Email Address</label><input name="email_address" type="email" style={inputStyle} value={formData.email_address} onChange={handleChange} required /></div>
                        </div>
                    </div>

                    {/* ── Guardian Information ── */}
                    <div style={cardStyle}>
                        <div style={sectionHeadStyle}>Guardian Information</div>
                        <div style={{ ...grid3, marginBottom: 20 }}>
                            <div><label style={labelStyle}>First Name</label><input name="guardian_first_name" style={inputStyle} value={formData.guardian_first_name} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Middle Name</label><input name="guardian_middle_name" style={inputStyle} value={formData.guardian_middle_name} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Last Name</label><input name="guardian_last_name" style={inputStyle} value={formData.guardian_last_name} onChange={handleChange} /></div>
                        </div>
                        <div style={grid2}>
                            <div><label style={labelStyle}>Date of Birth</label><input name="guardian_birth_date" type="date" style={inputStyle} value={formData.guardian_birth_date} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Occupation</label><input name="guardian_occupation" style={inputStyle} value={formData.guardian_occupation} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* ── Educational Background ── */}
                    <div style={cardStyle}>
                        <div style={sectionHeadStyle}>User Educational Background (For Transferees Only)</div>
                        <div style={{ ...grid2, marginBottom: 20 }}>
                            <div><label style={labelStyle}>Previous School Attended</label><input name="prev_school" style={inputStyle} value={formData.prev_school} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Address of Previous School</label><input name="school_address" style={inputStyle} value={formData.school_address} onChange={handleChange} /></div>
                        </div>
                        <div style={grid2}>
                            <div><label style={labelStyle}>Previous Grade Level</label><input name="prev_grade" style={inputStyle} value={formData.prev_grade} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Previous School Year Attended</label><input name="school_year" style={inputStyle} value={formData.school_year} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* ── Save / Discard ── */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                background: saving ? '#aaa' : '#27ae60',
                                color: '#fff',
                                border: 'none', borderRadius: 10,
                                padding: '13px 60px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 800, fontSize: '0.95rem',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                transition: 'background 0.2s, transform 0.15s',
                            }}
                            onMouseOver={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {saving ? 'Saving...' : 'SAVE'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDiscard}
                            style={{
                                background: '#c0392b',
                                color: '#fff',
                                border: 'none', borderRadius: 10,
                                padding: '13px 60px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 800, fontSize: '0.95rem',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                transition: 'background 0.2s, transform 0.15s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#a93226'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            DISCARD
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default EditProfile;