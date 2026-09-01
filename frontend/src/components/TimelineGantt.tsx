type TimelineTask = {
  id?: string | number;
  task_id?: string | number;
  start_min?: number;
  end_min?: number;
  time_window?: string;
  [key: string]: unknown;
};

export default function TimelineGantt({
  activeTasks = [],
  activeSection = "NETWORK",
  activeDay = 1,
}: {
  activeTasks?: TimelineTask[];
  activeSection?: string;
  activeDay?: number | string;
}) {
  // 1440 minutes in a standard 24-hour day
  const TOTAL_MINUTES = 1440;

  return (
    <div className="w-full bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 shadow-lg">
      <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
        Day {String(parseInt(String(activeDay || 1), 10))} • {activeSection} Allocation
      </h3>
      
      {/* Timeline Container */}
      <div className="relative w-full h-16 bg-slate-900/60 rounded-lg border border-slate-800 overflow-visible shadow-inner">
        
        {/* Render the Scheduled Task Blocks */}
        {activeTasks.map((task, index) => {
          
          if (task.start_min === undefined || task.end_min === undefined) return null;

          const leftPercent = (task.start_min / TOTAL_MINUTES) * 100;
          const widthPercent = ((task.end_min - task.start_min) / TOTAL_MINUTES) * 100;

          return (
            <div
              key={task.id || task.task_id || index}
              // Added flex, items-center, px-2, and overflow-hidden here to the main bar
              className="absolute top-2 bottom-6 rounded bg-blue-500/70 border border-blue-400/50 backdrop-blur-sm shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:bg-blue-400/90 cursor-crosshair transition-all duration-200 group flex items-center px-2 overflow-hidden"
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
            >
              {/* Liquid Glass Hover Tooltip */} 
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded border border-slate-600 whitespace-nowrap transition-opacity pointer-events-none z-10 shadow-xl flex flex-col items-center"> 
              <span className="font-bold text-blue-300">{task.id || task.task_id}
                </span> 
                <span className="text-slate-300 font-mono">{task.time_window || "N/A"}</span>
                 </div>
              
              {/* Task Text (Properly scaled and truncated) */}
              <span className="text-white text-[10px] font-bold center flex-1 min-w-0 select-none">
                {String(task.id || task.task_id).replace('TASK-', '')} 
              </span>
            </div>
          );
        })
}

        {/* 24-Hour Time Markers */}
        <div className="absolute inset-0 flex justify-between px-2 text-[10px] text-slate-500 font-mono items-end pb-1 pointer-events-none">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}