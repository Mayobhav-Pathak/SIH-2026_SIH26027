import React, { useMemo } from 'react';
import { Activity, Zap, ShieldCheck } from 'lucide-react';

export default function KPIScorecard({ tasks, schedule, timetable }) {
  const metrics = useMemo(() => {
    if (!schedule) return { hours: 0, criticalCleared: 0, criticalTotal: 0, criticalPercent: 0, efficiency: 0 };

    let totalHrs = 0;
    let criticalCount = 0;

    // 1. Calculate Total Scheduled Task Hours & Critical Tasks
    Object.values(schedule).forEach(dayTasks => {
      dayTasks.forEach(t => {
        totalHrs += parseInt(t.duration_hrs || t.duration || t.w || 0);
        
        if (parseInt(t.defect_severity) >= 4 || String(t.id).includes('EMERGENCY')) {
          criticalCount += 1;
        }
      });
    });

    const totalCriticalInBacklog = tasks.filter(t => parseInt(t.defect_severity) >= 4 || String(t.id).includes('EMERGENCY')).length;
    const criticalPercent = totalCriticalInBacklog > 0 ? Math.round((criticalCount / totalCriticalInBacklog) * 100) : 0;

    // 2. NEW: Calculate Total Train Corridor Capacity
    let totalCapacity = 0;
    if (timetable && timetable.length > 0) {
      timetable.forEach(c => {
         const entry = parseInt(c.entry_hour || 0);
         const exit = parseInt(c.exit_hour || 0);
         if (exit > entry) {
             totalCapacity += (exit - entry);
         }
      });
    }

    // 3. True Knapsack Efficiency Math
    const efficiency = totalCapacity > 0 ? ((totalHrs / totalCapacity) * 100).toFixed(1) : 0;

    return { 
      hours: totalHrs, 
      criticalCleared: criticalCount, 
      criticalTotal: totalCriticalInBacklog,
      criticalPercent,
      efficiency 
    };
  }, [tasks, schedule, timetable]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
        <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Knapsack Efficiency</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white">{metrics.efficiency}%</h3>
            <span className="text-xs text-emerald-400 font-medium">Packing Density</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
        <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-800">
          <Zap className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Throughput Allocated</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white">{metrics.hours}h</h3>
            <span className="text-xs text-slate-400 font-medium">Safe Corridor Time</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
        <div className="p-3 bg-red-900/30 rounded-lg border border-red-800">
          <ShieldCheck className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Severe Defects Cleared</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white">{metrics.criticalPercent}%</h3>
            <span className="text-xs text-slate-400 font-medium">({metrics.criticalCleared}/{metrics.criticalTotal} Tasks)</span>
          </div>
        </div>
      </div>
    </div>
  );
}