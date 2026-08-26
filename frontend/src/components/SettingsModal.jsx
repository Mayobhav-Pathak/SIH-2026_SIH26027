import React, { useState } from 'react';
import { X, Trash2, Cpu, ShieldAlert } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onReset }) {
  const [engine, setEngine] = useState('cpp');

  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center bg-slate-800 p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>System Configuration</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Optimization Engine Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Solver Engine</label>
            <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-700">
              <button 
                onClick={() => setEngine('cpp')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${engine === 'cpp' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                C++ DP (Flat-Buffer)
              </button>
              <button 
                onClick={() => setEngine('python')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${engine === 'python' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Python Heuristic
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {engine === 'cpp' ? 'Using high-performance contiguous memory allocation.' : 'Using standard greedy scheduling (sub-optimal).'}
            </p>
          </div>

          <hr className="border-slate-700/50" />

          {/* Master Reset */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Danger Zone</label>
            <div className="bg-red-900/10 border border-red-900/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-red-400">Master Reset</h4>
                <p className="text-xs text-slate-500 mt-0.5">Clear all queues, schedules, and JSON data.</p>
              </div>
              <button 
                onClick={onReset}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition shadow-lg flex items-center space-x-2"
                title="Wipe system state"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}