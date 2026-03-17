import { GameState, Tile, Room, Agent } from './types';

export const GRID_W = 28;
export const GRID_H = 20;
export const TILE_SIZE = 10; // native pixels per tile
export const SCALE = 3;

// Native canvas dimensions
export const NATIVE_W = GRID_W * TILE_SIZE;   // 280
export const NATIVE_H = GRID_H * TILE_SIZE;   // 200
export const TICKER_H = 10;                   // native px for ticker strip
export const NATIVE_TOTAL_H = NATIVE_H + TICKER_H; // 210

// Physical canvas dimensions (CSS pixels)
export const PHYSICAL_W = NATIVE_W * SCALE;         // 840
export const PHYSICAL_H = NATIVE_TOTAL_H * SCALE;  // 630

const SENTRY_MESSAGES = [
  'Monitoring portfolio...',
  'Processing emails...',
  'Reviewing pipeline...',
  'Analyzing trends...',
  'Scheduling meetings...',
  'Updating CRM data...',
  'Running reports...',
  'Tracking shipments...',
  'Checking market data...',
  'Flagging anomalies...',
  'Reviewing forecasts...',
  'Scanning news feed...',
];

export function buildRooms(): Room[] {
  return [
    {
      id: 0,
      name: 'COMMAND CTR',
      agentId: 'sentry',
      x: 0, y: 0, w: 12, h: 9,
      furniture: [
        { x: 4, y: 3, type: 'desk' },
        { x: 5, y: 3, type: 'monitor' },
        { x: 4, y: 4, type: 'chair' },
        { x: 1, y: 1, type: 'plant' },
        { x: 9, y: 1, type: 'plant' },
      ],
    },
    {
      id: 1,
      name: 'CFO SUITE',
      agentId: 'atlas',
      x: 16, y: 0, w: 12, h: 9,
      furniture: [
        { x: 20, y: 3, type: 'desk' },
        { x: 21, y: 3, type: 'monitor' },
        { x: 20, y: 4, type: 'chair' },
        { x: 17, y: 1, type: 'plant' },
        { x: 25, y: 1, type: 'plant' },
      ],
    },
    {
      id: 2,
      name: 'OPS HUB',
      agentId: 'nexus',
      x: 0, y: 11, w: 12, h: 9,
      furniture: [
        { x: 4, y: 14, type: 'desk' },
        { x: 5, y: 14, type: 'monitor' },
        { x: 4, y: 15, type: 'chair' },
        { x: 1, y: 12, type: 'plant' },
        { x: 9, y: 12, type: 'plant' },
      ],
    },
    {
      id: 3,
      name: 'MARKETING',
      agentId: 'prism',
      x: 16, y: 11, w: 12, h: 9,
      furniture: [
        { x: 20, y: 14, type: 'desk' },
        { x: 21, y: 14, type: 'monitor' },
        { x: 20, y: 15, type: 'chair' },
        { x: 17, y: 12, type: 'plant' },
        { x: 25, y: 12, type: 'plant' },
      ],
    },
  ];
}

export function buildGrid(rooms: Room[]): Tile[][] {
  // Initialize everything as wall
  const grid: Tile[][] = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => ({
      walkable: false,
      type: 'wall' as const,
      roomId: -1,
    }))
  );

  // Mark room interiors as walkable floor
  for (const room of rooms) {
    for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
      for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
        grid[y][x] = { walkable: true, type: 'floor', roomId: room.id };
      }
    }
  }

  // Corridor rows 9–10: fully walkable
  for (let x = 0; x < GRID_W; x++) {
    grid[9][x] = { walkable: true, type: 'corridor', roomId: -1 };
    grid[10][x] = { walkable: true, type: 'corridor', roomId: -1 };
  }

  // Door gaps connecting top rooms to corridor (row 8)
  grid[8][5] = { walkable: true, type: 'floor', roomId: 0 };
  grid[8][6] = { walkable: true, type: 'floor', roomId: 0 };
  grid[8][21] = { walkable: true, type: 'floor', roomId: 1 };
  grid[8][22] = { walkable: true, type: 'floor', roomId: 1 };

  // Door gaps connecting bottom rooms to corridor (row 11)
  grid[11][5] = { walkable: true, type: 'floor', roomId: 2 };
  grid[11][6] = { walkable: true, type: 'floor', roomId: 2 };
  grid[11][21] = { walkable: true, type: 'floor', roomId: 3 };
  grid[11][22] = { walkable: true, type: 'floor', roomId: 3 };

  // Mark desk and plant tiles as non-walkable
  for (const room of rooms) {
    for (const f of room.furniture) {
      if ((f.type === 'desk' || f.type === 'plant') && f.y < GRID_H && f.x < GRID_W) {
        grid[f.y][f.x].walkable = false;
      }
    }
  }

  return grid;
}

