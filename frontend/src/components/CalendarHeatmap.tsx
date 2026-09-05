import React from 'react';

type ScheduleTask = {
  section_id?: string | null;
};

type ScheduleMap = Record<string, ScheduleTask[]>;

type CalendarHeatmapProps = {
  schedule?: ScheduleMap;
  onSelectDay: (day: string) => void;
  activeDay?: string;
  activeSection?: string | null;
};

export default function CalendarHeatmap({ schedule, onSelectDay, activeDay, activeSection }: CalendarHeatmapProps) {
  const days = Array.from({ length: 60 }, (_, i) => i + 1);

  const getHeatmapColor = (taskCount: number): string => {
    // UPDATED: Empty state uses the sand background
    if (taskCount === 0) return 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100';
    if (taskCount <= 3) return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200';
    if (taskCount <= 7) return 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200';
    if (taskCount <= 11) return 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
    return 'bg-red-500 border-red-600 text-white shadow-md shadow-red-200 hover:bg-red-600';
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">60-Day Maintenance Horizon</h2>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span><span>Low</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span><span>Med</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-200"></span><span>High</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200"></span><span>Critical</span></span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {days.map(day => {
          const dayKey = day.toString();
          const dayTasks = schedule && schedule[dayKey]
            ? schedule[dayKey].filter(t => !activeSection || activeSection === 'NETWORK_OVERVIEW' || t.section_id === activeSection)
            : [];
          
          const taskCount = dayTasks.length;
          const isSelected = activeDay === dayKey;
          const colorClass = getHeatmapColor(taskCount);

          return (
            <button
              key={day}
              onClick={() => onSelectDay(dayKey)}
              // UPDATED: Selection ring offset to match the new surface color
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-20 relative group ${colorClass} ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white scale-[1.02]' : ''
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold font-mono">Day {day}</span>
                {taskCount > 8 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
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
