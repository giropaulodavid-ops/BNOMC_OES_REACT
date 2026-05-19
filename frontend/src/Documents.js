import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const Documents = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');

  const [formData, setFormData] = useState({
    psa_birth_certificate: null,
    recent_picture: null,
    report_card: null,
    good_moral: null,
    esc_voucher: null,
    honorable_dismissal: null,
  });

  const [fileNames, setFileNames] = useState({
    psa_birth_certificate: 'No file chosen',
    recent_picture: 'No file chosen',
    report_card: 'No file chosen',
    good_moral: 'No file chosen',
    esc_voucher: 'No file chosen',
    honorable_dismissal: 'No file chosen',
  });

  const [submittedFiles, setSubmittedFiles] = useState({
    psa_birth_certificate: '',
    recent_picture: '',
    report_card: '',
    good_moral: '',
    esc_voucher: '',
    honorable_dismissal: '',
  });

  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasEnrollment, setHasEnrollment] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [docStatus, setDocStatus] = useState('Pending');
  const [adminNotes, setAdminNotes] = useState('');

  // Extract grade number from year level
  const extractGrade = (yearLevel) => {
    const match = yearLevel?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Determine required documents based on enrollment
  const determineRequiredDocuments = (enrollmentData) => {
    const required = ['psa_birth_certificate', 'recent_picture', 'report_card'];

    if (enrollmentData) {
      const grade = extractGrade(enrollmentData.year_level);
      const educationalLevel = enrollmentData.educational_level;
      const studentType = enrollmentData.student_type;

      // Good Moral for grade 2 and higher
      if (grade >= 2 || educationalLevel === 'Senior High School' || educationalLevel === 'College') {
        required.push('good_moral');
      }

      // ESC/Voucher for grade 8-10 transferees/returning students
      if (
        (grade >= 8 && grade <= 10 || educationalLevel === 'Senior High School') &&
        studentType === 'Re-Enrollee'
      ) {
        required.push('esc_voucher');
      }

      // Honorable Dismissal for College Transferees
      if (educationalLevel === 'College' && studentType === 'Re-Enrollee') {
        required.push('honorable_dismissal');
      }
    }

    return required;
  };

useEffect(() => {
    if (!studentId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch student info for the header
        const studentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}`);
        const student = studentRes.data;
        const middleInitial = student.middle_name ? ` ${student.middle_name[0]}.` : '';
        setStudentName(`${student.last_name}, ${student.first_name}${middleInitial}`);

        // 2. Check enrollment status (To show if they are officially enrolled)
        try {
          const enrollmentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/enrollment-status`);
          // Note: Check if your backend uses 'pay_status' or 'payment_status'
          const docStat = enrollmentRes.data.doc_status || 'Pending';
          const payStat = enrollmentRes.data.payment_status || 'Pending';
          setIsEnrolled(docStat === 'Verified' && payStat === 'Verified');
        } catch (statusErr) {
          console.warn('⚠️ Enrollment status not available yet');
        }

        // 3. Fetch existing enrollment choices (Grade Level, etc.)
        const existingEnrollmentRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/enroll-to`);
        const enrollmentData = existingEnrollmentRes.data;

        if (enrollmentData && enrollmentData.educational_level) {
          setHasEnrollment(true);
          const required = determineRequiredDocuments(enrollmentData);
          setRequiredDocuments(required);

          // 4. CHECK IF DOCUMENTS ARE ALREADY SUBMITTED (Read-Only Logic)
          try {
            const documentsRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/documents`);
            const docStat = documentsRes.data.docStatus || 'Pending';
            const adminNote = documentsRes.data.adminNotes || '';
            
            setDocStatus(docStat);
            setAdminNotes(adminNote);
            
            if (documentsRes.data.isSubmitted) {
              const savedData = documentsRes.data.data;
              
              setSubmittedFiles({
                psa_birth_certificate: savedData.psa_birth_certificate || '',
                recent_picture: savedData.recent_picture || '',
                report_card: savedData.report_card || '',
                good_moral: savedData.good_moral || '',
                esc_voucher: savedData.esc_voucher || '',
                honorable_dismissal: savedData.honorable_dismissal || '',
              });

              setIsSubmitted(true); // <--- This locks the UI
              setMessage('You have already submitted your documents.');
              console.log('✅ Documents found: Form set to Read-Only');
            } else {
              if (docStat === 'Rejected') {
                const savedData = documentsRes.data.data || {};
                setSubmittedFiles({
                  psa_birth_certificate: savedData.psa_birth_certificate || '',
                  recent_picture: savedData.recent_picture || '',
                  report_card: savedData.report_card || '',
                  good_moral: savedData.good_moral || '',
                  esc_voucher: savedData.esc_voucher || '',
                  honorable_dismissal: savedData.honorable_dismissal || '',
                });
                setIsSubmitted(false); // Enable form editing
                setMessage('Your previous document submission was rejected. Please re-upload.');
                console.log('ℹ️ Documents rejected: Form is editable for re-upload');
              } else {
                console.log('ℹ️ No previous documents found: Form is editable');
              }
            }
          } catch (docErr) {
            console.warn('Error fetching document submission status:', docErr.message);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, studentId]);

  const handleFileChange = (field) => (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, [field]: file });
      setFileNames({ ...fileNames, [field]: file.name });
    }
  };

  const handleChooseFile = (field) => {
    document.getElementById(`file-input-${field}`).click();
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate requirements: a document is required if it is neither chosen newly nor already submitted
    for (const field of requiredDocuments) {
        if (!formData[field] && !submittedFiles[field]) {
            setMessage(`Please upload your ${field.replace(/_/g, ' ')}.`);
            return;
        }
    }

    // IMPORTANT: Use FormData for file uploads
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (formData[key]) {
            data.append(key, formData[key]); 
        }
    });

    try {
        setLoading(true);
        await axios.post(
            `http://127.0.0.1:5000/api/student/${studentId}/documents-submit`,
            data,
            { headers: { 'Content-Type': 'multipart/form-data' } } // Required header
        );

        setMessage('Documents submitted successfully!');
        setDocStatus('Pending');
        setAdminNotes('');
        setIsSubmitted(true);
        
        // Refresh the file display after submitting
        const documentsRes = await axios.get(`http://127.0.0.1:5000/api/student/${studentId}/documents`);
        if (documentsRes.data.isSubmitted) {
            const savedData = documentsRes.data.data;
            setSubmittedFiles({
                psa_birth_certificate: savedData.psa_birth_certificate || '',
                recent_picture: savedData.recent_picture || '',
                report_card: savedData.report_card || '',
                good_moral: savedData.good_moral || '',
                esc_voucher: savedData.esc_voucher || '',
                honorable_dismissal: savedData.honorable_dismissal || '',
            });
        }
    } catch (err) {
        console.error(err);
        setMessage('Error uploading files. Please try again.');
    } finally {
        setLoading(false);
    }
};

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a4d92',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          Loading document details...
        </div>
      </div>
    );
  }

  const cardStyle = {
    width: '100%',
    maxWidth: 650,
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
    fontSize: '0.95rem',
  };

  const fileInputWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 10,
    background: '#fff',
    border: '1px solid #ddd',
    marginBottom: 16,
    minHeight: 46,
  };

  const customFileButtonStyle = {
    background: '#f4ff00',
    color: '#003577',
    border: 'none',
    padding: '8px 14px',
    fontWeight: 800,
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const fileNameStyle = {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#003577',
    fontWeight: 700,
    fontSize: '0.95rem',
  };

  const docDescriptionStyle = {
    fontSize: '0.85rem',
    color: '#e8e8e8',
    marginBottom: 12,
    fontWeight: 400,
  };

  const submitButtonStyle = {
    border: 'none',
    background: '#f4ff00',
    color: '#003577',
    fontWeight: 900,
    padding: '12px 40px',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 10,
    width: '100%',
    fontSize: '1rem',
    fontFamily: 'Montserrat, sans-serif',
  };

  const disabledButtonStyle = {
    ...submitButtonStyle,
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const submittedFileStyle = {
    color: '#f4ff00',
    fontSize: '0.9rem',
    marginTop: -12,
    marginBottom: 8,
  };

  const successMessageStyle = {
    color: '#0f0',
    fontWeight: 700,
    marginBottom: 16,
    textAlign: 'center',
  };

  return (
    <DashboardLayout activePath="/documents" studentName={studentName} isEnrolled={isEnrolled}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 900,
              letterSpacing: '0.14em',
              margin: 0,
              color: '#071d5d',
              textTransform: 'uppercase',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            DOCUMENTS
          </h1>
        </div>

        <div style={cardStyle}>
          {docStatus === 'Rejected' && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '16px 20px',
              borderRadius: '10px',
              border: '1px solid #f5c6cb',
              marginBottom: '24px',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ DOCUMENT VERIFICATION REJECTED
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Your submitted documents were not approved by the admissions officer. Please read the comments below, upload the corrected documents, and submit again.
              </p>
              <div style={{ background: 'rgba(255, 255, 255, 0.55)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #721c24', fontStyle: 'italic', color: '#721c24', fontSize: '0.9rem' }}>
                "{adminNotes || 'No comments provided by administrator.'}"
              </div>
            </div>
          )}

          {message && (
            <p style={successMessageStyle}>
              {message}
            </p>
          )}

          {!hasEnrollment ? (
            <p style={{ ...successMessageStyle, color: '#ffcc00' }}>
              Please complete your enrollment first before submitting documents.{' '}
              <a
                href="/enroll-to"
                style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Go to Enrollment
              </a>
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              {requiredDocuments.includes('psa_birth_certificate') && (
                <>
                  <label style={labelStyle}>PSA Birth Certificate</label>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('psa_birth_certificate')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.psa_birth_certificate ? fileNames.psa_birth_certificate : (submittedFiles.psa_birth_certificate || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-psa_birth_certificate"
                      onChange={handleFileChange('psa_birth_certificate')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.psa_birth_certificate && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.psa_birth_certificate}
                    </div>
                  )}
                </>
              )}

              {requiredDocuments.includes('recent_picture') && (
                <>
                  <label style={labelStyle}>2x2 Recent Picture</label>
                  <p style={docDescriptionStyle}>
                    (Blue Background for JHS and lower, White Background for SHS and higher)
                  </p>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('recent_picture')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.recent_picture ? fileNames.recent_picture : (submittedFiles.recent_picture || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-recent_picture"
                      onChange={handleFileChange('recent_picture')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.recent_picture && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.recent_picture}
                    </div>
                  )}
                </>
              )}

              {requiredDocuments.includes('report_card') && (
                <>
                  <label style={labelStyle}>Report Card / Certificate of Grades / ECCD Certificate</label>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('report_card')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.report_card ? fileNames.report_card : (submittedFiles.report_card || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-report_card"
                      onChange={handleFileChange('report_card')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.report_card && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.report_card}
                    </div>
                  )}
                </>
              )}

              {requiredDocuments.includes('good_moral') && (
                <>
                  <label style={labelStyle}>Good Moral</label>
                  <p style={docDescriptionStyle}>(for grade 2 and higher)</p>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('good_moral')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.good_moral ? fileNames.good_moral : (submittedFiles.good_moral || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-good_moral"
                      onChange={handleFileChange('good_moral')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.good_moral && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.good_moral}
                    </div>
                  )}
                </>
              )}

              {requiredDocuments.includes('esc_voucher') && (
                <>
                  <label style={labelStyle}>ESC/Voucher Certificate</label>
                  <p style={docDescriptionStyle}>
                    (for grade 8 to 10 transferees/returning students)
                  </p>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('esc_voucher')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.esc_voucher ? fileNames.esc_voucher : (submittedFiles.esc_voucher || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-esc_voucher"
                      onChange={handleFileChange('esc_voucher')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.esc_voucher && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.esc_voucher}
                    </div>
                  )}
                </>
              )}

              {requiredDocuments.includes('honorable_dismissal') && (
                <>
                  <label style={labelStyle}>Honorable Dismissal</label>
                  <p style={docDescriptionStyle}>(For College Transferees)</p>
                  <div style={fileInputWrapperStyle}>
                    <button
                      type="button"
                      style={{
                        ...customFileButtonStyle,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleChooseFile('honorable_dismissal')}
                      disabled={isSubmitted}
                    >
                      Choose File
                    </button>
                    <span style={fileNameStyle}>
                      {formData.honorable_dismissal ? fileNames.honorable_dismissal : (submittedFiles.honorable_dismissal || 'No file chosen')}
                    </span>
                    <input
                      type="file"
                      id="file-input-honorable_dismissal"
                      onChange={handleFileChange('honorable_dismissal')}
                      style={{ display: 'none' }}
                      disabled={isSubmitted}
                    />
                  </div>
                  {submittedFiles.honorable_dismissal && (
                    <div style={submittedFileStyle}>
                      ✓ Submitted: {submittedFiles.honorable_dismissal}
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                style={isSubmitted ? disabledButtonStyle : submitButtonStyle}
                disabled={isSubmitted}
              >
                PROCEED
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
