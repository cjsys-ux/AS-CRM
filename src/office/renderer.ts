import { GameState, Agent, Room } from './types';
import { TILE_SIZE, GRID_W, GRID_H, NATIVE_W, NATIVE_H, TICKER_H, SCALE } from './engine';

// Palette
const C = {
  // Floor
  floorDark:    '#0b0f17',
  floorGrid:    '#12182a',
  corridorDark: '#07090f',
  corridorGrid: '#0d1118',
  // Walls
  wallDark:     '#14192a',
  wallMid:      '#1e2740',
  wallTop:      '#2a3655',
  // Center divider gap (cols 12–15)
  dividerWall:  '#0f1420',
  // Desk
  deskTop:      '#6b4226',
  deskFront:    '#3d2212',
  deskSide:     '#4e2f18',
  // Chair
  chairSeat:    '#1c2535',
  chairBack:    '#111722',
  chairLight:   '#283347',
  // Monitor
  monitorFrame: '#141e2e',
  monitorOn:    '#00ff88',
  monitorOff:   '#060a0d',
  monitorGlow:  'rgba(0,255,136,0.12)',
  // Plant
  plantDark:    '#14532d',
  plantMid:     '#16a34a',
  plantLight:   '#22c55e',
  potBrown:     '#78350f',
  potLight:     '#92400e',
  // Agent active
  agentGreen:   '#00ff88',
  agentGreenDk: '#005533',
  agentGreenMd: '#008855',
  // Agent offline
  agentGrey:    '#3a3a5a',
  agentGreyDk:  '#1e1e2e',
  agentGreyMd:  '#505070',
  // Skin
  skin:         '#f5c18a',
  // Text
  textLabel:    '#1f3050',
  textGreen:    '#00ff88',
  // Ticker
  tickerBg:     '#040811',
  tickerBorder: '#002a1a',
  tickerText:   '#00884d',
};

type Ctx = CanvasRenderingContext2D;

// ── Tile drawing ──────────────────────────────────────────────────────────────

function drawFloor(ctx: Ctx, x: number, y: number, corridor: boolean) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = corridor ? C.corridorDark : C.floorDark;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = corridor ? C.corridorGrid : C.floorGrid;
  // Right edge
  ctx.fillRect(px + TILE_SIZE - 1, py, 1, TILE_SIZE);
  // Bottom edge
  ctx.fillRect(px, py + TILE_SIZE - 1, TILE_SIZE, 1);
}

function drawWall(ctx: Ctx, x: number, y: number) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = C.wallDark;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  // Top highlight
  ctx.fillStyle = C.wallTop;
  ctx.fillRect(px, py, TILE_SIZE, 2);
  // Left face
  ctx.fillStyle = C.wallMid;
  ctx.fillRect(px, py + 2, 2, TILE_SIZE - 2);
}

// ── Furniture ─────────────────────────────────────────────────────────────────

function drawDesk(ctx: Ctx, x: number, y: number) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  // Top surface
  ctx.fillStyle = C.deskTop;
  ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 4);
  // Front face
  ctx.fillStyle = C.deskFront;
  ctx.fillRect(px + 1, py + TILE_SIZE - 4, TILE_SIZE - 2, 3);
  // Left leg shadow
  ctx.fillStyle = C.deskSide;
  ctx.fillRect(px + 1, py + 1, 2, TILE_SIZE - 2);
}

function drawChair(ctx: Ctx, x: number, y: number) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  // Back
  ctx.fillStyle = C.chairBack;
  ctx.fillRect(px + 2, py + 2, 6, 3);
  // Seat
  ctx.fillStyle = C.chairSeat;
  ctx.fillRect(px + 2, py + 5, 6, 3);
  // Highlight on seat
  ctx.fillStyle = C.chairLight;
  ctx.fillRect(px + 2, py + 5, 1, 3);
}

