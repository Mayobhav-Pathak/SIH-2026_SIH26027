import React, { useMemo } from 'react';
// @ts-ignore
import * as ReactWindow from 'react-window';
import { CheckCircle, Clock } from 'lucide-react';

const List = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList;

export default function TaskQueueTable({ tasks = [], isScheduled = false, onMarkDone, fullSchedule }: { tasks: any[]; isScheduled: boolean; onMarkDone: (id: string) => void; fullSchedule: any }) {
  const scheduledDaysMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (fullSchedule) {
      Object.entries(fullSchedule as Record<string, any[]>).forEach(([dayStr, dayTasks]) => {
        (dayTasks ?? []).forEach((t: any) => {
          const taskKey = t?.id ?? t?.task_id;
          if (taskKey !== undefined && taskKey !== null) {
            map[String(taskKey)] = dayStr;
          }
        });
      });
    }
    return map;
  }, [fullSchedule]);

  const RenderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = tasks[index] || {};
    const assignedDay = task.day_id !== undefined ? task.day_id : scheduledDaysMap[task.id || task.task_id];

    return (
      <div 
        style={style} 
        // UPDATED: Row borders and hover state
        className={`flex items-center px-4 py-3 border-b border-gray-200 text-sm hover:bg-white transition-colors ${
          task.is_completed ? 'opacity-50 grayscale bg-gray-100' : ''
        }`}
      >
        <div className="w-3/12 font-mono text-slate-700 font-medium truncate pr-4">
          {task.task_id || task.id || `T-${index}`}
        </div>
        
        <div className="w-2/12 text-slate-500 truncate pr-2">
          {task.department || 'N/A'}
        </div>
        
        <div className="w-2/12">
          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
            task.defect_severity >= 8 ? 'bg-red-100 text-red-700' :
            task.defect_severity >= 5 ? 'bg-orange-100 text-orange-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            Sev: {task.defect_severity || 'N/A'}
          </span>
        </div>
        
        <div className="w-2/12 flex items-center text-slate-500">
          <Clock className="w-3 h-3 mr-1" />
          {task.duration_hrs || task.duration || task.w || 1}h
        </div>
        
        <div className="w-2/12 text-blue-600 font-semibold text-xs">
          {assignedDay !== undefined ? `Day ${parseInt(assignedDay) }` : '-'}
        </div>
        
        <div className="w-1/12 flex justify-end">
          {isScheduled ? (
            <span className="text-[0.65rem] font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded font-mono">
              {task.time_window || `${task.duration_hrs || task.duration || 1}h allocated`}
            </span>
          ) : (
            <button 
              onClick={() => onMarkDone && onMarkDone(task.id)}
              disabled={task.is_completed}
              className={`p-1.5 rounded-md transition ${
                task.is_completed 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const isVirtualizationSupported = typeof List !== 'undefined';

  return (
    // UPDATED: Main table container
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
      
      {/* UPDATED: Table Title Bar */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <h3 className="font-bold text-slate-800 flex items-center">
          {isScheduled ? 'Scheduled Timeline' : 'Active Backlog'}
          <span className="ml-3 px-2.5 py-0.5 bg-white text-blue-600 rounded-full text-xs border border-gray-200">
            {tasks.length}
          </span>
        </h3>
      </div>

      {/* UPDATED: Column Headers */}
      <div className="flex px-4 py-2 bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="w-5/20">Task ID</div>
        <div className="w-3/20">Dept</div>
        <div className="w-3/20">Severity</div>
        <div className="w-4/20">Duration</div>
        <div className="w-2/20">Day</div>
        <div className="w-1/20 text-right">{isScheduled ? 'Assignment' : 'Action'}</div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden">
        {tasks.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
            No tasks in queue
          </div>
        ) : isVirtualizationSupported ? (
          <List
            height={300}
            itemCount={tasks.length}
            itemSize={50}
            width="100%"
            className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
          >
            {RenderRow}
          </List>
        ) : (
          <div className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {tasks.map((_, index) => (
              <RenderRow key={index} index={index} style={{ height: '50px' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
