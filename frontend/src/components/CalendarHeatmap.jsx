import React from 'react';

export default function CalendarHeatmap({ schedule, onSelectDay, activeDay, activeSection }) {
  if (!schedule) return null;

  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">30-Day Maintenance Horizon</h2>
      
      {/* Scrollable grid to handle 30 days without exploding the UI */}
      <div className="grid grid-cols-7 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar"> 
        {Object.entries(schedule).slice(0, 30).map(([day, allTasks]) => {
          
          // ONLY count tasks that belong to the active section
          const sectionTasks = allTasks.filter(t => t.section_id === activeSection);
          const load = sectionTasks.reduce((sum, t) => sum + t.duration_hrs, 0);
          
          // Color logic based on corridor consumption for this specific section
          const color = load > 4 ? 'bg-red-500/80' : load > 0 ? 'bg-amber-500/80' : 'bg-emerald-500/40';
          
          return (
            <div 
              key={day} 
              onClick={() => onSelectDay(day)} 
              className={`cursor-pointer p-3 rounded-xl border ${activeDay === day ? 'border-white ring-2 ring-blue-500' : 'border-slate-700'} ${color} text-center transition hover:scale-105`}
            >
              <span className="text-sm font-bold text-white">Day {parseInt(day) + 1}</span>
              <p className="text-[10px] text-slate-100 font-medium mt-1">{sectionTasks.length} Tasks</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}