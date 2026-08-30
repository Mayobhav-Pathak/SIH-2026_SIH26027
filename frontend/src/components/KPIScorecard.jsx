import React, { useMemo } from 'react';
import { Activity, Zap, ShieldAlert } from 'lucide-react';

// Zero-Dependency SVG Sparkline Engine
const MicroSparkline = ({ data = [], color = "text-blue-400", width = 70, height = 24 }) => {
  if (!data || data.length < 2) return <div style={{ width, height }} className="opacity-0 shrink-0" />;

  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={`overflow-visible shrink-0 ml-4 ${color}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-md transition-all duration-300"
      />
    </svg>
  );
};

export default function KPIScorecard({ tasks = [], schedule, timetable = [] }) {
  const metrics = useMemo(() => {
    const scheduledTaskIds = new Set();
    let throughputHrs = 0;
    let dailyLoad = new Array(32).fill(0); 
    
    // 1. Calculate actual task hours assigned by the C++ engine
    if (schedule) {
      Object.keys(schedule).forEach(day => {
        const dayTasks = schedule[day];
        dayTasks.forEach(t => {
          scheduledTaskIds.add(String(t.task_id || t.id));
          throughputHrs += parseInt(t.duration_hrs || t.duration || t.w || 1);
        });
        dailyLoad[parseInt(day)] = dayTasks.length;
      });
    }

    // 2. Calculate absolute track capacity from the raw timetable
    let totalCapacityHrs = 0;
    if (timetable && timetable.length > 0) {
      timetable.forEach(corridor => {
        const entry = parseInt(corridor.entry_hour || 0);
        const exit = parseInt(corridor.exit_hour || 1);
        // Ensure minimum 1 hour capacity per valid block
        totalCapacityHrs += Math.max(1, exit - entry);
      });
    }

    // 3. Calculate True Dynamic Packing Density
    const rawEfficiency = totalCapacityHrs > 0 ? (throughputHrs / totalCapacityHrs) * 100 : 0;
    // Cap at 100% to prevent visual overflow in case of overlapping timetable data
    const efficiency = rawEfficiency > 0 ? Math.min(100, rawEfficiency).toFixed(1) : "0.0";

    // 4. Mathematically filter for Severe Tasks (Severity >= 4)
    let totalSevereTasks = 0;
    let severeTasksCleared = 0;

    tasks.forEach(t => {
      const sev = parseFloat(t.defect_severity || t.orig_v || 0);
      if (sev >= 4) {
        totalSevereTasks++;
        if (t.is_completed || scheduledTaskIds.has(String(t.task_id || t.id))) {
          severeTasksCleared++;
        }
      }
    });

    const completionRate = totalSevereTasks > 0 ? Math.round((severeTasksCleared / totalSevereTasks) * 100) : 0;

    return {
      efficiency,
      throughputHrs,
      completionRate,
      completedTasks: severeTasksCleared,
      totalTasks: totalSevereTasks,
      dailyTrend: dailyLoad.slice(0, 15), 
      throughputTrend: dailyLoad.map(v => v * 1.5).slice(0, 15) 
    };
  }, [tasks, schedule, timetable]); 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
      
      {/* Card 1: Knapsack Efficiency */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800/50 shrink-0">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1 ">Knapsack Efficiency</p>
            <div className="flex items-baseline space-x-2 whitespace-nowrap">
              <h2 className="text-3xl font-bold text-white">{metrics.efficiency}%</h2>
              <span className="text-xs text-blue-400 font-semibold tracking-wide ">Packing Density</span>
            </div>
          </div>
        </div>
        <MicroSparkline data={metrics.dailyTrend} color="text-blue-500" />
      </div>

      {/* Card 2: Throughput Allocated */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-800/50 shrink-0">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1 ">Throughput Allocated</p>
            <div className="flex items-baseline space-x-2 whitespace-nowrap">
              <h2 className="text-3xl font-bold text-white">{metrics.throughputHrs}h</h2>
              <span className="text-xs text-purple-400 font-semibold tracking-wide ">Safe Corridor Time</span>
            </div>
          </div>
        </div>
        <MicroSparkline data={metrics.throughputTrend} color="text-purple-500" />
      </div>

      {/* Card 3: Defect Clearance */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-800/50 shrink-0">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1 ">Severe Defects Cleared</p>
            <div className="flex items-baseline space-x-2 whitespace-nowrap">
              <h2 className="text-3xl font-bold text-white">{metrics.completionRate}%</h2>
              <span className="text-xs text-slate-500 font-semibold tracking-wide ">({metrics.completedTasks}/{metrics.totalTasks})</span>
            </div>
          </div>
        </div>
        <MicroSparkline data={[0, 20, 45, 60, metrics.completionRate]} color="text-emerald-500" />
      </div>

    </div>
  );
}