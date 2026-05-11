import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const EnrollTo = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId');

    const [formData, setFormData] = useState({
        educational_level: '',
        strand: '',
        student_type: '',
        year_level: '',
        semester: '',       
        academic_year: '',  
    });

    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasEnrollmentRecord, setHasEnrollmentRecord] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [studentName, setStudentName] = useState('');

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
        'College': ['BTLED (Bachelor of Technical Livelihood Education Major in Home Economics)', 'BINDTECH (Bachelor of Industrial Technology Major in Culinary Technology)']
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Admin Settings for Active Period
                const settingsRes = await axios.get('http://localhost:5000/api/system-settings');
                const adminYear = settingsRes.data.academic_year;
                const adminSemester = settingsRes.data.semester;

                // 2. Fetch student basic info
                const studentRes = await axios.get(`http://localhost:5000/api/student/${studentId}`);
                const student = studentRes.data;
                const middleInitial = student.middle_name ? ` ${student.middle_name[0]}.` : '';
                setStudentName(`${student.last_name}, ${student.first_name}${middleInitial}`);

                // 3. Check enrollment verification status
                let docStatus = 'Pending';
                let payStatus = 'Pending';
                try {
                    const enrollmentStatusRes = await axios.get(`http://localhost:5000/api/student/${studentId}/enrollment-status`);
                    docStatus = enrollmentStatusRes.data.doc_status || 'Pending';
                    payStatus = enrollmentStatusRes.data.pay_status || 'Pending';
                } catch (statusErr) {
                    console.warn('⚠️ Enrollment status not found yet.');
                }
                
                const fullyVerified = docStatus === 'Verified' && payStatus === 'Verified';
                setIsEnrolled(fullyVerified);

                // 4. Fetch existing enrollment data
                const existingEnrollmentRes = await axios.get(`http://localhost:5000/api/student/${studentId}/enroll-to`);
                
                if (existingEnrollmentRes.data && existingEnrollmentRes.data.educational_level) {
                    setFormData({
                        ...existingEnrollmentRes.data,
                    });
                    setIsSubmitted(true);
                    setHasEnrollmentRecord(true);
                    
                    if (fullyVerified) {
                        setMessage('Status: Officially Enrolled for ' + existingEnrollmentRes.data.academic_year);
                    } else {
                        setMessage('Status: Enrollment Submitted (Pending Admin Review)');
                    }
                } else {
                    // Pre-fill with Admin settings for new enrollments
                    setFormData(prev => ({
                        ...prev,
                        academic_year: adminYear,
                        semester: adminSemester
                    }));
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const isReadOnly = hasEnrollmentRecord || isSubmitted;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;

        try {
            await axios.post(`http://localhost:5000/api/student/${studentId}/enroll-to`, formData);
            setIsSubmitted(true);
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
        <DashboardLayout activePath="/enroll-to" studentName={studentName} isEnrolled={isEnrolled}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
                <div style={styles.headerContainer}>
                    <h1 style={styles.headerTitle}>ENROLL TO</h1>
                    <p style={styles.headerSubtitle}>A.Y. {formData.academic_year || '---'}</p>
                </div>

                <div style={styles.card}>
                    {message && (
                        <div style={{
                            ...styles.messageBanner,
                            backgroundColor: isEnrolled ? '#d4f0c6' : '#fff3cd',
                            color: isEnrolled ? '#155724' : '#856404'
                        }}>
                            {isEnrolled ? '✅ ' : '⏳ '}{message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label style={styles.label}>Educational Level</label>
                        <select
                            name="educational_level"
                            value={formData.educational_level}
                            onChange={handleChange}
                            style={isReadOnly ? styles.readonlyInput : styles.input}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
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
                            style={isReadOnly ? styles.readonlyInput : styles.input}
                            required
                            disabled={isReadOnly || ['Kindergarten', 'Elementary School', 'Junior High School'].includes(formData.educational_level)}
                        >
                            <option value="">Select</option>
                            {formData.educational_level && strandOptions[formData.educational_level]?.map(strand => (
                                <option key={strand} value={strand}>{strand}</option>
                            ))}
                        </select>

                        <label style={styles.label}>Student Type</label>
                        <select
                            name="student_type"
                            value={formData.student_type}
                            onChange={handleChange}
                            style={isReadOnly ? styles.readonlyInput : styles.input}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
                            <option value="New Enrollee">New Enrollee</option>
                            <option value="Re-Enrollee">Re-Enrollee</option>
                        </select>

                        <label style={styles.label}>Year Level</label>
                        <select
                            name="year_level"
                            value={formData.year_level}
                            onChange={handleChange}
                            style={isReadOnly ? styles.readonlyInput : styles.input}
                            required
                            disabled={isReadOnly || formData.educational_level === 'Kindergarten'}
                        >
                            <option value="">Select</option>
                            {formData.educational_level && yearLevelOptions[formData.educational_level]?.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>

                        {/* READ ONLY SECTION FOR ADMIN SETTINGS */}
                        <label style={styles.label}>Semester</label>
                        <input
                            type="text"
                            name="semester"
                            value={formData.semester || 'Loading...'}
                            readOnly
                            style={styles.readonlyInput}
                        />

                        <label style={styles.label}>Academic Year</label>
                        <input
                            type="text"
                            name="academic_year"
                            value={formData.academic_year || 'Loading...'}
                            readOnly
                            style={styles.readonlyInput}
                        />

                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            {!isSubmitted ? (
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