import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '',
        dob: '', religion: '', gender: '',
        contact_number: '', email_address: '',
        guardian_first_name: '', guardian_middle_name: '', guardian_last_name: '',
        guardian_birth_date: '', guardian_occupation: '',
        prev_school: '', school_address: '', prev_grade: '', school_year: ''
    });

    const colors = {
        primary: '#1B63AD',
        secondary: '#E8E657', 
        darkBlue: '#0B4E94',
        cardBlue: '#0B4E94',
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Generate random 6-digit password
        const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
        const submissionData = { ...formData, password: generatedPassword };

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/register', submissionData);
            if (res.data.success) {
                alert("Registration Successful! Your password is: " + generatedPassword);
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.error || "Registration Failed");
        }
    };

    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&display=swap" rel="stylesheet" />
            
            <style dangerouslySetInnerHTML={{ __html: `
                body { font-family: 'Montserrat', sans-serif; background-color: #f3f4f6; }
                .input-field { background: #FFFFFF; border-radius: 8px; padding: 12px; width: 100%; color: #000; outline: none; }
                .label-text { display: block; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
            ` }} />

            <div className="min-h-screen relative flex flex-col items-center">
                <div className="fixed inset-0 z-0" style={{ backgroundImage: "url('/BNOMC_bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: '0.2' }}></div>

                <header className="relative z-20 w-full bg-[#0B4E94] py-3 px-6 shadow-xl flex items-center">
                    <img src="/BNOMC_Logo.png" alt="Logo" className="w-12 h-12 mr-4 bg-white rounded-full p-1" />
                    <div className="text-white">
                        <h1 className="text-lg font-bold uppercase tracking-wider">Blessed Name of Mary College, Inc.</h1>
                        <p className="text-xs opacity-80 uppercase">San Isidro Pili, Camarines Sur</p>
                    </div>
                </header>

                <main className="relative z-10 w-full max-w-5xl p-8 flex flex-col items-center">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-[#1B63AD] uppercase tracking-tight">Blessed Name of Mary College, Inc.</h1>
                        <p className="text-2xl font-bold text-[#1B63AD] uppercase tracking-[0.2em]">Online Enrollment System</p>
                        <h2 className="text-3xl font-black text-black uppercase mt-4">Registration Page</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-8 pb-20">
                        
                        {/* Student Info */}
                        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: colors.cardBlue }}>
                            <h3 className="text-white text-xl font-bold mb-6 border-b border-blue-400 pb-2">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="label-text">First Name</label><input name="first_name" className="input-field" onChange={handleChange} required /></div>
                                <div><label className="label-text">Middle Name</label><input name="middle_name" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Last Name</label><input name="last_name" className="input-field" onChange={handleChange} required /></div>
                                <div><label className="label-text">Date of Birth</label><input name="dob" type="date" className="input-field" onChange={handleChange} required /></div>
                                <div><label className="label-text">Religion</label><input name="religion" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Gender</label>
                                    <select name="gender" className="input-field" onChange={handleChange} required>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: colors.cardBlue }}>
                            <h3 className="text-white text-xl font-bold mb-6 border-b border-blue-400 pb-2">Student Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="label-text">Contact Number</label><input name="contact_number" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Email Address</label><input name="email_address" type="email" className="input-field" onChange={handleChange} required /></div>
                            </div>
                        </div>

                        {/* Guardian Info */}
                        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: colors.cardBlue }}>
                            <h3 className="text-white text-xl font-bold mb-6 border-b border-blue-400 pb-2">Guardian Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="label-text">First Name</label><input name="guardian_first_name" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Middle Name</label><input name="guardian_middle_name" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Last Name</label><input name="guardian_last_name" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Date of Birth</label><input name="guardian_birth_date" type="date" className="input-field" onChange={handleChange} /></div>
                                <div className="md:col-span-2"><label className="label-text">Occupation</label><input name="guardian_occupation" className="input-field" onChange={handleChange} /></div>
                            </div>
                        </div>

                        {/* Educational Background */}
                        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: colors.cardBlue }}>
                            <h3 className="text-white text-xl font-bold mb-6 border-b border-blue-400 pb-2">User Educational Background</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="label-text">Previous School Attended</label><input name="prev_school" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Address of Previous School</label><input name="school_address" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Previous Grade Level</label><input name="prev_grade" className="input-field" onChange={handleChange} /></div>
                                <div><label className="label-text">Previous School Year Attended</label><input name="school_year" className="input-field" onChange={handleChange} /></div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <button type="submit" className="w-full max-w-xs font-black py-4 rounded-lg uppercase tracking-widest text-lg shadow-xl" style={{ backgroundColor: colors.secondary, color: colors.darkBlue }}>
                                Submit
                            </button>
                            <Link to="/login" className="mt-4 text-[#0B4E94] font-bold underline">Already have an account? Login here</Link>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
};

export default Register;