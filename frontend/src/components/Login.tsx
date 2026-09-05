import React, { useState } from 'react';
import { Train, Lock, User, ShieldCheck } from 'lucide-react';

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Hardcoded credentials for hackathon demonstration
    if (employeeId === 'admin' && password === 'railway123') {
      onLogin();
    } else {
      setError('Invalid Employee ID or Password. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 p-6 flex flex-col items-center border-b border-slate-200">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Train className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 text-center">Ministry of Railways</h1>
          <p className="text-sm text-slate-500 text-center mt-1">Automatic Block Planning System (IR-ABPS)</p>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium">Authorized Section Controllers Only</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Employee ID</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter ID"
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition shadow-lg shadow-blue-600/20"
            >
              Secure Login
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
