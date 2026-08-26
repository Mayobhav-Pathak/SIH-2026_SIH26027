import React from 'react';
import { Download, AlertCircle, CheckCircle2, CalendarDays, CheckSquare } from 'lucide-react';

export default function TaskQueueTable({ tasks = [], isScheduled = false, fullSchedule = null, onMarkDone }) {
  
  const exportToCSV = () => {
    if (!tasks || tasks.length === 0) return;
    const headers = "Task ID,Department,Duration,Time Window\n";
    const rows = tasks.map(t => `${t.id},${t.department},${t.duration_hrs}h,${t.allocated_window || 'Pending'}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BDMS_Requisition_Export.csv`;
    a.click();
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-200">
          {isScheduled ? "Approved BDMS Schedule" : "Maintenance Backlog"}
        </h2>
        {isScheduled && (
          <button onClick={exportToCSV} className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition">
            <Download className="w-3 h-3" /> <span>Export CSV</span>
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 border-b border-slate-700 uppercase">
            <tr>
              <th className="pb-3 font-semibold">Task ID</th>
              <th className="pb-3 font-semibold">Dept</th>
              <th className="pb-3 font-semibold">Duration</th>
              {isScheduled ? (
                <th className="pb-3 font-semibold text-emerald-400">Time Window</th>
              ) : (
                <>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {safeTasks.length > 0 ? safeTasks.map((task) => {
              
              // 1. Check if explicitly marked as completed
              const isCompleted = task.is_completed;
              
              // 2. Scan the entire 30-day schedule to find exactly which day it is on
              let scheduledDay = null;
              if (fullSchedule && !isCompleted) {
                for (const [dayIdx, dayTasks] of Object.entries(fullSchedule)) {
                  if (dayTasks.some(t => t.id === task.id)) {
                    scheduledDay = parseInt(dayIdx) + 1; // +1 to make it human-readable (Day 1 instead of Day 0)
                    break;
                  }
                }
              }

              const isEmergency = String(task.id).includes('EMERGENCY');

              return (
                <tr key={task.id} className={`transition ${isCompleted ? 'opacity-40 bg-slate-900/50' : 'hover:bg-slate-750'} ${isEmergency && !isCompleted ? 'bg-red-900/20' : ''}`}>
                  <td className={`py-3 font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-blue-400'}`}>
                    {task.id}
                  </td>
                  <td className="py-3">{task.department}</td>
                  <td className="py-3">{task.duration_hrs}h</td>
                  
                  {isScheduled ? (
                    <td className="py-3 font-mono text-emerald-300 bg-emerald-900/10 rounded px-2">
                      {task.allocated_window || "N/A"}
                    </td>
                  ) : (
                    <>
                      {/* Dynamic Status Column */}
                      <td className="py-3">
                        {isCompleted ? (
                          <span className="flex items-center text-slate-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1"/> Done
                          </span>
                        ) : scheduledDay ? (
                          <span className="flex items-center text-emerald-400 text-xs font-semibold">
                            <CalendarDays className="w-3 h-3 mr-1"/> Day {scheduledDay}
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-400 text-xs font-semibold">
                            <AlertCircle className="w-3 h-3 mr-1"/> Pending
                          </span>
                        )}
                      </td>
                      
                      {/* Mark Done Action Button */}
                      <td className="py-3 text-right">
                        {!isCompleted && (
                          <button 
                            onClick={() => onMarkDone && onMarkDone(task.id)}
                            className="text-[10px] uppercase tracking-wider font-bold bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white py-1.5 px-3 rounded transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={isScheduled ? "4" : "5"} className="py-6 text-center text-slate-500 italic">
                  No tasks available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}