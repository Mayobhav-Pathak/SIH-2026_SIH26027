import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

export default function CapacityOrderBook({ activeTasks, timetable, activeDay, activeSection }) {
  
  // High-speed memoized calculation of capacity vs. usage
  const metrics = useMemo(() => {
    let trainOccupiedHrs = 0;
    
    // 1. Scan the timetable for trains matching the exact day and section
    if (timetable && timetable.length > 0) {
      timetable.forEach(corridor => {
        const secId = String(corridor.section_id || corridor.section || "DEFAULT_SEC").replace(/ /g, "_");
        const dId = String(corridor.day_id || 0);
        
        if (secId === activeSection && dId === activeDay) {
          const entry = parseInt(corridor.entry_hour || 0);
          const exit = parseInt(corridor.exit_hour || 1);
          trainOccupiedHrs += Math.max(0, exit - entry);
        }
      });
    }
    
    // True capacity is 24 hours MINUS the hours trains are on the track
    const totalCapacityHrs = Math.max(0, 24 - trainOccupiedHrs);
    
    // 2. Sum up the scheduled task durations
    let usedHrs = 0;
    if (activeTasks && activeTasks.length > 0) {
      activeTasks.forEach(task => {
         const dur = parseInt(task.duration_hrs || task.duration || task.w || 1);
         usedHrs += dur;
      });
    }
    
    // 3. Calculate Saturation Percentage
    const capacity = totalCapacityHrs > 0 ? totalCapacityHrs : 1; 
    const utilPercent = Math.min(100, (usedHrs / capacity) * 100);
    
    return { 
      total: totalCapacityHrs, 
      used: usedHrs, 
      percent: utilPercent 
    };
  }, [activeTasks, timetable, activeDay, activeSection]);

  // Dynamic HFT styling based on network saturation
  let barColor = "bg-blue-500";
  let textColor = "text-blue-400";
  
  if (metrics.percent > 100) { 
    barColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"; 
    textColor = "text-red-400"; 
  } else if (metrics.percent >= 90) { 
    barColor = "bg-orange-500"; 
    textColor = "text-orange-400"; 
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4 shadow-xl font-mono">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center space-x-2">
          <Activity className={`w-4 h-4 ${textColor}`} />
          <h4 className="text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold">
            Order Book Depth • {activeSection} • Day {parseInt(activeDay) }
          </h4>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${textColor} transition-colors`}>
            {metrics.used}h <span className="text-slate-500 text-sm">/ {metrics.total}h</span>
          </span>
          <span className="text-[0.65rem] text-slate-500 ml-2 tracking-widest uppercase">
            Saturation
          </span>
        </div>
      </div>
      
      {/* The Background Track */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 relative">
        {/* The Liquid Fill */}
        <div 
          className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ease-out ${barColor}`} 
          style={{ width: `${metrics.percent}%` }}
        />
      </div>
    </div>
  );
}