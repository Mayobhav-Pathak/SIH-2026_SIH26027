import React, { useRef } from 'react';
import { UploadCloud, CheckCircle, Trash2 } from 'lucide-react';

export default function FileUpload({ title, onUpload, hasData, onClear }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onUpload(json);
      } catch (err) {
        alert("Invalid JSON format.");
      }
      // CRITICAL: Reset the input so you can re-upload the same file after clearing
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className={`p-6 rounded-xl border border-dashed flex flex-col items-center justify-center transition-all duration-300 ${
      hasData ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]' : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800'
    }`}>
      {hasData ? (
        <>
          <CheckCircle className="w-8 h-8 text-emerald-500 mb-3" />
          <h3 className="text-white text-sm font-bold mb-1">{title}</h3>
          <p className="text-emerald-400 text-xs mb-4 font-mono">Data Uploaded Successfully</p>
          <button 
            onClick={onClear}
            className="flex items-center space-x-2 px-4 py-2 bg-red-900/40 hover:bg-red-600/80 border border-red-800/50 rounded text-red-200 text-xs font-bold transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear Data</span>
          </button>
        </>
      ) : (
        <>
          <UploadCloud className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-white text-sm font-bold mb-1">{title}</h3>
          <p className="text-slate-400 text-xs mb-4">Ingest mass JSON data instantly</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold transition border border-slate-600 shadow-sm"
          >
            Browse Files
          </button>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
        </>
      )}
    </div>
  );
}