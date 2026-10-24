import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, Phone, Building, ArrowRight, UserCheck } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, users, addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('infoalfatech9@gmail.com');
  const [loginPass, setLoginPass] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPass);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    register(regName, regEmail, regPhone, regPass, regBusinessName);
  };

  const handleQuickDemoLogin = (email: string) => {
    login(email, 'pass');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0E7C66] to-[#16A085] flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg
              className="w-7 h-7 fill-current text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17H7A5 5 0 0 1 7 7H9M15 7H17A5 5 0 1 1 17 17H15M8 12H16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight">
            ALFATECH<span className="text-[#16A085]">LINK</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Smart Business • Simple Accounting
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-[#16A085] border-b-2 border-[#16A085] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'text-[#16A085] border-b-2 border-[#16A085] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com or +1 (555)..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#16A085] focus:ring-[#16A085]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => addToast({ type: 'info', title: 'Password Reset', message: 'Demo password reset instructions sent to your email.' })}
                  className="text-xs text-[#16A085] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Login to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  Quick Demo Sign-In
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u.email)}
                      className="p-1.5 text-left rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-[11px] font-bold text-slate-800 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Alexander Mitchell"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                  placeholder="e.g. Apex Trading Corp"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555)..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Complete Registration & Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
