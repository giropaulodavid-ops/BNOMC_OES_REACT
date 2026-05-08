import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const EnrollTo = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId');

    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;

    const [formData, setFormData] = useState({
        educational_level: '',
        strand: '',
        student_type: '',
        year_level: '',
        semester: '',
        academic_year: currentAcademicYear,
    });

    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasEnrollmentRecord, setHasEnrollmentRecord] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [studentName, setStudentName] = useState('');

    // Dynamic dropdown options
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

    const semesterOptions = {
        'Kindergarten': ['Full Year'],
        'Elementary School': ['Full Year'],
        'Junior High School': ['Full Year'],
        'Senior High School': ['1st', '2nd'],
        'College': ['1st', '2nd']
    };

    useEffect(() => {
        if (!studentId) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch student info
                const studentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}`);
                const student = studentRes.data;
                const middleInitial = student.middle_name ? ` ${student.middle_name[0]}.` : '';
                setStudentName(`${student.last_name}, ${student.first_name}${middleInitial}`);

                // Check enrollment status (wrapped in try-catch to not block page)
                let docStatus = 'Pending';
                let payStatus = 'Pending';
                try {
                    const enrollmentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/enrollment-status`);
                    docStatus = enrollmentRes.data.doc_status || 'Pending';
                    payStatus = enrollmentRes.data.pay_status || 'Pending';
                } catch (statusErr) {
                    console.warn('⚠️ Could not fetch enrollment status:', statusErr.message);
                }
                setIsEnrolled(docStatus === 'Verified' && payStatus === 'Verified');

                // Fetch existing enrollment if any
                const existingEnrollmentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/enroll-to`);
                console.log('Enrollment API Response:', existingEnrollmentRes.data);
                const currentYear = new Date().getFullYear();
                const currentAcademicYear = `${currentYear}-${currentYear + 1}`;

                // Check if enrollment record exists
                const hasExistingEnrollment = existingEnrollmentRes.data && 
                    Object.keys(existingEnrollmentRes.data).length > 0 && 
                    existingEnrollmentRes.data.educational_level;

                console.log('Has Existing Enrollment:', hasExistingEnrollment);

                if (hasExistingEnrollment) {
                    console.log('Loading existing enrollment data:', existingEnrollmentRes.data);
                    setFormData({
                        ...existingEnrollmentRes.data,
                        academic_year: existingEnrollmentRes.data.academic_year || currentAcademicYear,
                    });
                    setIsSubmitted(true);
                    setHasEnrollmentRecord(true);
                    setMessage('You have already submitted your enrollment.');
                } else {
                    console.log('No existing enrollment found, allowing new enrollment');
                    setHasEnrollmentRecord(false);
                    setFormData(prev => ({
                        ...prev,
                        academic_year: currentAcademicYear
                    }));

                    if (docStatus === 'Verified' && payStatus === 'Verified') {
                        setMessage('You are already enrolled and cannot change enrollment selection.');
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, studentId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isReadOnly = hasEnrollmentRecord || isSubmitted || isEnrolled;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;

        const payload = {
            ...formData,
            academic_year: formData.academic_year || currentAcademicYear,
        };

        try {
            await axios.post(`http://127.0.0.1:5000/api/student/${studentId}/enroll-to`, payload);
            console.log('Enrollment submitted successfully');
            setIsSubmitted(true);
            setHasEnrollmentRecord(true);
            setFormData(prev => ({ ...prev, academic_year: payload.academic_year }));
            setMessage('Enrollment submitted successfully.');
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || 'Enrollment failed.');
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a4d92' }}>
                <div style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                    Loading enrollment details...
                </div>
            </div>
        );
    }

    const cardStyle = {
        width: '100%',
        maxWidth: 580,
        margin: '0 auto',
        background: 'rgba(11, 64, 144, .95)',
        borderRadius: 12,
        padding: 30,
        boxShadow: '0 10px 25px rgba(0,0,0,.3)',
        color: 'white',
    };

    const labelStyle = {
        color: '#fff',
        fontWeight: 600,
        display: 'block',
        marginBottom: 8,
        fontFamily: 'Montserrat, sans-serif',
    };

    const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: 12,
        borderRadius: 8,
        border: 'none',
        marginBottom: 16,
        fontSize: '1rem',
        fontFamily: 'Montserrat, sans-serif',
        background: '#fff',
        color: '#1a1a2e',
    };

    const readonlyInputStyle = {
        ...inputStyle,
        backgroundColor: '#e8e8e8',
        color: '#333',
    };

    const buttonStyle = {
        border: 'none',
        background: '#f4ff00',
        color: '#003577',
        fontWeight: 900,
        padding: '12px 40px',
        borderRadius: 8,
        cursor: 'pointer',
        marginTop: 10,
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '1rem',
    };

    return (
        <DashboardLayout activePath="/enroll-to" studentName={studentName} isEnrolled={isEnrolled}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '0.14em', margin: 0, color: '#071d5d', textTransform: 'uppercase' }}>
                        ENROLL TO
                    </h1>
                </div>
                <div style={cardStyle}>
                    {message && (
                        <p style={{ color: '#d4f0c6', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                            {message}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label style={labelStyle}>Educational Level</label>
                        <select
                            name="educational_level"
                            value={formData.educational_level}
                            onChange={handleChange}
                            style={inputStyle}
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

                        <label style={labelStyle}>Specific Strand/Program/Course</label>
                        <select
                            name="strand"
                            value={formData.strand}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
                            {formData.educational_level && strandOptions[formData.educational_level]?.map(strand => (
                                <option key={strand} value={strand} style={{ color: '#1a1a2e' }}>{strand}</option>
                            ))}
                        </select>

                        <label style={labelStyle}>Student Type</label>
                        <select
                            name="student_type"
                            value={formData.student_type}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
                            <option value="New Enrollee">New Enrollee</option>
                            <option value="Re-Enrollee">Re-Enrollee</option>
                        </select>

                        <label style={labelStyle}>Year Level</label>
                        <select
                            name="year_level"
                            value={formData.year_level}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
                            {formData.educational_level && yearLevelOptions[formData.educational_level]?.map(level => (
                                <option key={level} value={level} style={{ color: '#1a1a2e' }}>{level}</option>
                            ))}
                        </select>

                        <label style={labelStyle}>Semester</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select</option>
                            {formData.educational_level && semesterOptions[formData.educational_level]?.map(sem => (
                                <option key={sem} value={sem} style={{ color: '#1a1a2e' }}>{sem}</option>
                            ))}
                        </select>

                        <label style={labelStyle}>Academic Year</label>
                        <input
                            type="text"
                            name="academic_year"
                            value={formData.academic_year || currentAcademicYear}
                            readOnly
                            style={readonlyInputStyle}
                        />

                        <div style={{ textAlign: 'center', marginTop: 18 }}>
                            <button
                                type="submit"
                                style={{...buttonStyle, display: isReadOnly ? 'none' : 'block'}}
                                onMouseOver={e => e.currentTarget.style.background = '#e6f000'}
                                onMouseOut={e => e.currentTarget.style.background = '#f4ff00'}
                            >
                                PROCEED
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EnrollTo;
