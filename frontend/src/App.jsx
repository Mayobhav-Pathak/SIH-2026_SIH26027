import React, { useState, useMemo } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import Header from './components/Header';
import CalendarHeatmap from './components/CalendarHeatmap';
import TimelineGantt from './components/TimelineGantt';
import TaskQueueTable from './components/TaskQueueTable';
import FileUpload from './components/FileUpload';
import Login from './components/Login';
import KPIScorecard from './components/KPIScorecard';
import SettingsModal from './components/SettingsModal';

const SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
];

export default function App() {
  // Authentication & Dropdown State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Core Data State
  const [tasks, setTasks] = useState([]);
  const [timetable, setTimetable] = useState([]); 
  const [schedule, setSchedule] = useState(null);
  
  // UI Controls
  const [activeDay, setActiveDay] = useState("0");
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [safetyBufferMins, setSafetyBufferMins] = useState(60); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const handleMasterReset = () => {
    setTasks([]);
    setTimetable([]);
    setSchedule(null);
    setIsSettingsOpen(false);
  };

  // API Execution
  const handleRunOptimizer = async (overrideTasks = null) => {
    // FIX: React passes a MouseEvent on normal button clicks. We must ensure this is actually an array.
    const currentTasks = Array.isArray(overrideTasks) ? overrideTasks : tasks;
    
    if (currentTasks.length === 0 || timetable.length === 0) return alert("Please upload both Tasks and Timetable data.");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/optimize-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timetable: timetable, 
          tasks: currentTasks.filter(t => !t.is_completed), // Ignore completed tasks
          safety_buffer_mins: safetyBufferMins 
        })
      });
      const result = await response.json();
      console.log("API PAYLOAD:", result);
      if (result.status === "success") {
        setSchedule(result.horizon_schedule);
        setActiveDay("0"); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Emergency Injection
  const injectEmergencyTask = () => {
    const emergencyTask = {
      id: `EMERGENCY-${Math.floor(Math.random() * 1000)}`,
      department: "TMS",
      section_id: activeSection,
      duration_hrs: 2,
      defect_severity: 10, 
      days_overdue: 0,
      traffic_density_gmt: 100.0,
      asset_age_years: 15.0,
      is_completed: false
    };
    
    const updatedTasks = [emergencyTask, ...tasks];
    setTasks(updatedTasks);
    
    // Instantly trigger the C++ engine
    handleRunOptimizer(updatedTasks); 
  };

  // Mark Task as Done
  const handleMarkTaskDone = (taskId) => {
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, is_completed: true } : t
    ));
  };

  // Data Filters
  const activeTasksForSection = useMemo(() => {
    if (!schedule || !schedule[activeDay]) return [];
    return schedule[activeDay].filter(t => t.section_id === activeSection);
  }, [schedule, activeDay, activeSection]);

  const activeBacklogForSection = useMemo(() => {
    return tasks.filter(t => t.section_id === activeSection);
  }, [tasks, activeSection]);

  // Security Gate
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Dashboard Render
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Top Utility Bar */}
      <div className="flex justify-end w-full -mb-2">
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 shadow-sm"
        >
          <span>Secure Logout</span>
        </button>
      </div>

      <Header 
        onOptimize={handleRunOptimizer} 
        loading={loading} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onReset={handleMasterReset} 
      />
      
      {/* KPI Scorecard */}
      <KPIScorecard tasks={tasks} schedule={schedule} timetable={timetable} />
      
     {/* Interactive Controls Row */}
      <div className="flex flex-wrap items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
        
        <div className="flex items-center space-x-4 relative z-40">
          {/* Custom Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-56 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-white hover:bg-slate-750 transition shadow-inner"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="truncate">{activeSection}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                {SECTIONS.map(sec => (
                  <button
                    key={sec}
                    onClick={() => {
                      setActiveSection(sec);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition font-medium border-b border-slate-700/50 last:border-0 ${
                      activeSection === sec 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={injectEmergencyTask} className="px-4 py-2.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg transition shrink-0 flex items-center space-x-2">
            <span>🚨 Inject Emergency</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-6 mt-4 md:mt-0 relative z-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-slate-300 w-40">
              Safety Buffer: {Math.floor(safetyBufferMins / 60)}h {(safetyBufferMins % 60).toString().padStart(2, '0')}m
            </span>
            <input 
              type="range" min="0" max="240" step="5" 
              value={safetyBufferMins} onChange={(e) => setSafetyBufferMins(parseInt(e.target.value))}
              className="w-32 accent-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-2 space-y-6">
          <CalendarHeatmap schedule={schedule} onSelectDay={setActiveDay} activeDay={activeDay} activeSection={activeSection} />
        </div>
        <div className="space-y-4">
          <FileUpload 
            title="Upload Maintenance Backlog (.json)" 
            onUpload={(newData) => setTasks(prev => [...prev, ...(Array.isArray(newData) ? newData : [])])} 
          />
          <FileUpload 
            title="Upload Train Timetable (.json)" 
            onUpload={(newData) => setTimetable(prev => [...prev, ...(Array.isArray(newData) ? newData : [])])} 
          />
        </div>
      </div>
      <div className="w-full relative z-0">
        <TimelineGantt tasks={activeTasksForSection} totalHrs={24} dayLabel={`Day ${parseInt(activeDay) + 1} - ${activeSection}`} />
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-0">
        <TaskQueueTable 
          tasks={activeBacklogForSection} 
          fullSchedule={schedule} 
          onMarkDone={handleMarkTaskDone} 
        /> 
        <TaskQueueTable tasks={activeTasksForSection} isScheduled={true} />
      </div>
    </div>
  );
}