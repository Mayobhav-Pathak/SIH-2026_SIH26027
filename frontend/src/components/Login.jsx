import React, { useState } from 'react';
import { Train, Lock, User, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials for hackathon demonstration
    if (employeeId === 'admin' && password === 'railway123') {
      onLogin();
    } else {
      setError('Invalid Employee ID or Password. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-800 p-6 flex flex-col items-center border-b border-slate-700">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Train className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white text-center">Ministry of Railways</h1>
          <p className="text-sm text-slate-400 text-center mt-1">Automatic Block Planning System (IR-ABPS)</p>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium">Authorized Section Controllers Only</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Employee ID</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter ID (e.g., admin)"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password (e.g., railway123)"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center bg-red-900/20 py-2 rounded border border-red-900/50">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition shadow-lg shadow-blue-600/20"
            >
              Secure Login
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}