function drawMonitor(ctx: Ctx, x: number, y: number, active: boolean) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const mw = 6, mh = 5;
  const mx = px + 2;
  const my = py + 1;

  if (active) {
    // Glow effect
    ctx.fillStyle = C.monitorGlow;
    ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
  }
  // Frame
  ctx.fillStyle = C.monitorFrame;
  ctx.fillRect(mx, my, mw, mh);
  // Screen
  ctx.fillStyle = active ? C.monitorOn : C.monitorOff;
  ctx.fillRect(mx + 1, my + 1, mw - 2, mh - 2);
  // Stand
  ctx.fillStyle = C.monitorFrame;
  ctx.fillRect(mx + 2, my + mh, 2, 2);
}

function drawPlant(ctx: Ctx, x: number, y: number) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  // Pot
  ctx.fillStyle = C.potBrown;
  ctx.fillRect(px + 3, py + 6, 4, 3);
  ctx.fillStyle = C.potLight;
  ctx.fillRect(px + 3, py + 6, 4, 1);
  // Leaves (layered for depth)
  ctx.fillStyle = C.plantDark;
  ctx.fillRect(px + 2, py + 2, 6, 5);
  ctx.fillStyle = C.plantMid;
  ctx.fillRect(px + 3, py + 1, 4, 4);
  ctx.fillStyle = C.plantLight;
  ctx.fillRect(px + 4, py + 1, 2, 2);
}

// ── Agent sprite ──────────────────────────────────────────────────────────────

function drawAgentSprite(ctx: Ctx, agent: Agent) {
  // Center agent horizontally in tile, offset up so feet land at tile bottom
  const px = agent.x * TILE_SIZE - 4;
  const py = agent.y * TILE_SIZE - 8;

  const active = agent.online;
  const bodyColor  = active ? C.agentGreen    : C.agentGrey;
  const bodyDark   = active ? C.agentGreenDk  : C.agentGreyDk;
  const bodyMid    = active ? C.agentGreenMd  : C.agentGreyMd;
  const skinColor  = active ? C.skin          : '#404050';
  const eyeColor   = active ? '#1a0a00'       : '#1a1a2a';

  if (!active) {
    ctx.globalAlpha = 0.45;
  }

  // Head (4×4 px)
  ctx.fillStyle = skinColor;
  ctx.fillRect(px + 2, py, 4, 4);
  // Eyes
  ctx.fillStyle = eyeColor;
  ctx.fillRect(px + 3, py + 1, 1, 1);
  ctx.fillRect(px + 5, py + 1, 1, 1);

  // Body (6×5 px)
  ctx.fillStyle = bodyColor;
  ctx.fillRect(px + 1, py + 4, 6, 5);
  // Collar highlight
  ctx.fillStyle = active ? '#88ffcc' : '#606080';
  ctx.fillRect(px + 3, py + 4, 2, 1);

  // Arms
  ctx.fillStyle = bodyMid;
  if (agent.state === 'TYPE') {
    // Arms forward on keyboard
    ctx.fillRect(px, py + 6, 1, 3);
    ctx.fillRect(px + 7, py + 6, 1, 3);
    ctx.fillStyle = skinColor;
    ctx.fillRect(px, py + 8, 1, 1);
    ctx.fillRect(px + 7, py + 8, 1, 1);
  } else {
    ctx.fillRect(px, py + 5, 1, 3);
    ctx.fillRect(px + 7, py + 5, 1, 3);
  }

  // Legs
  ctx.fillStyle = bodyDark;
  if (agent.state === 'WALK') {
    const lo = agent.animFrame % 2 === 0 ? 0 : 2;
    const ro = agent.animFrame % 2 === 0 ? 2 : 0;
    ctx.fillRect(px + 2, py + 9 + lo, 2, 3 - lo);
    ctx.fillRect(px + 4, py + 9 + ro, 2, 3 - ro);
  } else {
    ctx.fillRect(px + 2, py + 9, 2, 3);
    ctx.fillRect(px + 4, py + 9, 2, 3);
  }

  // Feet
  ctx.fillStyle = bodyMid;
  ctx.fillRect(px + 1, py + 11, 3, 1);
  ctx.fillRect(px + 4, py + 11, 3, 1);

  ctx.globalAlpha = 1;
}

// ── Speech bubble ─────────────────────────────────────────────────────────────

