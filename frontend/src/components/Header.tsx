import React from 'react';
import { Play, Loader2, Settings } from 'lucide-react';

type HeaderProps = {
  onOptimize: () => void;
  loading: boolean;
  onOpenSettings: () => void;
};

export default function Header({ onOptimize, loading, onOpenSettings }: HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative z-10">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">IR-ABPS Control Center</h1>
        <p className="text-sm text-slate-500 mt-1">Automatic Block Planning System &bull; Dynamic Horizon</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center space-x-3">
        {/* NEW: Attached onClick event */}
        <button 
          onClick={onOpenSettings} 
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition" 
          title="System Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <button 
          onClick={onOptimize} 
          disabled={loading}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all ${
            loading 
              ? 'bg-blue-700 cursor-not-allowed opacity-75' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Execute DP Schedule</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
