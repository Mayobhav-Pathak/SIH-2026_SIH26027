import React, { useState, useMemo } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import Header from './components/Header.js';
import CalendarHeatmap from './components/CalendarHeatmap.js';
import TimelineGantt from './components/TimelineGantt.js';
import TaskQueueTable from './components/TaskQueueTable.js';
import FileUpload from './components/FileUpload.js';
import Login from './components/Login.js';
import KPIScorecard from './components/KPIScorecard.js';
import SettingsModal from './components/SettingsModal.js';
import CapacityOrderBook from './components/CapacityOrderBook.js';
import ExecutionTape from './components/ExecutionTape.js';

const SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
];

type Task = {
  id: string;
  is_completed?: boolean;
  duration_hrs?: number;
  duration?: number;
  w?: number;
  section_id?: string;
  [key: string]: any;
};

type ScheduleTask = Task;

type Schedule = Record<string, ScheduleTask[]>;

type ExecutionLog = {
  timestamp: string;
  text: string;
  tag: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]); 
  const [schedule, setSchedule] = useState<Schedule>({});
  const [activeDay, setActiveDay] = useState("1");
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0] ?? 'NETWORK_OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [safetyBufferMins, setSafetyBufferMins] = useState(0); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  const handleMasterReset = () => {
    setTasks([]); setTimetable([]); setSchedule({});
    setIsSettingsOpen(false);
  };

  const handleStreamOptimizer = (tasksToUse = tasks) => {
    const currentTasks = tasksToUse.filter(t => !t.is_completed);
    if (currentTasks.length === 0 || timetable.length === 0) {
      return alert("Please upload both Tasks and Timetable data.");
    }

    setLoading(true);
    const emptySchedule: Schedule = {};
    for (let i = 0; i <= 60; i++) emptySchedule[i.toString()] = [];
    setSchedule(emptySchedule);

    const ws = new WebSocket('ws://localhost:8000/ws/optimize-stream');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        timetable: timetable,
        tasks: currentTasks,
        safety_buffer_mins: safetyBufferMins
      }));
    };

    let liveSchedule: Schedule = {};
    for (let i = 0; i <= 60; i++) liveSchedule[i.toString()] = [];

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "progress") {
        const enrichedTask = payload.task;
        if (enrichedTask && enrichedTask.day_id !== undefined && liveSchedule[enrichedTask.day_id]) {
          liveSchedule[enrichedTask.day_id]?.push(enrichedTask);
          setSchedule({ ...liveSchedule });
          setExecutionLogs(prev => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString(),
              text: `TASK-${enrichedTask.task_id || enrichedTask.id} ALLOCATED TO DAY ${parseInt(enrichedTask.day_id) + 1} (SEV: ${enrichedTask.defect_severity || 'N/A'})`,
              tag: 'OPTIMIZED'
            }
          ]);
        }
      } else if (payload.type === "complete") {
        setLoading(false);
        const firstActiveDay = Object.keys(liveSchedule).find(
          (day) => (liveSchedule[day] ?? []).length > 0
        ) ?? "1";
        setActiveDay(firstActiveDay);
        ws.close();
      }
    };

    ws.onerror = (err) => { console.error("WebSocket error:", err); setLoading(false); };
  };

  const injectEmergencyTask = () => {
    const emergencyTask = {
      id: `EMERGENCY-${Math.floor(Math.random() * 1000)}`, department: "TMS", section_id: activeSection,
      duration_hrs: 2, defect_severity: 10, days_overdue: 0, traffic_density_gmt: 100.0, asset_age_years: 15.0, is_completed: false
    };
    const updatedTasks = [emergencyTask, ...tasks];
    setTasks(updatedTasks);
    handleStreamOptimizer(updatedTasks); // FIX: Now successfully streams the new emergency task
  };

  const handleMarkTaskDone = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: true } : t));
  };

  const activeTasksForSection = useMemo(() => {
    if (!schedule || !schedule[activeDay]) return [];
    // If Network Overview is selected, return ALL scheduled tasks for that day
    if (activeSection === 'NETWORK_OVERVIEW') return schedule[activeDay];
    return schedule[activeDay].filter(t => t.section_id === activeSection);
  }, [schedule, activeDay, activeSection]);
  
  const activeBacklogForSection = useMemo(() => {
    // If Network Overview is selected, return the ENTIRE unscheduled backlog
    if (activeSection === 'NETWORK_OVERVIEW') return tasks;
    return tasks.filter(t => t.section_id === activeSection);
  }, [tasks, activeSection]);
  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
   <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-end w-full -mb-2">
        <button onClick={() => setIsAuthenticated(false)} className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 shadow-sm">
          <span>Secure Logout</span>
        </button>
      </div>

      <Header onOptimize={() => handleStreamOptimizer()} loading={loading} onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onReset={handleMasterReset} />
      <KPIScorecard tasks={tasks} schedule={schedule} timetable={timetable}  />
      
      <div className="flex flex-col gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm relative z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
         
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent space-x-2 w-full xl:max-w-[60%] pb-1">
            <button 
              onClick={() => setActiveSection('NETWORK_OVERVIEW')} 
              className={`shrink-0 px-4 py-2 text-xs font-bold rounded border transition-all duration-200 ${
                activeSection === 'NETWORK_OVERVIEW' 
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              NETWORK OVERVIEW
            </button>
            
            {SECTIONS.map(sec => (
              <button 
                key={sec} 
                onClick={() => setActiveSection(sec)} 
                className={`shrink-0 px-4 py-2 text-xs font-bold rounded border transition-all duration-200 ${
                  activeSection === sec 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Right: Action Controls (Safety Buffer & Emergency) */}
          <div className="flex items-center space-x-4 shrink-0 justify-between xl:justify-end">
            <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700/80">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Buffer: {Math.floor(safetyBufferMins / 60)}h {(safetyBufferMins % 60).toString().padStart(2, '0')}m
              </span>
              <input 
                type="range" min="0" max="240" step="5" 
                value={safetyBufferMins} 
                onChange={(e) => setSafetyBufferMins(parseInt(e.target.value))}
                onMouseUp={() => handleStreamOptimizer()}
                onTouchEnd={() => handleStreamOptimizer()}
                className="w-24 accent-blue-500 cursor-pointer"
              />
            </div>
            <button onClick={injectEmergencyTask} className="px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(220,38,38,0.3)] transition flex items-center space-x-2 border border-red-500">
              <span>🚨 Emergency</span>
            </button>
          </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-2 space-y-6">
          <CalendarHeatmap schedule={schedule} onSelectDay={setActiveDay} activeDay={activeDay} activeSection={activeSection} />
        </div>
        <div className="space-y-4 relative z-0">
          <FileUpload 
            title="Upload Maintenance Backlog (.json)" 
            hasData={tasks.length > 0}
            onUpload={(newData) => setTasks(prev => [...prev, ...(Array.isArray(newData) ? newData : [])])} 
            onClear={() => {
              setTasks([]);
              setSchedule({}); // Clear the schedule when backlog is wiped
            }}
          />
          <FileUpload 
            title="Upload Train Timetable (.json)" 
            hasData={timetable.length > 0}
            onUpload={(newData) => setTimetable(prev => [...prev, ...(Array.isArray(newData) ? newData : [])])} 
            onClear={() => {
              setTimetable([]);
              setSchedule({}); // Clear the schedule when timetable is wiped
            }}
          />
        </div>
      </div>
      <div className="w-full relative z-0">
        <CapacityOrderBook 
          activeTasks={activeTasksForSection} 
          timetable={timetable} 
          activeDay={activeDay} 
          activeSection={activeSection} 
        />
        <TimelineGantt 
  activeTasks={activeTasksForSection} 
  activeSection={activeSection} 
  activeDay={activeDay} 
/>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-0">
        <TaskQueueTable tasks={activeBacklogForSection as any} fullSchedule={schedule} onMarkDone={handleMarkTaskDone} isScheduled={false} /> 
        <TaskQueueTable tasks={activeTasksForSection as any} isScheduled={true} onMarkDone={handleMarkTaskDone} fullSchedule={schedule} />
      </div>
    </div>
  );
}