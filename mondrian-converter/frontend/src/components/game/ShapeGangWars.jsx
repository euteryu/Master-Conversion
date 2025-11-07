// src/components/game/ShapeGangWars.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import GameGrid from './GameGrid';
import GameUI from './GameUI';

const PLAYER_COLORS = { 0: '#3B82F6', 1: '#D21404', 2: '#22C55E', 3: '#F7D002' };
const PLAYER_NAMES = { 0: 'P1', 1: 'P2', 2: 'P3', 3: 'P4' };

const INITIAL_CONFIG = {
  GRID_SIZE_X: 7,
  GRID_SIZE_Y: 5,
  CELL_SIZE: 90,
  STREET_WIDTH: 12,
  PLAYER_SIZE: 36,
  MOVE_COOLDOWN_SECONDS: 0.15,
  ROUND_SECONDS: 90,
  POWERUP_SPAWN_RATE: 5000,
  POWERUP_LIFESPAN_SECONDS: 12,
  BULLET_PIXELS_PER_SECOND: 450,
  AMMO_PICKUP_AMOUNT: 3,
  MAX_HEALTH: 3,
  INTERPOLATION_FACTOR: 0.25,
};

const ShapeGangWars = () => {
  const [gamePhase, setGamePhase] = useState('selection');
  const [selectedColor, setSelectedColor] = useState(0);
  const [renderTick, setRenderTick] = useState(0);
  const [countdown, setCountdown] = useState(null);

  const configRef = useRef(INITIAL_CONFIG);
  const gameStateRef = useRef({ status: 'waiting' });
  const heldKeys = useRef(new Set());
  const bulletIdCounter = useRef(0);
  const powerupIdCounter = useRef(0);
  const gameLoopId = useRef(null);
  const lastTickTime = useRef(0);
  const audioRefs = useRef({});

  const playSound = (sound) => {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error("Audio play failed:", error));
    }
  };

  useEffect(() => {
    audioRefs.current = {
      shoot: new Audio('/sounds/shoot.mp3'),
      shield: new Audio('/sounds/shield.mp3'),
      heart: new Audio('/sounds/heart.mp3'),
      ammo: new Audio('/sounds/ammo.mp3'),
      bgm: new Audio('/sounds/shapegangwars.mp3'),
      gang: [
        new Audio('/sounds/blue_gang.mp3'),
        new Audio('/sounds/red_gang.mp3'),
        new Audio('/sounds/green_gang.mp3'),
        new Audio('/sounds/yellow_gang.mp3'),
      ]
    };
    audioRefs.current.bgm.loop = true;
    audioRefs.current.bgm.volume = 0.5;

    // Start playing the music as soon as the component mounts (on the selection screen).
    audioRefs.current.bgm.play().catch(e => console.error("BGM play failed:", e));

    // Cleanup function runs when you navigate away from this page.
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio instanceof Audio) {
          audio.pause();
          audio.currentTime = 0;
        } else if (Array.isArray(audio)) {
          audio.forEach(a => {
            a.pause();
            a.currentTime = 0;
          });
        }
      });
    }
  }, []); // Empty array ensures this runs only on mount and unmount

  const createInitialState = useCallback(() => {
    const cfg = configRef.current;
    const startPositions = [
      { x: 0, y: 0 }, { x: cfg.GRID_SIZE_X - 1, y: 0 },
      { x: 0, y: cfg.GRID_SIZE_Y - 1 }, { x: cfg.GRID_SIZE_X - 1, y: cfg.GRID_SIZE_Y - 1 }
    ];

    gameStateRef.current = {
      status: 'playing',
      winner: null,
      grid: Array.from({ length: cfg.GRID_SIZE_Y }, () =>
        Array.from({ length: cfg.GRID_SIZE_X }, () => ({ right: null, down: null, owner: null }))
      ),
      players: startPositions.map((pos, idx) => ({
        id: idx, gridX: pos.x, gridY: pos.y,
        pixelX: pos.x * cfg.CELL_SIZE, pixelY: pos.y * cfg.CELL_SIZE,
        isHuman: idx === selectedColor,
        health: cfg.MAX_HEALTH, ammo: 3, hasShield: false,
        lastDir: pos.x === 0 ? 'd' : 'a',
        hitAnimation: 0, moveCooldown: 0,
      })),
      powerups: [], bullets: [],
      timer: cfg.ROUND_SECONDS,
      scores: { 0: 0, 1: 0, 2: 0, 3: 0 },
      prevScores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    };
    setCountdown(null);
    setGamePhase('playing');
  }, [selectedColor]);

  const updateGame = useCallback((timestamp) => {
    const { current: gs } = gameStateRef;
    const { current: cfg } = configRef;
    if (gs.status !== 'playing') return;

    if (!lastTickTime.current) lastTickTime.current = timestamp;
    const deltaTime = (timestamp - lastTickTime.current) / 1000;
    lastTickTime.current = timestamp;

    gs.timer = Math.max(0, gs.timer - deltaTime);
    if (gs.timer === 0) {
      gs.status = 'gameOver';
      const maxScore = Math.max(...Object.values(gs.scores));
      gs.winner = maxScore > 0 ? (Object.keys(gs.scores).filter(id => gs.scores[id] === maxScore).length > 1 ? 'DRAW' : parseInt(Object.keys(gs.scores).find(id => gs.scores[id] === maxScore))) : 'DRAW';
    }

    gs.players.forEach(p => {
      p.moveCooldown = Math.max(0, p.moveCooldown - deltaTime);
      p.hitAnimation = Math.max(0, p.hitAnimation - 1);
      const targetPixelX = p.gridX * cfg.CELL_SIZE;
      const targetPixelY = p.gridY * cfg.CELL_SIZE;
      p.pixelX += (targetPixelX - p.pixelX) * cfg.INTERPOLATION_FACTOR;
      p.pixelY += (targetPixelY - p.pixelY) * cfg.INTERPOLATION_FACTOR;
      if (p.health > 0) {
        if (p.isHuman) handleHumanInput(p, gs, cfg);
        else handleAI(p, gs, cfg);
      }
    });

    gs.bullets = gs.bullets.filter(b => {
      b.x += b.dx * cfg.BULLET_PIXELS_PER_SECOND * deltaTime;
      b.y += b.dy * cfg.BULLET_PIXELS_PER_SECOND * deltaTime;
      for (const p of gs.players) {
        if (p.id === b.ownerId || p.health <= 0) continue;
        const distance = Math.hypot(b.x - p.pixelX, b.y - p.pixelY);
        const collisionBoundary = p.hasShield ? (cfg.PLAYER_SIZE / 2 + 10) : (cfg.PLAYER_SIZE / 2);
        if (distance < collisionBoundary) {
          if (p.hasShield) p.hasShield = false;
          else p.health = Math.max(0, p.health - 1);
          p.hitAnimation = 5;
          return false;
        }
      }
      return b.x > -20 && b.x < cfg.GRID_SIZE_X * cfg.CELL_SIZE + 20 && b.y > -20 && b.y < cfg.GRID_SIZE_Y * cfg.CELL_SIZE + 20;
    });

    gs.powerups = gs.powerups.filter(p => (p.life -= deltaTime) > 0);
    gs.players.forEach(player => {
      if (player.health <= 0) return;
      gs.powerups = gs.powerups.filter(powerup => {
        const powerupPixelX = powerup.gridX * cfg.CELL_SIZE;
        const powerupPixelY = powerup.gridY * cfg.CELL_SIZE;
        const distance = Math.hypot(powerupPixelX - player.pixelX, powerupPixelY - player.pixelY);
        if (distance < cfg.PLAYER_SIZE) {
          if (powerup.type === 'health' && player.health < cfg.MAX_HEALTH) {
            player.health++;
            playSound(audioRefs.current.heart);
          } else if (powerup.type === 'ammo') {
            player.ammo += cfg.AMMO_PICKUP_AMOUNT;
            playSound(audioRefs.current.ammo);
          } else if (powerup.type === 'shield') {
            player.hasShield = true;
            playSound(audioRefs.current.shield);
          }
          return false;
        }
        return true;
      });
    });

    const newScores = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let y = 0; y < cfg.GRID_SIZE_Y - 1; y++) {
      for (let x = 0; x < cfg.GRID_SIZE_X - 1; x++) {
        const top = gs.grid[y][x]?.right;
        const bottom = gs.grid[y + 1][x]?.right;
        const left = gs.grid[y][x]?.down;
        const right = gs.grid[y][x + 1]?.down;
        if (top !== null && top === bottom && top === left && top === right) {
          gs.grid[y][x].owner = top;
          newScores[top]++;
        } else {
          gs.grid[y][x].owner = null;
        }
      }
    }
    
    for (const playerId in newScores) {
      if (newScores[playerId] > gs.prevScores[playerId]) {
        playSound(audioRefs.current.gang[playerId]);
      }
    }
    gs.scores = newScores;
    gs.prevScores = { ...newScores };

    setRenderTick(t => t + 1);
  }, []);

  const canPlayerMove = (player, cfg) => { if (player.moveCooldown > 0) return false; const targetPixelX = player.gridX * cfg.CELL_SIZE; const targetPixelY = player.gridY * cfg.CELL_SIZE; const distanceToTarget = Math.hypot(player.pixelX - targetPixelX, player.pixelY - targetPixelY); return distanceToTarget < 2.0; }
  const handleHumanInput = (player, gs, cfg) => { if (!canPlayerMove(player, cfg)) return; const key = [...heldKeys.current].find(k => ['w','s','a','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)); if (!key) return; const oldPos = { x: player.gridX, y: player.gridY }; let targetX = player.gridX; let targetY = player.gridY; let newDir = player.lastDir; if ((key === 'w' || key === 'ArrowUp') && player.gridY > 0) { targetY--; newDir = 'w'; } else if ((key === 's' || key === 'ArrowDown') && player.gridY < cfg.GRID_SIZE_Y - 1) { targetY++; newDir = 's'; } else if ((key === 'a' || key === 'ArrowLeft') && player.gridX > 0) { targetX--; newDir = 'a'; } else if ((key === 'd' || key === 'ArrowRight') && player.gridX < cfg.GRID_SIZE_X - 1) { targetX++; newDir = 'd'; } if (targetX !== player.gridX || targetY !== player.gridY) { player.gridX = targetX; player.gridY = targetY; player.lastDir = newDir; player.moveCooldown = cfg.MOVE_COOLDOWN_SECONDS; updateGrid(oldPos, { x: player.gridX, y: player.gridY }, player.id, gs); } };
  const handleAI = (player, gs, cfg) => { if (!canPlayerMove(player, cfg)) return; const potentialMoves = []; if (player.gridY > 0) potentialMoves.push({ x: player.gridX, y: player.gridY - 1, dir: 'w' }); if (player.gridY < cfg.GRID_SIZE_Y - 1) potentialMoves.push({ x: player.gridX, y: player.gridY + 1, dir: 's' }); if (player.gridX > 0) potentialMoves.push({ x: player.gridX - 1, y: player.gridY, dir: 'a' }); if (player.gridX < cfg.GRID_SIZE_X - 1) potentialMoves.push({ x: player.gridX + 1, y: player.gridY, dir: 'd' }); if (potentialMoves.length > 0) { const move = potentialMoves[Math.floor(Math.random() * potentialMoves.length)]; const oldPos = { x: player.gridX, y: player.gridY }; player.gridX = move.x; player.gridY = move.y; player.lastDir = move.dir; player.moveCooldown = cfg.MOVE_COOLDOWN_SECONDS * (1.5 + Math.random()); updateGrid(oldPos, move, player.id, gs); } if (player.ammo > 0 && Math.random() < 0.05) shoot(player, gs); };
  const updateGrid = (oldPos, newPos, playerId, gs) => { if (newPos.y < oldPos.y) gs.grid[newPos.y][newPos.x].down = playerId; else if (newPos.y > oldPos.y) gs.grid[oldPos.y][oldPos.x].down = playerId; else if (newPos.x < oldPos.x) gs.grid[newPos.y][newPos.x].right = playerId; else if (newPos.x > oldPos.x) gs.grid[oldPos.y][oldPos.x].right = playerId; };
  const shoot = (player, gs) => { if (player.ammo <= 0 || player.health <= 0) return; player.ammo--; playSound(audioRefs.current.shoot); let dx = 0, dy = 0; if (player.lastDir === 'w') dy = -1; else if (player.lastDir === 's') dy = 1; else if (player.lastDir === 'a') dx = -1; else if (player.lastDir === 'd') dx = 1; gs.bullets.push({ id: bulletIdCounter.current++, ownerId: player.id, x: player.pixelX, y: player.pixelY, dx, dy }); };
  useEffect(() => { const mainLoop = (timestamp) => { updateGame(timestamp); gameLoopId.current = requestAnimationFrame(mainLoop); }; if (gamePhase === 'playing' && gameStateRef.current.status === 'playing') { lastTickTime.current = performance.now(); gameLoopId.current = requestAnimationFrame(mainLoop); } return () => { if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current); }; }, [gamePhase, updateGame]);
  useEffect(() => { let i; if(gamePhase==='playing' && gameStateRef.current.status==='playing') { i=setInterval(() => { const c = configRef.current; const x = Math.floor(Math.random() * c.GRID_SIZE_X); const y = Math.floor(Math.random() * c.GRID_SIZE_Y); const t=['health','ammo','shield'][Math.floor(Math.random()*3)]; gameStateRef.current.powerups.push({id: powerupIdCounter.current++,gridX:x,gridY:y,type:t,life:c.POWERUP_LIFESPAN_SECONDS}); }, configRef.current.POWERUP_SPAWN_RATE); } return () => clearInterval(i); }, [gamePhase]);
  useEffect(() => { const kD=(e)=>{heldKeys.current.add(e.key);if(e.key===' '){e.preventDefault();const h=gameStateRef.current.players.find(p=>p.isHuman);if(h)shoot(h,gameStateRef.current);}};const kU=(e)=>{heldKeys.current.delete(e.key);};window.addEventListener('keydown',kD);window.addEventListener('keyup',kU);return()=>{window.removeEventListener('keydown',kD);window.removeEventListener('keyup',kU);};}, []);
  useEffect(() => { const cS=()=>{const sH=window.innerHeight;const sW=window.innerWidth;const cH=(sH*0.75)/INITIAL_CONFIG.GRID_SIZE_Y;const cW=(sW*0.9)/INITIAL_CONFIG.GRID_SIZE_X;const nCS=Math.floor(Math.min(cH,cW));configRef.current={...INITIAL_CONFIG,CELL_SIZE:nCS,PLAYER_SIZE:nCS*0.4,STREET_WIDTH:nCS*0.13};setRenderTick(t=>t+1);};cS();window.addEventListener('resize',cS);return()=>window.removeEventListener('resize',cS);}, []);
  useEffect(() => { const handleRestart = (e) => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; if (gameStateRef.current.status === 'gameOver' && countdown === null) { setCountdown(3); } }; if (gameStateRef.current.status === 'gameOver') { window.addEventListener('keydown', handleRestart); } return () => window.removeEventListener('keydown', handleRestart); }, [renderTick, countdown]);
  useEffect(() => { if (countdown !== null && countdown > 0) { const timerId = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(timerId); } else if (countdown === 0) { createInitialState(); } }, [countdown, createInitialState]);
  const backToMenu = () => { gameStateRef.current.status = 'waiting'; setGamePhase('selection'); }
  const { players, timer, scores, grid, powerups, bullets, status, winner } = gameStateRef.current;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black relative">
      <style>{`.mondrian-font { font-family: 'Audiowide', sans-serif; letter-spacing: 0.5px; } @keyframes blink { 50% { opacity: 0.2; } } @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .game-title { animation: slideIn 0.5s ease-out; }`}</style>
      
      {gamePhase === 'selection' ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black relative">
          <div className="absolute top-5 left-5 z-30">
            <a href="#/" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="flex items-center px-4 py-2 bg-black border-4 border-white text-white hover:bg-white hover:text-black mondrian-font transition-all duration-200">
              <ArrowLeft className="mr-2" size={20} /> BACK
            </a>
          </div>
          <div className="text-6xl font-bold text-white mondrian-font mb-12 game-title border-8 border-white px-12 py-6">
            SELECT YOUR GANG
          </div>
          <div className="grid grid-cols-4 gap-8 mb-12">
            {[ { id: 0, name: 'THE BLUES', color: PLAYER_COLORS[0] }, { id: 1, name: 'THE REDS', color: PLAYER_COLORS[1] }, { id: 2, name: 'THE GREENS', color: PLAYER_COLORS[2] }, { id: 3, name: 'THE YELLOWS', color: PLAYER_COLORS[3] } ].map(gang => ( 
              <div key={gang.id} onClick={() => { setSelectedColor(gang.id); playSound(audioRefs.current.gang?.[gang.id]); }} className="cursor-pointer transition-all duration-200 game-title" style={{ opacity: selectedColor === gang.id ? 1 : 0.5, transform: selectedColor === gang.id ? 'scale(1.1)' : 'scale(1)' }}> 
                <div className="w-64 h-80 flex flex-col items-center justify-between p-6 border-8 border-black" style={{ backgroundColor: gang.color }}>
                  <div className="text-3xl font-bold text-black mondrian-font text-center drop-shadow-lg">{PLAYER_NAMES[gang.id]}</div>
                  <div className="w-32 h-32 border-8 border-black rounded-lg" style={{ backgroundColor: gang.color, boxShadow: '0 0 0 4px white, 0 8px 16px rgba(0,0,0,0.5)' }}/>
                  <div className="text-2xl font-bold text-black mondrian-font text-center">{gang.name}</div>
                  {selectedColor === gang.id && (<div className="text-xl font-bold text-white bg-black px-4 py-2 border-4 border-white animate-pulse">SELECTED</div>)}
                </div>
              </div> 
            ))}
          </div>
          <button onClick={createInitialState} className="text-4xl font-bold bg-white text-black border-8 border-black px-16 py-6 mondrian-font hover:bg-black hover:text-white hover:border-white transition-all duration-200">
            START GAME
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="absolute top-5 left-5 z-30">
            <button onClick={backToMenu} className="flex items-center px-4 py-2 bg-black border-4 border-white text-white hover:bg-white hover:text-black mondrian-font transition-all duration-200">
              <ArrowLeft className="mr-2" size={20} /> MENU
            </button>
          </div>
      
          {status === 'gameOver' && (
            <div className="absolute inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center text-white mondrian-font">
              {countdown !== null ? (
                <div className="flex flex-col items-center game-title">
                  <div className="text-4xl mb-8 tracking-wider">RESTARTING IN</div>
                  <div className="text-9xl font-bold px-12 py-8 border-8 border-white" style={{ backgroundColor: 'black', boxShadow: '0 0 40px rgba(255,255,255,0.3)' }}>
                    {countdown}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center game-title">
                  <div className="text-7xl font-bold mb-8 px-12 py-6 border-8" style={{ color: winner !== 'DRAW' && winner !== null ? PLAYER_COLORS[winner] : 'white', borderColor: winner !== 'DRAW' && winner !== null ? PLAYER_COLORS[winner] : 'white', backgroundColor: 'black', boxShadow: `0 0 50px ${winner !== 'DRAW' && winner !== null ? PLAYER_COLORS[winner] : 'rgba(255,255,255,0.5)'}` }}>
                    {winner === 'DRAW' ? 'DRAW!' : winner !== null ? `${PLAYER_NAMES[winner]} WINS!` : 'GAME OVER'}
                  </div>
                  <div className="text-xl mb-4">
                    Final Scores: P1:{scores[0]} P2:{scores[1]} P3:{scores[2]} P4:{scores[3]}
                  </div>
                  <div className="text-2xl tracking-widest animate-pulse border-4 border-white px-8 py-3 bg-black mb-6">
                    PRESS ANY KEY
                  </div>
                  <button onClick={backToMenu} className="text-2xl font-bold bg-white text-black border-4 border-black px-8 py-3 mondrian-font hover:bg-black hover:text-white hover:border-white transition-all duration-200">
                    BACK TO SELECTION
                  </button>
                </div>
              )}
            </div>
          )}
      
          <GameUI 
            players={players} 
            timer={timer} 
            scores={scores} 
            gridWidth={configRef.current.GRID_SIZE_X * configRef.current.CELL_SIZE} 
          />
          <GameGrid 
            config={configRef.current} 
            grid={grid} 
            players={players} 
            powerups={powerups} 
            bullets={bullets} 
          />
        </div>
      )}
    </div>
  );
};

export default ShapeGangWars;