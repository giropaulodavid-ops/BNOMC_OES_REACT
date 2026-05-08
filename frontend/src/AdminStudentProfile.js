import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminStudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        // Fetching data from the backend route
        fetch(`http://localhost:5000/api/admin/student/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data))
            .catch(err => console.error("Error fetching student details:", err));
    }, [id]);

    if (!student) return (
        <div style={{ color: 'white', textAlign: 'center', padding: '50px', fontFamily: 'Montserrat' }}>
            Loading Student Profile...
        </div>
    );

    // --- Photo-Matched Styles with Requested Changes ---
    const containerStyle = {
        fontFamily: "'Montserrat', sans-serif",
        // Lowered opacity using a linear-gradient overlay
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('/BNOMC_bg.jpg')", 
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        paddingBottom: '50px'
    };

    const headerStyle = {
        backgroundColor: '#0a4d92',
        color: 'white',
        padding: '15px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    };

    const sectionWrapper = {
        maxWidth: '800px', // Narrowed for better single-column appearance
        margin: '20px auto',
        padding: '0 20px'
    };

    const cardStyle = {
        backgroundColor: '#0a4d92', // Dark blue card from photos
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr', // Changed to single column as requested
        gap: '20px'
    };

    const sectionHeader = {
        color: 'black',
        fontSize: '1.2rem',
        fontWeight: '900',
        marginBottom: '10px',
        textTransform: 'none'
    };

    const groupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };

    const labelStyle = {
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    const inputStyle = {
        backgroundColor: 'white', // White display boxes from photos
        padding: '12px 15px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
        minHeight: '45px',
        display: 'flex',
        alignItems: 'center'
    };

    const yellowBtn = {
        backgroundColor: '#e6e94e', // Yellow button color from photos
        color: 'black',
        padding: '10px 40px',
        borderRadius: '8px',
        fontWeight: '900',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem'
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <img src="/BNOMC_Logo.png" alt="Logo" style={{ width: '50px' }} />
                <div>
                    <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Blessed Name of Mary College, Inc.</h1>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>San Isidro Pili, Camarines Sur</p>
                </div>
            </header>

            <div style={sectionWrapper}>
                <div style={{ margin: '20px 0' }}>
                    <button style={yellowBtn} onClick={() => navigate('/admin/dashboard')}>BACK</button>
                </div>

                <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '2px', color: '#0a4d92' }}>
                    STUDENT INFORMATION
                </h1>

                {/* 1. Student Information */}
                <h3 style={sectionHeader}>Student Information</h3>
                <div style={cardStyle}>
                    <div style={groupStyle}><label style={labelStyle}>First Name</label><div style={inputStyle}>{student.first_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Middle Name</label><div style={inputStyle}>{student.middle_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Last Name</label><div style={inputStyle}>{student.last_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Date of Birth</label><div style={inputStyle}>{student.date_of_birth}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Religion</label><div style={inputStyle}>{student.religion}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Gender</label><div style={inputStyle}>{student.gender}</div></div>
                </div>

                {/* 2. Contact Information */}
                <h3 style={sectionHeader}>Student Contact Information</h3>
                <div style={cardStyle}>
                    <div style={groupStyle}><label style={labelStyle}>Contact Number</label><div style={inputStyle}>{student.contact_number}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Email</label><div style={inputStyle}>{student.email_address}</div></div>
                </div>

                {/* 3. Guardian Information */}
                <h3 style={sectionHeader}>Guardian Information</h3>
                <div style={cardStyle}>
                    <div style={groupStyle}><label style={labelStyle}>First Name</label><div style={inputStyle}>{student.guardian_first_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Middle Name</label><div style={inputStyle}>{student.guardian_middle_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Last Name</label><div style={inputStyle}>{student.guardian_last_name}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Date of Birth</label><div style={inputStyle}>{student.guardian_birth_date}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Occupation</label><div style={inputStyle}>{student.guardian_occupation}</div></div>
                </div>

                {/* 4. Educational Background */}
                <h3 style={sectionHeader}>User Educational Background (For Transferees Only)</h3>
                <div style={cardStyle}>
                    <div style={groupStyle}><label style={labelStyle}>Previous School Attended</label><div style={inputStyle}>{student.prev_school || 'N/A'}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Address of Previous School</label><div style={inputStyle}>{student.prev_school_address || 'N/A'}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Previous Grade Level</label><div style={inputStyle}>{student.prev_grade_level || 'N/A'}</div></div>
                    <div style={groupStyle}><label style={labelStyle}>Previous School Year Attended</label><div style={inputStyle}>{student.prev_sy || 'N/A'}</div></div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentProfile;