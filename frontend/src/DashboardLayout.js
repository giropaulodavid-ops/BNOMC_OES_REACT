import React, { useState, useEffect } from 'react'; // Fixed duplicate import
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Use axios for consistency

const DashboardLayout = ({ children, activePath, studentName }) => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      if (!studentId) return;
      
      try {
        // Calling the specific status endpoint we created in server.js
        const response = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/enrollment-status`);
        setIsEnrolled(response.data.isEnrolled);
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
      }
    };

    fetchEnrollmentStatus();
    
    // Optional: Refresh status every 30 seconds in case admin verifies while student is logged in
    const interval = setInterval(fetchEnrollmentStatus, 30000);
    return () => clearInterval(interval);
  }, [studentId]);

  const navItems = [
    { label: 'STUDENT INFORMATION', path: '/student-dashboard' },
    { label: 'ENROLL TO', path: '/enroll-to' },
    { label: 'DOCUMENTS', path: '/documents' },
    { label: 'PAYMENT', path: '/payment' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Background Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/BNOMC_bg.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.45,
      }} />

      <header style={{
        position: 'relative', zIndex: 10,
        background: '#0a4d92',
        padding: '8px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {studentName && (
            <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>
              Applicant Name: <strong style={{ fontWeight: 900 }}>{studentName}</strong>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Dynamic Status Badge */}
            <span style={{
              background: isEnrolled ? '#27ae60' : '#c0392b',
              color: '#fff', fontWeight: 900,
              fontSize: '0.72rem', padding: '5px 16px',
              borderRadius: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {isEnrolled ? 'ENROLLED' : 'NOT ENROLLED'}
            </span>
            <button onClick={handleLogout} style={{
              background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6,
              padding: '6px 18px', fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
              letterSpacing: '0.05em', transition: 'background 0.2s',
            }} onMouseOver={e => e.currentTarget.style.background = '#a93226'} onMouseOut={e => e.currentTarget.style.background = '#c0392b'}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flex: 1 }}>
        <nav style={{
          width: 190, background: '#0a4d92', padding: '28px 14px', display: 'flex',
          flexDirection: 'column', gap: 14, flexShrink: 0,
        }}>
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                background: '#e6e94e',
                border: activePath === item.path ? '3px solid #fff' : '3px solid transparent',
                borderRadius: 6,
                padding: '12px 10px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: '0.72rem',
                color: '#073b75',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'transform 0.15s',
                lineHeight: 1.3,
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;