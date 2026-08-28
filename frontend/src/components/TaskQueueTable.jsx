import React from 'react';
import * as ReactWindow from 'react-window';
import { CheckCircle, Clock } from 'lucide-react';

// Attempt to safely extract the component, regardless of how Vite packaged it
const List = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList;

export default function TaskQueueTable({ tasks = [], isScheduled = false, onMarkDone }) {
  
  const RenderRow = ({ index, style }) => {
    // FAILSAFE 1: If the uploaded JSON has a corrupted or null item, default to an empty object
    const task = tasks[index] || {}; 
    
    return (
      <div 
        style={style} 
        className={`flex items-center px-4 py-3 border-b border-slate-700/50 text-sm hover:bg-slate-700/30 transition-colors ${
          task.is_completed ? 'opacity-50 grayscale' : ''
        }`}
      >
        <div className="w-1/3 font-mono text-slate-300 font-medium truncate pr-4">
          {task.task_id || task.id || `T-${index}`}
        </div>
        
        <div className="w-1/4">
          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
            task.defect_severity >= 8 ? 'bg-red-900/50 text-red-400' :
            task.defect_severity >= 5 ? 'bg-orange-900/50 text-orange-400' :
            'bg-emerald-900/50 text-emerald-400'
          }`}>
            Sev: {task.defect_severity || 'N/A'}
          </span>
        </div>
        
        <div className="w-1/4 flex items-center text-slate-400">
          <Clock className="w-3 h-3 mr-1" />
          {task.duration_hrs || task.duration || task.w || 1}h
        </div>
        
        <div className="w-1/6 flex justify-end">
          {isScheduled ? (
            <span className="text-[0.65rem] font-semibold text-blue-400 bg-blue-900/30 px-2 py-1 rounded font-mono">
              {task.time_window || `${task.duration_hrs || task.duration || 1}h allocated`}
            </span>
          ) : (
            <button 
              onClick={() => onMarkDone && onMarkDone(task.id)}
              disabled={task.is_completed}
              className={`p-1.5 rounded-md transition ${
                task.is_completed 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // FAILSAFE 2: Verify if Vite actually provided the component
  const isVirtualizationSupported = typeof List !== 'undefined';

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl flex flex-col h-[400px]">
      
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
        <h3 className="font-bold text-white flex items-center">
          {isScheduled ? 'Scheduled Timeline' : 'Active Backlog'}
          <span className="ml-3 px-2.5 py-0.5 bg-slate-700 text-blue-400 rounded-full text-xs">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="flex px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <div className="w-1/3">Task ID</div>
        <div className="w-1/4">Severity</div>
        <div className="w-1/4">Duration</div>
        <div className="w-1/6 text-right">{isScheduled ? 'Assignment' : 'Action'}</div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden">
        {tasks.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium">
            No tasks in queue
          </div>
        ) : isVirtualizationSupported ? (
          // Route A: High-performance virtualization (if bundler succeeds)
          <List
            height={300}
            itemCount={tasks.length}
            itemSize={50}
            width="100%"
            className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
          >
            {RenderRow}
          </List>
        ) : (
          // Route B: Bulletproof native CSS mapping (if bundler fails)
          <div className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {tasks.map((_, index) => (
              <RenderRow key={index} index={index} style={{ height: '50px' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}