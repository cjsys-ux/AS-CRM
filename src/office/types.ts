export type AgentState = 'IDLE' | 'WALK' | 'TYPE';
export type Direction = 'down' | 'up' | 'left' | 'right';

export interface Tile {
  walkable: boolean;
  type: 'floor' | 'wall' | 'corridor';
  roomId: number; // 0-3 or -1
}

export interface Furniture {
  x: number;
  y: number;
  type: 'desk' | 'chair' | 'plant' | 'monitor';
}

export interface Room {
  id: number;
  name: string;
  agentId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  furniture: Furniture[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  roomId: number;
  x: number;
  y: number;
  state: AgentState;
  direction: Direction;
  online: boolean;
  path: { x: number; y: number }[];
  pathIndex: number;
  animFrame: number;
  animTimer: number;
  stateTimer: number;
  deskX: number;
  deskY: number;
  speechBubble: string | null;
  speechTimer: number;
  activityLog: { time: string; message: string }[];
}

export interface GameState {
  grid: Tile[][];
  agents: Agent[];
  rooms: Room[];
  frame: number;
  tickerOffset: number;
  tickerText: string;
}

export interface AgentPanelData {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  online: boolean;
  speech: string | null;
  activityLog: { time: string; message: string }[];
}