function drawSpeechBubble(ctx: Ctx, agent: Agent, timer: number, text: string) {
  const alpha = timer <= 60 ? timer / 60 : 1;
  ctx.globalAlpha = alpha;

  ctx.font = 'bold 4px monospace';
  const textW = ctx.measureText(text).width;
  const padX = 3;
  const padY = 2;
  const bw = Math.min(textW + padX * 2, 80); // cap width
  const bh = 8;

  // Position above agent head
  const bx = agent.x * TILE_SIZE - bw / 2 + TILE_SIZE / 2;
  const by = agent.y * TILE_SIZE - 22;

  // Bubble background
  ctx.fillStyle = '#071510';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.fillStyle = '#071510';
  ctx.beginPath();
  ctx.moveTo(bx + bw / 2 - 2, by + bh);
  ctx.lineTo(bx + bw / 2 + 2, by + bh);
  ctx.lineTo(bx + bw / 2, by + bh + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Text (clip to bubble width)
  ctx.save();
  ctx.rect(bx + padX, by, bw - padX * 2, bh);
  ctx.clip();
  ctx.fillStyle = '#00ff88';
  ctx.fillText(text, bx + padX, by + padY + 4);
  ctx.restore();

  ctx.globalAlpha = 1;
}

// ── Room label ────────────────────────────────────────────────────────────────

function drawRoomLabel(ctx: Ctx, room: Room) {
  ctx.font = 'bold 5px monospace';
  ctx.fillStyle = C.textLabel;
  const label = room.name;
  const w = ctx.measureText(label).width;
  const cx = (room.x + room.w / 2) * TILE_SIZE;
  const cy = room.y * TILE_SIZE + 7;
  ctx.fillText(label, cx - w / 2, cy);
}

// ── Ticker strip ──────────────────────────────────────────────────────────────

function drawTicker(ctx: Ctx, state: GameState) {
  const ty = NATIVE_H;
  ctx.fillStyle = C.tickerBg;
  ctx.fillRect(0, ty, NATIVE_W, TICKER_H);
  ctx.fillStyle = C.tickerBorder;
  ctx.fillRect(0, ty, NATIVE_W, 1);

  ctx.font = '4px monospace';
  // Measure text and reset offset when fully scrolled off
  const textW = ctx.measureText(state.tickerText).width;
  if (state.tickerOffset < -textW) {
    state.tickerOffset = NATIVE_W;
  }
  ctx.fillStyle = C.tickerText;
  ctx.fillText(state.tickerText, state.tickerOffset, ty + 7);
}

// ── Main render ───────────────────────────────────────────────────────────────

export function renderFrame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.clearRect(0, 0, NATIVE_W * SCALE, (NATIVE_H + TICKER_H) * SCALE);

  ctx.save();
  ctx.scale(SCALE, SCALE);

  // 1. Tiles (floor + walls)
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const tile = state.grid[y][x];
      if (tile.type === 'floor' || tile.type === 'corridor') {
        drawFloor(ctx, x, y, tile.type === 'corridor');
      } else {
        drawWall(ctx, x, y);
      }
    }
  }

  // 2. Furniture + room labels
  for (const room of state.rooms) {
    const agentOnline = state.agents.find(a => a.id === room.agentId)?.online ?? false;
    for (const f of room.furniture) {
      switch (f.type) {
        case 'desk':    drawDesk(ctx, f.x, f.y);                  break;
        case 'monitor': drawMonitor(ctx, f.x, f.y, agentOnline);  break;
        case 'chair':   drawChair(ctx, f.x, f.y);                 break;
        case 'plant':   drawPlant(ctx, f.x, f.y);                 break;
      }
    }
    drawRoomLabel(ctx, room);
  }

  // 3. Agents (Y-sorted for correct overlap)
  const sorted = [...state.agents].sort((a, b) => a.y - b.y);
  for (const agent of sorted) {
    drawAgentSprite(ctx, agent);
    if (agent.speechBubble && agent.speechTimer > 0) {
      drawSpeechBubble(ctx, agent, agent.speechTimer, agent.speechBubble);
    }
  }

  // 4. Ticker
  drawTicker(ctx, state);

  ctx.restore();
}
