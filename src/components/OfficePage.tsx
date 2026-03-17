import { useEffect, useRef, useState } from 'react';
import {
  buildGrid,
  buildRooms,
  buildAgents,
  tickAgents,
  PHYSICAL_W,
  PHYSICAL_H,
} from '../office/engine';
import { renderFrame } from '../office/renderer';
import { GameState, AgentPanelData } from '../office/types';

const TICKER_TEMPLATE =
  '◆ SENTRY: ACTIVE  ◆ ATLAS: OFFLINE  ◆ NEXUS: OFFLINE  ◆ PRISM: OFFLINE  ' +
  '◆ Lowenthal Capital Advisors — AI Operations Floor  ◆ v0.1.0  ';

export function OfficePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GameState | null>(null);
  const rafRef    = useRef<number>(0);
  const [panelData, setPanelData] = useState<AgentPanelData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const rooms  = buildRooms();
    const grid   = buildGrid(rooms);
    const agents = buildAgents();

    const state: GameState = {
      grid,
      agents,
      rooms,
      frame: 0,
      tickerOffset: PHYSICAL_W / 3, // start at right edge (native coords)
      tickerText: TICKER_TEMPLATE,
    };
    stateRef.current = state;

    let panelTick = 0;

    const loop = () => {
      const s = stateRef.current;
      if (!s) return;

      tickAgents(s);
      renderFrame(ctx, s);

      panelTick++;
      if (panelTick >= 6) {
        panelTick = 0;
        setPanelData(
          s.agents.map(a => ({
            id: a.id,
            name: a.name,
            role: a.role,
            state: a.state,
            online: a.online,
            speech: a.speechBubble,
            activityLog: [...a.activityLog],
          }))
        );
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      stateRef.current = null;
    };
  }, []);

  const allLogs = panelData
    .flatMap(a => a.activityLog)
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 10);

  return (
    <div className="flex h-full bg-[#050a10] overflow-hidden font-mono">
      {/* ── Canvas ── */}
      <div className="flex-1 flex items-center justify-center p-4 min-w-0">
        <canvas
          ref={canvasRef}
          width={PHYSICAL_W}
          height={PHYSICAL_H}
          style={{
            imageRendering: 'pixelated',
            border: '1px solid #0a1a2a',
            boxShadow: '0 0 40px rgba(0,255,136,0.05)',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* ── Side panel ── */}
      <div className="w-64 flex-shrink-0 border-l border-[#0a1a2a] flex flex-col bg-[#040911] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#0a1a2a]">
          <h2 className="text-[#00ff88] text-xs font-bold tracking-[0.2em] uppercase">
            SENTRY Office
          </h2>
          <p className="text-[#1a3a2a] text-[10px] mt-0.5 tracking-wide">
            Lowenthal Capital Advisors
          </p>
        </div>

        {/* Agent cards */}
        <div className="flex-1 p-3 space-y-2">
          {panelData.map(agent => (
            <div
              key={agent.id}
              className={`rounded border p-2.5 text-[10px] leading-relaxed ${
                agent.online
                  ? 'border-[#00ff88]/20 bg-[#00ff88]/5'
                  : 'border-[#0a1a2a] bg-[#06090e]'
              }`}
            >
              {/* Name + status */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-bold text-[11px] ${
                    agent.online ? 'text-[#00ff88]' : 'text-[#2a3a4a]'
                  }`}
                >
                  [ {agent.name} ]
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    agent.online ? 'text-[#00cc66]' : 'text-[#1a2a3a]'
                  }`}
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      agent.online
                        ? 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]'
                        : 'bg-[#1a2a3a]'
                    }`}
                  />
                  {agent.online ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>

              {/* Role */}
              <p className={agent.online ? 'text-[#336655]' : 'text-[#1a2a3a]'}>
                {agent.role}
              </p>

              {agent.online ? (
                <>
                  {/* State */}
                  <div className="mt-1 text-[#00aa55]">
                    ● {agent.state}
                    {agent.speech && (
                      <span className="text-[#335544] ml-1 italic truncate block">
                        "{agent.speech}"
                      </span>
                    )}
                  </div>
                  {/* Last activity */}
                  {agent.activityLog[0] && (
                    <p className="text-[#1a3a2a] mt-0.5 truncate">
                      last: {agent.activityLog[0].message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[#0f1e2a] mt-1">awaiting activation</p>
              )}
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div className="border-t border-[#0a1a2a] p-3">
          <h3 className="text-[#0f2a1a] text-[10px] font-bold tracking-widest mb-2">
            ──── ACTIVITY LOG ────
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {allLogs.length === 0 ? (
              <p className="text-[#0f1e2a] text-[10px]">No activity yet...</p>
            ) : (
              allLogs.map((entry, i) => (
                <div key={i} className="flex gap-2 text-[10px]">
                  <span className="text-[#1a3a2a] flex-shrink-0 tabular-nums">
                    {entry.time}
                  </span>
                  <span className="text-[#007744] truncate">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
