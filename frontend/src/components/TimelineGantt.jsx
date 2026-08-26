import React from 'react';

// Assuming totalHrs is passed down correctly (e.g., 24 for a full day view)
export default function TimelineGantt({ tasks, totalHrs = 24, dayLabel }) {
  if (!tasks || tasks.length === 0) {
    return <div className="bg-slate-800 p-5 rounded-2xl text-slate-400 text-sm">No tasks scheduled for {dayLabel}.</div>;
  }

  // Calculate total used hours to show the gap properly
  const used = tasks.reduce((sum, t) => sum + t.duration_hrs, 0);

  return (
    <div className="bg-slate-800 p-5 rounded-2xl space-y-4 border border-slate-700 overflow-x-auto">
      <h2 className="text-sm font-semibold text-slate-200">{dayLabel} Allocation Bar</h2>
      
      {/* Min-width ensures the bar doesn't squish too much if many tasks are packed */}
      <div className="min-w-[600px] w-full h-12 bg-slate-900 rounded-xl flex p-1 gap-1 border border-slate-700">
        
        {tasks.map(t => {
           // Ensure very short tasks still have a minimum width to display text
           const widthPercent = Math.max((t.duration_hrs / totalHrs) * 100, 5); 
           
           return (
            <div 
              key={t.id} 
              style={{width: `${widthPercent}%`}} 
              className={`h-full rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-md truncate px-2 ${t.id.includes('EMERGENCY') ? 'bg-red-600' : 'bg-blue-600'}`}
              title={`${t.id} (${t.duration_hrs}h)`} // Tooltip on hover
            >
              {t.id}
            </div>
          )
        })}
        
        {used < totalHrs && (
          <div style={{width: `${((totalHrs-used)/totalHrs)*100}%`}} className="h-full bg-slate-800 border border-dashed border-slate-600 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
            {totalHrs - used}h Gap
          </div>
        )}
      </div>
    </div>
  );
}