export function buildAgents(): Agent[] {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return [
    {
      id: 'sentry',
      name: 'SENTRY',
      role: 'AI Chief of Staff',
      roomId: 0,
      x: 5, y: 5,
      state: 'IDLE',
      direction: 'down',
      online: true,
      path: [], pathIndex: 0,
      animFrame: 0, animTimer: 0,
      stateTimer: 120 + Math.floor(Math.random() * 120),
      deskX: 4, deskY: 3,
      speechBubble: null, speechTimer: 0,
      activityLog: [{ time: timeStr, message: 'System initialized' }],
    },
    {
      id: 'atlas',
      name: 'ATLAS',
      role: 'CFO Agent',
      roomId: 1,
      x: 20, y: 4,
      state: 'IDLE',
      direction: 'down',
      online: false,
      path: [], pathIndex: 0,
      animFrame: 0, animTimer: 0,
      stateTimer: 0,
      deskX: 20, deskY: 3,
      speechBubble: null, speechTimer: 0,
      activityLog: [],
    },
    {
      id: 'nexus',
      name: 'NEXUS',
      role: 'Operations Agent',
      roomId: 2,
      x: 4, y: 15,
      state: 'IDLE',
      direction: 'down',
      online: false,
      path: [], pathIndex: 0,
      animFrame: 0, animTimer: 0,
      stateTimer: 0,
      deskX: 4, deskY: 14,
      speechBubble: null, speechTimer: 0,
      activityLog: [],
    },
    {
      id: 'prism',
      name: 'PRISM',
      role: 'Marketing Agent',
      roomId: 3,
      x: 20, y: 15,
      state: 'IDLE',
      direction: 'down',
      online: false,
      path: [], pathIndex: 0,
      animFrame: 0, animTimer: 0,
      stateTimer: 0,
      deskX: 20, deskY: 14,
      speechBubble: null, speechTimer: 0,
      activityLog: [],
    },
  ];
}

