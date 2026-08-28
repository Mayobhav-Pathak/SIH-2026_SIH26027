import React from 'react';

export default function CalendarHeatmap({ schedule, onSelectDay, activeDay, activeSection }) {
  const days = Array.from({ length: 30 }, (_, i) => i);

  const getHeatmapColor = (taskCount) => {
    if (taskCount === 0) return 'bg-slate-800/80 border-slate-700 text-slate-500 hover:border-slate-600';
    if (taskCount <= 3) return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60';
    if (taskCount <= 7) return 'bg-amber-950/70 border-amber-800/80 text-amber-300 hover:bg-amber-900/70';
    if (taskCount <= 11) return 'bg-orange-950/80 border-orange-700 text-orange-200 hover:bg-orange-900/80';
    return 'bg-red-900/90 border-red-600 text-white shadow-lg shadow-red-950/50 hover:bg-red-800';
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">30-Day Maintenance Horizon</h2>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span><span>Low</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span><span>Med</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span><span>High</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span><span>Critical</span></span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {days.map(day => {
          const dayKey = day.toString();
          const dayTasks = schedule && schedule[dayKey] 
            ? schedule[dayKey].filter(t => !activeSection || t.section_id === activeSection)
            : [];
          
          const taskCount = dayTasks.length;
          const isSelected = activeDay === dayKey;
          const colorClass = getHeatmapColor(taskCount);

          return (
            <button
              key={day}
              onClick={() => onSelectDay(dayKey)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-20 relative group ${colorClass} ${
                isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-[1.02]' : ''
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold font-mono">Day {day + 1}</span>
                {taskCount > 8 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight">{taskCount}</span>
                <span className="text-[10px] block opacity-80 uppercase font-medium">Tasks</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}