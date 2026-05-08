import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/admin/login', credentials);
      if (res.data.success) {
        localStorage.setItem('adminUsername', res.data.username);
        localStorage.setItem('adminLoggedIn', 'true');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Montserrat']">
      {/* Top Bar - Matches PHP admin-header */}
      <header className="bg-[#0a4d92] py-3 px-8 flex items-center gap-4 shadow-md">
        <img src="/BNOMC_Logo.png" alt="Logo" className="w-[55px] h-[55px] rounded-full bg-white object-contain" />
        <div>
          <h1 className="text-white text-lg font-extrabold leading-tight">Blessed Name of Mary College, Inc.</h1>
          <p className="text-[#dce8ff] text-xs">San Isidro Pili, Camarines Sur</p>
        </div>
      </header>

      {/* Hero Section with Background */}
      <main 
        className="flex-1 flex flex-col items-center justify-center p-10 relative"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('/BNOMC_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h2 className="text-[#1565c0] text-3xl font-extrabold text-center mb-1">Blessed Name of Mary College, Inc.</h2>
        <h3 className="text-[#1565c0] text-xl font-bold text-center mb-8">Online Enrollment System — Admin</h3>

        {/* Login Box - Matches .login-box style */}
        <div className="w-full max-w-[420px] bg-[#0a4d92] rounded-xl p-8 shadow-2xl">
          <h4 className="text-white text-lg font-extrabold text-center mb-5">Admin Login</h4>

          {error && (
            <div className="mb-4 rounded-lg bg-[#f8d7da] px-4 py-2 text-[#721c24] text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[#c8d8f0] text-xs font-semibold mb-2 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                name="username" 
                placeholder="Admin username"
                value={credentials.username} 
                onChange={handleChange} 
                className="w-full rounded-lg px-4 py-3 outline-none text-base" 
                required 
              />
            </div>

            <div className="flex flex-col">
                <label className="text-[#c8d8f0] text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Password"
                        value={credentials.password} 
                        onChange={handleChange} 
                        className="w-full rounded-lg px-4 py-3 outline-none text-base pr-12" 
                        required 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {showPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 rounded-full bg-[#e6e94e] py-3 text-[#073b75] text-base font-black uppercase transition-all hover:bg-[#f0f741] active:scale-95"
            >
              LOGIN
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;