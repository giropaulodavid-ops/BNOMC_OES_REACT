import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const EnrollTo = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId');
    const storedName = localStorage.getItem('studentName');

    const [formData, setFormData] = useState({
        educational_level: '',
        strand: '',
        student_type: '',
        year_level: '',
        semester: '',       
        academic_year: '',  
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [studentName] = useState(storedName || 'Student');
    const [hasEnrollmentRecord, setHasEnrollmentRecord] = useState(false); // Added missing state
    const [verificationStatus, setVerificationStatus] = useState('');

    const yearLevelOptions = {
        'Kindergarten': ['Kindergarten'],
        'Elementary School': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        'Junior High School': ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        'Senior High School': ['Grade 11', 'Grade 12'],
        'College': ['1st Year College', '2nd Year College', '3rd Year College', '4th Year College']
    };

    const strandOptions = {
        'Kindergarten': ['N/A'],
        'Elementary School': ['N/A'],
        'Junior High School': ['N/A'],
        'Senior High School': ['ABM', 'STEM', 'HUMSS', 'GAS'],
        'College': [
            'BTLED (Bachelor of Technical Livelihood Education Major in Home Economics)', 
            'BINDTECH (Bachelor of Industrial Technology Major in Culinary Technology)'
        ]
    };

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // 1. Fetch current system settings and enrollment status
                const res = await axios.get(`http://localhost:5000/api/student/${studentId}/enrollment-status`);
                
                if (res.data?.isEnrolled) {
                    const dbData = res.data.enrollmentData;
                    setFormData({
                        educational_level: dbData.educational_level || '',
                        strand: dbData.strand || '',
                        student_type: dbData.student_type || '',
                        year_level: dbData.year_level || '',
                        semester: dbData.semester,
                        academic_year: dbData.academic_year,
                    });
                    setIsEnrolled(true);
                    setHasEnrollmentRecord(true);
                    setMessage('You are already enrolled for this term.');
                } else {
                    // Set defaults from system settings if not enrolled
                    setFormData(prev => ({
                        ...prev,
                        academic_year: res.data?.currentPeriod?.academic_year || '',
                        semester: res.data?.currentPeriod?.semester || ''
                    }));
                }

                // 2. Optional: Check verification status if needed specifically from the other endpoint
                const resCheck = await fetch(`http://localhost:5000/api/student/${studentId}/enrollment-check`);
                const dataCheck = await resCheck.json();
                if (dataCheck.enrolled) {
                    setVerificationStatus(dataCheck.status);
                }

            } catch (err) {
                console.error("Error fetching status:", err);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) checkStatus();
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'educational_level') {
            const isBasicEd = ['Kindergarten', 'Elementary School', 'Junior High School'].includes(value);
            setFormData({
                ...formData,
                educational_level: value,
                strand: isBasicEd ? 'N/A' : '',
                year_level: value === 'Kindergarten' ? 'Kindergarten' : ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEnrolled) return;

        if (!formData.educational_level || !formData.strand || !formData.year_level || !formData.student_type) {
            alert("Please fill out all fields.");
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/student/${studentId}/enroll-to`, formData);
            setIsEnrolled(true);
            setHasEnrollmentRecord(true);
            setMessage('Enrollment selection saved successfully!');
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || 'Failed to submit enrollment.');
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingText}>Loading enrollment details...</div>
            </div>
        );
    }

    return (
        <DashboardLayout activePath="/enroll-to" studentName={studentName} isEnrolled={verificationStatus === 'Verified'}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
                <div style={styles.headerContainer}>
                    <h1 style={styles.headerTitle}>ENROLL TO</h1>
                    <p style={styles.headerSubtitle}>A.Y. {formData.academic_year || '---'}</p>
                </div>

                <div style={styles.card}>
                    {message && (
                        <div style={{
                            ...styles.messageBanner,
                            backgroundColor: isEnrolled ? '#d4f0c6' : '#f8d7da',
                            color: isEnrolled ? '#155724' : '#721c24',
                            border: isEnrolled ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                        }}>
                            {isEnrolled ? '✅ ' : '❌ '}{message}
                            {verificationStatus && <div style={{fontSize: '0.8rem', marginTop: '5px'}}>Status: {verificationStatus}</div>}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label style={styles.label}>Educational Level</label>
                        <select
                            name="educational_level"
                            value={formData.educational_level}
                            onChange={handleChange}
                            style={isEnrolled ? styles.readonlyInput : styles.input}
                            required
                            disabled={isEnrolled}
                        >
                            <option value="">Select Level</option>
                            <option value="Kindergarten">Kindergarten</option>
                            <option value="Elementary School">Elementary School</option>
                            <option value="Junior High School">Junior High School</option>
                            <option value="Senior High School">Senior High School</option>
                            <option value="College">College</option>
                        </select>

                        <label style={styles.label}>Specific Strand/Program/Course</label>
                        <select
                            name="strand"
                            value={formData.strand}
                            onChange={handleChange}
                            style={(isEnrolled || ['Kindergarten', 'Elementary School', 'Junior High School'].includes(formData.educational_level)) ? styles.readonlyInput : styles.input}
                            required
                            disabled={isEnrolled || ['Kindergarten', 'Elementary School', 'Junior High School'].includes(formData.educational_level)}
                        >
                            <option value="">Select Strand/Course</option>
                            {formData.educational_level && strandOptions[formData.educational_level]?.map(strand => (
                                <option key={strand} value={strand}>{strand}</option>
                            ))}
                        </select>

                        <label style={styles.label}>Student Type</label>
                        <select
                            name="student_type"
                            value={formData.student_type}
                            onChange={handleChange}
                            style={isEnrolled ? styles.readonlyInput : styles.input}
                            required
                            disabled={isEnrolled}
                        >
                            <option value="">Select Type</option>
                            <option value="New Enrollee">New Enrollee</option>
                            <option value="Re-Enrollee">Re-Enrollee</option>
                        </select>

                        <label style={styles.label}>Year Level</label>
                        <select
                            name="year_level"
                            value={formData.year_level}
                            onChange={handleChange}
                            style={(isEnrolled || formData.educational_level === 'Kindergarten') ? styles.readonlyInput : styles.input}
                            required
                            disabled={isEnrolled || formData.educational_level === 'Kindergarten'}
                        >
                            <option value="">Select Year</option>
                            {formData.educational_level && yearLevelOptions[formData.educational_level]?.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>

                        <label style={styles.label}>Semester</label>
                        <input
                            type="text"
                            value={formData.semester || 'Loading...'}
                            readOnly
                            style={styles.readonlyInput}
                        />

                        <label style={styles.label}>Academic Year</label>
                        <input
                            type="text"
                            value={formData.academic_year || 'Loading...'}
                            readOnly
                            style={styles.readonlyInput}
                        />

                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            {!isEnrolled ? (
                                <button type="submit" style={styles.submitButton}>
                                    SUBMIT ENROLLMENT
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/documents')}
                                    style={styles.nextButton}
                                >
                                    NEXT: UPLOAD DOCUMENTS →
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

const styles = {
    loadingContainer: {
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0a4d92' 
    },
    loadingText: { 
        color: '#fff', 
        fontFamily: 'Montserrat, sans-serif', 
        fontWeight: 700 
    },
    headerContainer: { 
        textAlign: 'center', 
        marginBottom: 24 
    },
    headerTitle: { 
        fontSize: '2.4rem', 
        fontWeight: 900, 
        letterSpacing: '0.1em', 
        margin: 0, 
        color: '#071d5d' 
    },
    headerSubtitle: { 
        fontWeight: 700, 
        color: '#0a4d92', 
        marginTop: -5 
    },
    card: {
        width: '100%',
        maxWidth: 580,
        margin: '0 auto',
        background: 'rgba(11, 64, 144, .98)',
        borderRadius: 16,
        padding: 35,
        boxShadow: '0 12px 30px rgba(0,0,0,.3)',
        color: 'white',
    },
    messageBanner: {
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.9rem'
    },
    label: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 600,
        display: 'block',
        marginBottom: 6,
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    input: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 15px',
        borderRadius: 8,
        border: '2px solid transparent',
        marginBottom: 18,
        fontSize: '1rem',
        fontFamily: 'Montserrat, sans-serif',
        background: '#fff',
        color: '#1a1a2e',
        outline: 'none',
    },
    readonlyInput: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 15px',
        borderRadius: 8,
        border: 'none',
        marginBottom: 18,
        fontSize: '1rem',
        fontFamily: 'Montserrat, sans-serif',
        background: 'rgba(255,255,255,0.15)',
        color: '#fff',
        cursor: 'not-allowed'
    },
    submitButton: {
        background: '#f4ff00',
        color: '#003577',
        fontWeight: 900,
        padding: '14px 50px',
        borderRadius: 30,
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0 4px 15px rgba(244, 255, 0, 0.3)'
    },
    nextButton: {
        background: '#fff',
        color: '#0a4d92',
        fontWeight: 800,
        padding: '14px 40px',
        borderRadius: 30,
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
    }
};

export default EnrollTo;