import React from 'react';

export default function TimelineGantt({ tasks, totalHrs = 24, dayLabel }) {
  if (!tasks || tasks.length === 0) {
    return <div className="bg-slate-800 p-5 rounded-2xl text-slate-400 text-sm w-full border border-slate-700">No tasks scheduled for {dayLabel}.</div>;
  }

  return (
    <div className="bg-slate-800 p-5 rounded-2xl space-y-4 border border-slate-700 w-full">
      <h2 className="text-sm font-semibold text-slate-200">{dayLabel} Allocation Bar</h2>
      
      {/* Container is now 100% width, no scrolling */}
      <div className="w-full h-12 bg-slate-900 rounded-xl relative border border-slate-700 overflow-hidden">
        
        {tasks.map(t => {
           const dur = parseInt(t.duration_hrs || t.duration || t.w || 1);
           const start = t.start_hour !== undefined ? parseInt(t.start_hour) : 0;
           const end = t.end_hour !== undefined ? parseInt(t.end_hour) : (start + dur);
           
           const leftPercent = (start / totalHrs) * 100;
           const widthPercent = ((end - start) / totalHrs) * 100;
           const shortId = t.id.replace('TASK-', '#').replace('EMERGENCY-', '🚨 ');
           
           return (
            <div 
              key={t.id} 
              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }} 
              className={`absolute top-0 h-full rounded-md text-white flex items-center justify-center text-[11px] font-bold shadow-sm px-1 border-r border-slate-900 ${t.id.includes('EMERGENCY') ? 'bg-red-600' : 'bg-blue-500 hover:bg-blue-400 transition-colors'}`}
              title={`${t.id} (${start}:00 - ${end}:00)`}
            >
              <span className="truncate pointer-events-none">{shortId}</span>
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-500 font-mono w-full px-1">
         <span>00:00</span>
         <span>06:00</span>
         <span>12:00</span>
         <span>18:00</span>
         <span>24:00</span>
      </div>
    </div>
  );
}