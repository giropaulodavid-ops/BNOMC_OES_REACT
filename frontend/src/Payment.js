import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import DashboardLayout from './DashboardLayout';

// ─── Sub-page: Onsite Steps ───────────────────────────────────────────────────
const OnsiteSteps = ({ studentId, formattedName, onBack }) => (
  <div style={styles.subContent}>
    <h2 style={styles.pageTitle}>ONSITE PAYMENT</h2>

    <div style={styles.applicantInfo}>
      <p>Applicant ID: <span style={styles.infoSpan}>{studentId}</span></p>
      <p>Student Name: <span style={styles.infoSpan}>{formattedName}</span></p>
    </div>

    <p style={styles.sectionSubheader}>How to pay Onsite?</p>

    <ul style={styles.stepsList}>
      {[
        { title: 'Step 1:', desc: <><strong>Save Your Details.</strong> Take note of your <strong>Applicant ID</strong> and <strong>Full Name</strong>. You may also take a screenshot of this page for reference. Make sure the details are clear and easy to read.</> },
        { title: 'Step 2:', desc: <><strong>Present to Cashier.</strong> Visit the campus and <strong>present your Applicant ID</strong> or a clear screenshot of this page at the Cashier's Window.</> },
        { title: 'Step 3:', desc: <><strong>Settle Enrollment Fee.</strong> Pay the enrollment fee of <strong>₱5,000</strong> to the cashier.</> },
        { title: 'Step 4:', desc: <><strong>Check Enrollment Status.</strong> After payment, check your email for the <strong>Official Enrollment Confirmation</strong> to verify your status.</> },
      ].map((step, i) => (
        <li key={i} style={styles.stepItem}>
          <div style={styles.stepTitle}>{step.title}</div>
          <p style={styles.stepDesc}>{step.desc}</p>
        </li>
      ))}
    </ul>

    <div style={styles.importantNote}>
      <p style={styles.noteHeader}>Important Note:</p>
      <p style={styles.noteText}>
        To ensure a smooth enrollment process, please bring your required documents and submit them to the <strong>Registrar's Office</strong> upon your visit.
      </p>
    </div>

    <button style={styles.backBtn} onClick={onBack}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f741'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e6e94e'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      DONE
    </button>
  </div>
);

// ─── Sub-page: Online Payment ─────────────────────────────────────────────────
const OnlinePayment = ({ studentId, formattedName, onBack }) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [refMessage, setRefMessage] = useState('');
  const [refError, setRefError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // ADDED: Tracking submission state

  // ADDED: Logic to fetch the reference number from the correct database table
  useEffect(() => {
    const fetchExistingPayment = async () => {
      try {
        const res = await api.get(`/student/${studentId}/payment`);
        // We check for 'reference_number' which matches your SQL table column
        if (res.data && res.data.reference_number) {
          setReferenceNumber(res.data.reference_number);
          setIsSubmitted(true); // Lock the form if data exists
        }
      } catch (err) {
        console.error("Error fetching payment info:", err);
      }
    };
    if (studentId) fetchExistingPayment();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitted) return; // Prevent double submission

    const trimmed = referenceNumber.trim();
    if (!trimmed) {
      setRefError('Please enter a valid reference number.');
      setRefMessage('');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/student/${studentId}/payment`, { reference_number: trimmed });
      setRefMessage('Reference number submitted successfully! Our admin will verify your payment shortly.');
      setRefError('');
      setIsSubmitted(true); // ADDED: Lock the UI immediately after success
    } catch {
      setRefError('Submission failed. Please try again.');
      setRefMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const banks = [
    { name: 'BDO', detail: <><strong>Blessed Name of Mary Learning School</strong><br />Number: <strong>003500025409</strong></> },
    { name: 'LANDBANK', detail: <><strong>Blessed Name of Mary College, Inc.</strong><br />Number: <strong>2702104583</strong></> },
    { name: 'PADALA SERVICES', detail: <>Receiver: <strong>Noemi O. Marpuri</strong><br />Contact: <strong>09953991761</strong></>, small: true },
  ];

  return (
    <div style={styles.subContent}>
      <h2 style={styles.pageTitle}>ONLINE PAYMENT</h2>

      <div style={styles.applicantInfo}>
        <p>Applicant ID: <span style={styles.infoSpan}>{studentId}</span></p>
        <p>Student Name: <span style={styles.infoSpan}>{formattedName}</span></p>
      </div>

      <p style={{ ...styles.sectionSubheader, marginTop: 24 }}>Online &amp; Bank Payment Steps</p>

      {/* Step 1 */}
      <div style={styles.stepItem}>
        <div style={styles.stepTitle}>Step 1:</div>
        <p style={styles.stepDesc}>Transfer the initial enrollment fee to one of our authorized accounts below.</p>
        <div style={styles.bankGrid}>
          {banks.map((b, i) => (
            <div key={i} style={styles.bankCard}>
              <div style={{ ...styles.bankName, fontSize: b.small ? '0.9rem' : '1.2rem' }}>{b.name}</div>
              <div style={styles.bankDetail}>{b.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div style={styles.stepItem}>
        <div style={styles.stepTitle}>Step 2:</div>
        <p style={styles.stepDesc}>Save a screenshot or photo of your transaction receipt for verification.</p>
      </div>

      {/* Step 3 — ref form */}
      <div style={styles.stepItem}>
        <div style={styles.stepTitle}>Step 3:</div>
        <p style={styles.stepDesc}>Enter your <strong>Reference Number</strong> below and click Submit.</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit} style={styles.refFormCard}>
            <label style={styles.refLabel}>Enter Reference Number</label>
            <div style={styles.refInputRow}>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="PAY-A1B2-C3D4-E5F6"
                readOnly={isSubmitted} // UPDATED: Makes input un-editable
                style={{
                   ...styles.refInput,
                   backgroundColor: isSubmitted ? '#e9ecef' : '#fff', // Gray out when locked
                   cursor: isSubmitted ? 'not-allowed' : 'text'
                }}
              />
              <button type="submit" 
                disabled={submitting || isSubmitted} // UPDATED: Disables button
                style={{
                  ...styles.refSubmitBtn,
                  opacity: isSubmitted ? 0.7 : 1,
                  cursor: isSubmitted ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={e => { if(!isSubmitted) { e.currentTarget.style.backgroundColor = '#f0f741'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if(!isSubmitted) { e.currentTarget.style.backgroundColor = '#e6e94e'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                {submitting ? '...' : isSubmitted ? 'SUBMITTED' : 'SUBMIT'}
              </button>
            </div>
            {refMessage && <div style={styles.refSuccess}>{refMessage}</div>}
            {refError && <div style={styles.refError}>{refError}</div>}
          </form>
        </div>
      </div>

      {/* Step 4 */}
      <div style={styles.stepItem}>
        <div style={styles.stepTitle}>Step 4:</div>
        <p style={styles.stepDesc}>Our admin will verify your payment. You will receive an Official Enrollment Confirmation email once verified.</p>
      </div>

      <div style={styles.importantNote}>
        <p style={styles.noteHeader}>Important Note:</p>
        <p style={styles.noteText}>Please bring your physical documents to the <strong>Registrar's Office</strong> upon your visit to complete the process.</p>
      </div>

      <button style={{ ...styles.backBtn, marginTop: 30 }} onClick={onBack}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f741'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e6e94e'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        DONE
      </button>
    </div>
  );
};

// ─── Main Payment Component ───────────────────────────────────────────────────
const Payment = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  const studentName = localStorage.getItem('studentName');
  const [view, setView] = useState('select'); 
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!studentId || !studentName) { navigate('/login'); return; }

    const fetchEnrollmentStatus = async () => {
      try {
        const statusRes = await api.get(`/student/${studentId}/enrollment-status`);
        const docStatus = statusRes.data.doc_status || 'Pending';
        // Note: Check if backend sends 'payment_status' or 'pay_status'
        const payStatus = statusRes.data.payment_status || statusRes.data.pay_status || 'Pending';
        setIsEnrolled(docStatus === 'Verified' && payStatus === 'Verified');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentStatus();
  }, [navigate, studentId, studentName]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF2F7' }}>
        <div style={{ borderRadius: 24, background: '#fff', padding: '24px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0a4d92' }}>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activePath="/payment" studentName={studentName} isEnrolled={isEnrolled}>
      {view === 'select' && (
        <main style={styles.paymentContent}>
          <h2 style={styles.pageTitle}>PAYMENT METHOD</h2>
          <div style={styles.paymentGrid}>
            {/* Onsite Card */}
            <div style={styles.paymentCard}>
              <h3 style={styles.cardHeading}>ONSITE</h3>
              <p style={styles.cardDesc}>Pay your enrollment fee by visiting the cashier's office.</p>
              <button style={styles.payActionBtn} onClick={() => setView('onsite')}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fdd835'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e6e94e'; e.currentTarget.style.transform = 'scale(1)'; }}>
                VIEW STEPS
              </button>
            </div>

            {/* Online Card */}
            <div style={styles.paymentCard}>
              <h3 style={styles.cardHeading}>ONLINE</h3>
              <p style={styles.cardDesc}>View different payment channels and upload your reference number.</p>
              <button style={styles.payActionBtn} onClick={() => setView('online')}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fdd835'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e6e94e'; e.currentTarget.style.transform = 'scale(1)'; }}>
                PROCEED
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'onsite' && (
        <OnsiteSteps
          studentId={studentId}
          formattedName={studentName}
          onBack={() => setView('select')}
        />
      )}

      {view === 'online' && (
        <OnlinePayment
          studentId={studentId}
          formattedName={studentName}
          onBack={() => setView('select')}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Styles (mirrors payment.css + inline styles from PHP) ────────────────────
const styles = {
  // Main select screen
  paymentContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#000',
    marginBottom: 50,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  paymentGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 50,
    width: '100%',
    flexWrap: 'wrap',
  },
  paymentCard: {
    backgroundColor: '#0a4d92',
    color: '#fff',
    width: 380,
    padding: '50px 30px',
    borderRadius: 12,
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeading: {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: 20,
    letterSpacing: 1,
  },
  cardDesc: {
    fontSize: '1.1rem',
    lineHeight: 1.4,
    marginBottom: 40,
    fontWeight: 600,
  },
  payActionBtn: {
    backgroundColor: '#e6e94e',
    color: '#073b75',
    border: 'none',
    padding: '12px 35px',
    borderRadius: 8,
    fontWeight: 800,
    fontSize: '0.95rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'transform 0.2s, background-color 0.2s',
    fontFamily: 'Montserrat, sans-serif',
  },

  // Sub-page shared
  subContent: {
    flex: 1,
    background: 'rgba(255,255,255,0.5)',
    padding: '40px 60px 60px',
    overflowY: 'auto',
    color: '#111',
  },
  applicantInfo: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 1.7,
  },
  infoSpan: {
    fontWeight: 900,
    color: '#000',
  },
  sectionSubheader: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#000',
    marginBottom: 18,
  },
  stepsList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 35px 0',
  },
  stepItem: {
    marginBottom: 22,
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#000',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#222',
    lineHeight: 1.6,
    margin: '0 0 14px 0',
  },
  importantNote: {
    marginTop: 10,
  },
  noteHeader: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#000',
    marginBottom: 8,
  },
  noteText: {
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#222',
    lineHeight: 1.6,
    margin: 0,
  },
  backBtn: {
    display: 'block',
    margin: '35px auto 0',
    backgroundColor: '#e6e94e',
    color: '#073b75',
    border: 'none',
    padding: '12px 60px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: '1rem',
    borderRadius: 8,
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'background-color 0.2s, transform 0.2s',
  },

  // Bank grid (online)
  bankGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  bankCard: {
    backgroundColor: '#e6e94e',
    borderRadius: 10,
    padding: '20px 16px',
    textAlign: 'center',
    color: '#003577',
  },
  bankName: {
    fontWeight: 900,
    marginBottom: 10,
  },
  bankDetail: {
    fontSize: '0.82rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },

  // Reference form
  refFormCard: {
    backgroundColor: '#0a4d92',
    borderRadius: 12,
    padding: '20px 24px',
    maxWidth: 500,
    width: '100%',
    margin: '10px 0 0 0',
  },
  refLabel: {
    display: 'block',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: 10,
  },
  refInputRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  refInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 8,
    border: 'none',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#333',
    outline: 'none',
  },
  refSubmitBtn: {
    backgroundColor: '#e6e94e',
    color: '#003577',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: '0.9rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s, transform 0.2s',
  },
  refSuccess: {
    color: '#2ecc71',
    fontWeight: 700,
    fontSize: '0.9rem',
    marginTop: 10,
  },
  refError: {
    color: '#ff6b6b',
    fontWeight: 700,
    fontSize: '0.9rem',
    marginTop: 10,
  },
};

export default Payment;