export function bfs(
  grid: Tile[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { x: number; y: number }[] {
  const sx = Math.round(startX);
  const sy = Math.round(startY);
  const ex = Math.round(endX);
  const ey = Math.round(endY);

  if (sx === ex && sy === ey) return [];

  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  const visited = new Set<string>();
  type Node = { x: number; y: number; path: { x: number; y: number }[] };
  const queue: Node[] = [{ x: sx, y: sy, path: [] }];
  visited.add(`${sx},${sy}`);

  let iters = 0;
  while (queue.length > 0 && iters < 400) {
    iters++;
    const curr = queue.shift()!;
    for (const d of dirs) {
      const nx = curr.x + d.x;
      const ny = curr.y + d.y;
      const key = `${nx},${ny}`;
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
      if (!grid[ny][nx].walkable) continue;
      if (visited.has(key)) continue;
      const newPath = [...curr.path, { x: nx, y: ny }];
      if (nx === ex && ny === ey) return newPath;
      visited.add(key);
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }
  return [];
}

function randomWalkable(grid: Tile[][], room: Room): { x: number; y: number } {
  const candidates: { x: number; y: number }[] = [];
  for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
    for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
      if (grid[y][x].walkable) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return { x: room.x + 2, y: room.y + 2 };
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function tickAgents(state: GameState): void {
  const { agents, grid, rooms } = state;

  for (const agent of agents) {
    if (!agent.online) continue;

    // Decrement speech timer
    if (agent.speechTimer > 0) {
      agent.speechTimer--;
    } else {
      agent.speechBubble = null;
    }

    agent.animTimer++;

    switch (agent.state) {
      case 'IDLE': {
        if (agent.animTimer >= 20) {
          agent.animTimer = 0;
          agent.animFrame = (agent.animFrame + 1) % 2;
        }
        agent.stateTimer--;
        if (agent.stateTimer <= 0) {
          const goToDesk = Math.random() < 0.4;
          const room = rooms[agent.roomId];
          if (goToDesk) {
            const path = bfs(grid, agent.x, agent.y, agent.deskX, agent.deskY + 1);
            if (path.length > 0) {
              agent.path = path;
              agent.pathIndex = 0;
              agent.state = 'WALK';
              agent.animFrame = 0;
              agent.animTimer = 0;
            } else {
              agent.stateTimer = 90 + Math.floor(Math.random() * 90);
            }
          } else {
            const target = randomWalkable(grid, room);
            const path = bfs(grid, agent.x, agent.y, target.x, target.y);
            if (path.length > 0) {
              agent.path = path;
              agent.pathIndex = 0;
              agent.state = 'WALK';
              agent.animFrame = 0;
              agent.animTimer = 0;
            } else {
              agent.stateTimer = 90 + Math.floor(Math.random() * 90);
            }
          }
        }
        break;
      }

      case 'WALK': {
        if (agent.animTimer >= 8) {
          agent.animTimer = 0;
          agent.animFrame = (agent.animFrame + 1) % 4;
        }
        if (agent.pathIndex >= agent.path.length) {
          // Arrived — check if at desk chair position
          const atDesk =
            Math.abs(agent.x - agent.deskX) < 1.5 &&
            Math.abs(agent.y - (agent.deskY + 1)) < 1.5;

          if (atDesk) {
            agent.state = 'TYPE';
            agent.animFrame = 0;
            agent.animTimer = 0;
            agent.stateTimer = 200 + Math.floor(Math.random() * 200);
            // First speech bubble on arriving
            const msg = SENTRY_MESSAGES[Math.floor(Math.random() * SENTRY_MESSAGES.length)];
            agent.speechBubble = msg;
            agent.speechTimer = 180;
            const time = new Date().toLocaleTimeString('en-US', {
              hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
            });
            agent.activityLog.unshift({ time, message: msg });
            if (agent.activityLog.length > 10) agent.activityLog.pop();
          } else {
            agent.state = 'IDLE';
            agent.stateTimer = 120 + Math.floor(Math.random() * 180);
            agent.animFrame = 0;
            agent.animTimer = 0;
          }
          agent.path = [];
          agent.pathIndex = 0;
        } else {
          const target = agent.path[agent.pathIndex];
          const dx = target.x - agent.x;
          const dy = target.y - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = 0.1;

          if (Math.abs(dx) > Math.abs(dy)) {
            agent.direction = dx > 0 ? 'right' : 'left';
          } else {
            agent.direction = dy > 0 ? 'down' : 'up';
          }

          if (dist <= speed) {
            agent.x = target.x;
            agent.y = target.y;
            agent.pathIndex++;
          } else {
            agent.x += (dx / dist) * speed;
            agent.y += (dy / dist) * speed;
          }
        }
        break;
      }

      case 'TYPE': {
        if (agent.animTimer >= 8) {
          agent.animTimer = 0;
          agent.animFrame = (agent.animFrame + 1) % 3;
        }
        // New speech bubble every ~120 frames (2s) when current expires
        if (agent.speechTimer === 0) {
          const msg = SENTRY_MESSAGES[Math.floor(Math.random() * SENTRY_MESSAGES.length)];
          agent.speechBubble = msg;
          agent.speechTimer = 180;
          const time = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
          });
          agent.activityLog.unshift({ time, message: msg });
          if (agent.activityLog.length > 10) agent.activityLog.pop();
        }
        agent.stateTimer--;
        if (agent.stateTimer <= 0) {
          agent.state = 'IDLE';
          agent.stateTimer = 120 + Math.floor(Math.random() * 120);
          agent.animFrame = 0;
          agent.animTimer = 0;
        }
        break;
      }
    }
  }

  state.frame++;
  // Ticker scrolls at 0.4 native px/frame
  state.tickerOffset -= 0.4;
}
