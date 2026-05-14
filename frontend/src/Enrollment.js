import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import DashboardLayout from './DashboardLayout';

const Enrollment = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  const [form, setForm] = useState({
    previous_school_attended: '',
    previous_school_address: '',
    previous_grade_level: '',
    previous_school_year: '',
    previous_strand_course: '',
    previous_program: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!studentId) {
      navigate('/login');
      return;
    }

    const fetchEnrollment = async () => {
      try {
        const res = await api.get(`/student/${studentId}/enrollment`);
        setForm({
          previous_school_attended: res.data.previous_school_attended || '',
          previous_school_address: res.data.previous_school_address || '',
          previous_grade_level: res.data.previous_grade_level || '',
          previous_school_year: res.data.previous_school_year || '',
          previous_strand_course: res.data.previous_strand_course || '',
          previous_program: res.data.previous_program || '',
        });
      } catch (err) {
        console.error(err);
      }
    };

    const fetchStudentMeta = async () => {
      try {
        const [studentRes, statusRes] = await Promise.all([
          api.get(`/student/${studentId}`),
          api.get(`/student/${studentId}/enrollment-status`),
        ]);

        const student = studentRes.data;
        const middleInitial = student.middle_name ? ` ${student.middle_name[0]}.` : '';
        setStudentName(`${student.last_name}, ${student.first_name}${middleInitial}`);

        const docStatus = statusRes.data.doc_status || 'Pending';
        const payStatus = statusRes.data.pay_status || 'Pending';
        setIsEnrolled(docStatus === 'Verified' && payStatus === 'Verified');
      } catch (err) {
        console.error(err);
      }
    };

    const loadAll = async () => {
      await Promise.all([fetchStudentMeta(), fetchEnrollment()]);
      setLoading(false);
    };

    loadAll();
  }, [navigate, studentId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/student/${studentId}/enrollment`, form);
      setMessage('Enrollment information saved successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Unable to save enrollment information.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF2F7] text-slate-900">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-xl text-center">
          <p className="font-bold text-lg">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activePath="/enrollment" studentName={studentName} isEnrolled={isEnrolled}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ paddingBottom: 26, textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: '#0B4E94', margin: 0, fontWeight: 800 }}>Enrollment</p>
          <h1 style={{ fontSize: '2.7rem', fontWeight: 900, margin: '12px 0 0', color: '#071d5d', textTransform: 'uppercase' }}>Enrollment Information</h1>
        </div>

        {message && (
          <div style={{ marginBottom: 24, borderRadius: 24, background: '#ffffffcc', padding: '18px 22px', boxShadow: '0 18px 40px rgba(0,0,0,0.08)', color: '#0B4E94', fontWeight: 700, textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 420px' }}>
          <section style={{ borderRadius: 32, background: '#0B4E94', padding: 32, color: '#fff', boxShadow: '0 18px 40px rgba(0,0,0,0.16)' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Student Educational Background</h2>
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
              <Field label="Previous School Attended" value={form.previous_school_attended} />
              <Field label="Address of Previous School" value={form.previous_school_address} />
              <Field label="Previous Grade Level" value={form.previous_grade_level} />
              <Field label="Previous School Year Attended" value={form.previous_school_year} />
              <Field label="Previous Strand/Course Taken" value={form.previous_strand_course} />
              <Field label="Previous Program Taken" value={form.previous_program} />
            </div>
          </section>

          <section style={{ borderRadius: 32, background: '#fff', padding: 32, boxShadow: '0 18px 40px rgba(0,0,0,0.16)' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: 24, color: '#0B4E94', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Update Enrollment</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Previous School Attended</label>
                <input type="text" name="previous_school_attended" value={form.previous_school_attended} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Address of Previous School</label>
                <input type="text" name="previous_school_address" value={form.previous_school_address} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Previous Grade Level</label>
                <input type="text" name="previous_grade_level" value={form.previous_grade_level} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Previous School Year Attended</label>
                <input type="text" name="previous_school_year" value={form.previous_school_year} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Previous Strand/Course Taken</label>
                <input type="text" name="previous_strand_course" value={form.previous_strand_course} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Previous Program Taken</label>
                <input type="text" name="previous_program" value={form.previous_program} onChange={handleChange} style={{ width: '100%', borderRadius: 24, border: '1px solid #CBD5E1', padding: '14px 18px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <button type="submit" style={{ background: '#E8E657', color: '#0B4E94', fontWeight: 900, borderRadius: 9999, padding: '14px 24px', textTransform: 'uppercase', letterSpacing: '0.15em', border: 'none', cursor: 'pointer' }}>
                Save Enrollment
              </button>
            </form>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Field = ({ label, name, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm uppercase tracking-[0.18em] text-white font-bold">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type="text"
      className="w-full rounded-3xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none focus:border-[#E8E657] focus:ring-2 focus:ring-[#E8E657]/30"
    />
  </div>
);

export default Enrollment;
