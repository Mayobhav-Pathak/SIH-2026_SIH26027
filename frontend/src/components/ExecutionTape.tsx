import React, { useRef, useEffect, type CSSProperties } from 'react';
// @ts-ignore
import * as ReactWindow from 'react-window';
import { Terminal, Cpu } from 'lucide-react';
// @ts-ignore
const List = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList;


// @ts-ignore
const SafeList = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList;

type LogEntry = {
  timestamp?: string;
  text?: string;
  tag?: string;
  type?: 'error' | 'complete' | 'info';
  [key: string]: any;
};

export default function ExecutionTape({ logs = [] as LogEntry[] }: { logs?: LogEntry[] }) {
  const listRef = useRef<any>(null);

  // Auto-scroll to the bottom of the feed when new WebSocket tokens stream in
  useEffect(() => {
    if (listRef.current && logs.length > 0) {
      listRef.current.scrollToItem(logs.length - 1, 'smart');
    }
  }, [logs.length]);

  const RenderLogItem = ({ index, style }: { index: number; style: CSSProperties }) => {
    const log: LogEntry = logs[index] || {};
    
    // High-frequency terminal coloring based on execution status
    let statusColor = "text-emerald-400 bg-emerald-950/30 border-emerald-800/40";
    if (log.type === 'error') statusColor = "text-red-400 bg-red-950/30 border-red-800/40";
    if (log.type === 'complete') statusColor = "text-blue-400 bg-blue-950/30 border-blue-800/40";

    return (
      <div style={style} className="px-3 flex items-center font-mono text-[0.7rem]">
        <div className={`w-full px-2 py-1 rounded border flex items-center justify-between ${statusColor}`}>
          <div className="flex items-center space-x-2 truncate">
            <span className="text-slate-500">[{log.timestamp || '00:00:00'}]</span>
            <span className="font-bold text-white">EXEC:</span>
            <span className="text-slate-300 truncate">{log.text || JSON.stringify(log)}</span>
          </div>
          <span className="text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-900/80 font-semibold shrink-0 ml-2">
            {log.tag || 'DP-PACK'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl flex flex-col h-[300px] font-mono">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400 animate-pulse" />
          <h3 className="font-bold text-white text-xs uppercase tracking-widest">
            L2 Execution Tape & Pipeline Stream
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-[0.65rem] text-emerald-400">
          <Cpu className="w-3 h-3" />
          <span>SOCKET: LIVE</span>
        </div>
      </div>

      {/* The Virtualized Log Stream */}
      <div className="flex-1 w-full relative py-2">
        {logs.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs tracking-widest uppercase">
            Awaiting WebSocket Transmission Stream...
          </div>
        ) : (
          <SafeList
            ref={listRef}
            height={240}
            itemCount={logs.length}
            itemSize={36} // Exact pixel height of each log row
            width="100%"
            className="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {RenderLogItem}
          </SafeList>
        )}
      </div>
    </div>
  );
}