import { Gauge, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface Schedule {
  utilization_rate: string | number;
  wasted_gap_hrs: number;
  allocated_window: string | number;
  scheduled_tasks: any[];
}

export default function MetricsGrid({ schedule }: { schedule: Schedule | null }) {
  if (!schedule) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-slate-800 p-4 rounded-xl">
        <div className="flex justify-between text-slate-400"><span className="text-xs uppercase font-semibold">Utilization</span><Gauge className="w-4 h-4 text-emerald-400" /></div>
        <p className="text-2xl font-bold text-emerald-400 mt-2">{schedule.utilization_rate}</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-xl">
        <div className="flex justify-between text-slate-400"><span className="text-xs uppercase font-semibold">Wasted Gap</span><Clock className="w-4 h-4 text-amber-400" /></div>
        <p className="text-2xl font-bold text-amber-300 mt-2">{schedule.wasted_gap_hrs} hrs</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-xl">
        <div className="flex justify-between text-slate-400"><span className="text-xs uppercase font-semibold">Window</span><Zap className="w-4 h-4 text-blue-400" /></div>
        <p className="text-2xl font-bold text-blue-300 mt-2">{schedule.allocated_window}</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-xl">
        <div className="flex justify-between text-slate-400"><span className="text-xs uppercase font-semibold">Tasks</span><CheckCircle2 className="w-4 h-4 text-purple-400" /></div>
        <p className="text-2xl font-bold text-purple-300 mt-2">{schedule.scheduled_tasks.length}</p>
      </div>
    </div>
  );
}