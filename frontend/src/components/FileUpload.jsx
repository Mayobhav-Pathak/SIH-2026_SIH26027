import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function FileUpload({ title, onUpload }) {
  const [uploadCount, setUploadCount] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        onUpload(parsedData);
        setUploadCount(prev => prev + 1); // Increment the file counter
      } catch (error) {
        alert("Invalid JSON file. Please ensure it matches the required schema.");
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = null; 
  };

  return (
    <div className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${
      uploadCount > 0 
        ? 'bg-emerald-900/10 border-emerald-700 hover:bg-emerald-900/20' 
        : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
    }`}>
      
      {/* Dynamic Icon */}
      {uploadCount > 0 ? (
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
      ) : (
        <UploadCloud className="w-8 h-8 text-blue-400 mb-3" />
      )}
      
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      
      {/* Dynamic Text: "Added 1 file" */}
      {uploadCount > 0 ? (
        <p className="text-xs text-emerald-400 mt-1 mb-4 font-semibold">
          Added {uploadCount} file{uploadCount !== 1 ? 's' : ''}
        </p>
      ) : (
        <p className="text-xs text-slate-400 mt-1 mb-4">Ingest mass data instantly</p>
      )}
      
      <label className={`cursor-pointer text-xs font-semibold py-2 px-4 rounded-lg transition ${
        uploadCount > 0 
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
          : 'bg-slate-700 hover:bg-slate-600 text-white'
      }`}>
        {uploadCount > 0 ? "Upload Another" : "Browse Files"}
        <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  );
}