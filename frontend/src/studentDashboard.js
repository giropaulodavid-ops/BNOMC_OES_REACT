import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

// ── Read-only field ───────────────────────────────────────
const Field = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {label}
        </div>
        <input
            type="text"
            readOnly
            value={value || 'N/A'}
            style={{
                width: '100%', padding: '8px 12px',
                borderRadius: 10, border: 'none',
                background: '#fff', color: '#1a1a2e',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.85rem', fontWeight: 600,
                outline: 'none', boxSizing: 'border-box',
            }}
        />
    </div>
);

// ── Section card ─────────────────────────────────────────
const Card = ({ children }) => (
    <div style={{
        background: '#0a4d92',
        borderRadius: 16, padding: '16px 24px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
    }}>
        {children}
    </div>
);

const Grid3 = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>{children}</div>
);
const Grid2 = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>{children}</div>
);

// ── Main component ────────────────────────────────────────
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const studentId = localStorage.getItem('studentId');

    useEffect(() => {
        if (!studentId) { navigate('/login'); return; }

        const fmt = d => {
            if (!d) return 'N/A';
            try { return new Date(d).toISOString().split('T')[0]; } catch { return d; }
        };

        axios.get(`http://127.0.0.1:5000/api/student/${studentId}`)
            .then(res => {
                const d = res.data;
                setInfo({
                    firstName:          d.first_name,
                    middleName:         d.middle_name,
                    lastName:           d.last_name,
                    dob:                fmt(d.date_of_birth),
                    religion:           d.religion,
                    gender:             d.gender,
                    contactNumber:      d.contact_number,
                    email:              d.email_address,
                    guardianFirstName:  d.guardian_first_name,
                    guardianMiddleName: d.guardian_middle_name,
                    guardianLastName:   d.guardian_last_name,
                    guardianDob:        fmt(d.guardian_birth_date),
                    guardianOccupation: d.guardian_occupation,
                    prevSchool:         d.previous_school_attended  || 'N/A',
                    schoolAddress:      d.previous_school_address   || 'N/A',
                    prevGrade:          d.previous_grade_level      || 'N/A',
                    schoolYear:         d.previous_school_year      || 'N/A',
                    strandCourse:       d.previous_strand_course    || 'N/A',
                    prevProgram:        d.previous_program          || 'N/A',
                    isEnrolled:         d.is_enrolled || false,
                });
            })
            .catch(err => {
                if (err.response?.status === 404) setError('Student data not found. Please log in again.');
                else setError(err.response?.data?.error || err.message || 'Unable to load student data.');
            })
            .finally(() => setLoading(false));
    }, [navigate, studentId]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a4d92' }}>
            <div style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                Loading student data...
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a4d92', padding: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '32px 40px', textAlign: 'center' }}>
                <p style={{ color: '#ff8080', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>{error}</p>
                <button
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    style={{ marginTop: 20, background: '#e6e94e', color: '#073b75', border: 'none', borderRadius: 8, padding: '10px 28px', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, cursor: 'pointer' }}
                >
                    Return to Login
                </button>
            </div>
        </div>
    );

    const applicantName = info
        ? `${info.lastName}, ${info.firstName}${info.middleName ? ' ' + info.middleName.charAt(0) + '.' : ''}`
        : '';

    return (
        <DashboardLayout activePath="/student-dashboard" studentName={applicantName} isEnrolled={info?.isEnrolled}>

            {/* Content area — no extra overlay, bg photo shows through */}
            <div style={{ padding: '0 24px 48px', minHeight: '100%', maxWidth: '750px', margin: '0 auto' }}>

                {/* Page title — no background, text directly over photo */}
                <div style={{
                    padding: '22px 0 16px',
                    textAlign: 'center',
                    marginBottom: 16,
                }}>
                    <h2 style={{
                        fontWeight: 900, fontSize: '1.55rem',
                        color: '#000', letterSpacing: '0.25em',
                        textTransform: 'uppercase', margin: 0,
                    }}>
                        STUDENT INFORMATION
                    </h2>
                </div>

                {/* ── Student Info ── */}
                <SectionLabel>Student Information</SectionLabel>
                <Card>
                    <Grid3>
                        <Field label="First Name"   value={info.firstName} />
                        <Field label="Middle Name"  value={info.middleName} />
                        <Field label="Last Name"    value={info.lastName} />
                    </Grid3>
                    <div style={{ height: 10 }} />
                    <Grid2>
                        <Field label="Date of Birth" value={info.dob} />
                        <Field label="Religion"      value={info.religion} />
                    </Grid2>
                    <div style={{ height: 10 }} />
                    <Field label="Gender" value={info.gender} />
                </Card>

                <div style={{ height: 16 }} />

                {/* ── Contact Info ── */}
                <SectionLabel>Student Contact Information</SectionLabel>
                <Card>
                    <Grid2>
                        <Field label="Contact Number" value={info.contactNumber} />
                        <Field label="Email"          value={info.email} />
                    </Grid2>
                </Card>

                <div style={{ height: 16 }} />

                {/* ── Guardian Info ── */}
                <SectionLabel>Guardian Information</SectionLabel>
                <Card>
                    <Grid3>
                        <Field label="First Name"  value={info.guardianFirstName} />
                        <Field label="Middle Name" value={info.guardianMiddleName} />
                        <Field label="Last Name"   value={info.guardianLastName} />
                    </Grid3>
                    <div style={{ height: 10 }} />
                    <Grid2>
                        <Field label="Date of Birth" value={info.guardianDob} />
                        <Field label="Occupation"    value={info.guardianOccupation} />
                    </Grid2>
                </Card>

                <div style={{ height: 16 }} />

                {/* ── Educational Background ── */}
                <SectionLabel>User Educational Background (For Transferees Only)</SectionLabel>
                <Card>
                    <Grid2>
                        <Field label="Previous School Attended"    value={info.prevSchool} />
                        <Field label="Address of Previous School"  value={info.schoolAddress} />
                    </Grid2>
                    <div style={{ height: 10 }} />
                    <Grid2>
                        <Field label="Previous Grade Level"          value={info.prevGrade} />
                        <Field label="Previous School Year Attended" value={info.schoolYear} />
                    </Grid2>
                    <div style={{ height: 10 }} />
                    <Grid2>
                        <Field label="Previous Strand/Course Taken" value={info.strandCourse} />
                        <Field label="Previous Program Taken"       value={info.prevProgram} />
                    </Grid2>
                </Card>

                <div style={{ height: 28 }} />

                {/* Edit button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/edit-profile')}
                        style={{
                            background: '#e6e94e', color: '#073b75',
                            border: 'none', borderRadius: 30,
                            padding: '12px 80px',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 800, fontSize: '0.95rem',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'background 0.2s, transform 0.15s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f0f741'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#e6e94e'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        EDIT
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

const SectionLabel = ({ children }) => (
    <div style={{
        fontWeight: 800, fontSize: '1.1rem',
        color: '#111', marginBottom: 10,
        letterSpacing: '0.01em',
    }}>
        {children}
    </div>
);

export default StudentDashboard;