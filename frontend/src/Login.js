import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate(); // Initialize navigate hook
    const [credentials, setCredentials] = useState({ email_address: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Design Guide Colors
    const colors = {
        primary: '#1B63AD',
        secondary: '#E8E657',
        darkBlue: '#0B4E94',
        error: '#CF1510',
        textMain: '#000000',
        textLight: '#474747'
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/login', credentials);
            if (res.data.success) {
                // Store student details for the dashboard to use
                localStorage.setItem('studentName', res.data.name);
                localStorage.setItem('studentId', res.data.studentId);
                
                // Redirect to the Student Dashboard
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed.");
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const email = prompt("Please enter your registered email address:");
        
        if (!email) return;

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/forgot-password', { 
                email_address: email 
            });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || "An error occurred. Please try again.");
        }
    };

    return (
        <>
            {/* Styles & Montserrat Font Integration */}
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&display=swap" rel="stylesheet" />
            
            <style dangerouslySetInnerHTML={{ __html: `
                body { font-family: 'Montserrat', sans-serif; }
                .heading-2 { font-size: 42px; line-height: 46.2px; font-weight: 700; color: ${colors.primary}; }
            ` }} />

            <div className="min-h-screen relative flex flex-col items-center">
                
                {/* Background Image Overlay */}
                <div 
                    className="absolute inset-0 z-0"
                    style={{ 
                        backgroundImage: "url('/BNOMC_bg.jpg')", 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: '0.2' 
                    }}
                ></div>

                {/* Branded Header */}
                <header className="relative z-20 w-full bg-[#0B4E94] py-3 px-6 shadow-xl flex items-center">
                    <img 
                        src="/BNOMC_Logo.png" 
                        alt="BNOMC Logo" 
                        className="w-14 h-14 mr-4 bg-white rounded-full p-1"
                    />
                    <div className="text-white">
                        <h1 className="text-lg font-bold uppercase tracking-wider">
                            Blessed Name of Mary College, Inc.
                        </h1>
                        <p className="text-xs opacity-80 uppercase">San Isidro Pili, Camarines Sur</p>
                    </div>
                </header>

                <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 w-full">
                    
                    <div className="text-center mb-10">
                        <h1 className="heading-2 uppercase tracking-tight mb-2">
                            Blessed Name <br/> of Mary College, Inc.
                        </h1>
                        <p className="text-lg font-bold uppercase tracking-[0.3em]" style={{ color: colors.darkBlue }}>
                            Online Enrollment System
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-xl font-extrabold uppercase tracking-tight" style={{ color: colors.darkBlue }}>
                            Enter OES Credentials to Start:
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="w-full max-w-lg rounded-2xl shadow-2xl p-10" style={{ backgroundColor: colors.darkBlue }}>
                        
                        {error && (
                            <div className="p-3 rounded mb-6 text-white text-sm font-bold text-center" style={{ backgroundColor: colors.error }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-200 uppercase tracking-widest mb-2">
                                    Email Address
                                </label>
                                <input 
                                    name="email_address"
                                    type="email"
                                    placeholder="Email Address"
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white rounded-lg p-3 text-gray-900 outline-none focus:ring-4 focus:ring-[#E8E657]"
                                />
                            </div>

                            <div className="flex flex-col relative">
                                <label className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white rounded-lg p-3 text-gray-900 outline-none focus:ring-4 focus:ring-[#E8E657] pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        {showPassword ? "👁️‍🗨️" : "👁️"} 
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end text-[11px] text-gray-300 font-bold uppercase tracking-widest">
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword}
                                    className="hover:text-white underline bg-transparent border-none cursor-pointer p-0"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button 
                                type="submit"
                                className="w-full font-black py-4 rounded-lg uppercase tracking-widest text-sm shadow-lg transition-transform active:scale-95"
                                style={{ backgroundColor: colors.secondary, color: colors.darkBlue }}
                            >
                                Login
                            </button>
                        </form>
                    </div>
                    
                    <div className="mt-8 font-bold text-sm" style={{ color: colors.darkBlue }}>
                        <Link to="/register" className="underline hover:text-[#1B63AD] transition-colors">
                            Don't have an Account?
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Login;