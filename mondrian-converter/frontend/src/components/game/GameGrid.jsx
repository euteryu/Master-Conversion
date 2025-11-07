// src/components/game/GameGrid.jsx
import React from 'react';
import { Heart, Shield, Target as Gun } from 'lucide-react';

const PLAYER_COLORS = { 0: '#3B82F6', 1: '#D21404', 2: '#22C55E', 3: '#F7D002' };

const GameGrid = ({ config, grid, players, powerups, bullets }) => {
  const { GRID_SIZE_X, GRID_SIZE_Y, CELL_SIZE, STREET_WIDTH, PLAYER_SIZE } = config;

  if (!grid || grid.length === 0) {
    return (
      <div 
        className="relative bg-black border-4 border-gray-700" 
        style={{ 
          width: GRID_SIZE_X * CELL_SIZE, 
          height: GRID_SIZE_Y * CELL_SIZE 
        }}
      />
    );
  }

  return (
    <div 
      className="relative bg-black border-8 border-black"
      style={{ 
        boxSizing: 'border-box',
        width: GRID_SIZE_X * CELL_SIZE, 
        height: GRID_SIZE_Y * CELL_SIZE, 
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.6)' 
      }}
    >
      {/* White city blocks (base layer) */}
      {Array.from({ length: GRID_SIZE_Y - 1 }).map((_, y) => 
        Array.from({ length: GRID_SIZE_X - 1 }).map((_, x) => (
          <div 
            key={`block-${x}-${y}`}
            className="absolute bg-white"
            style={{ 
              top: y * CELL_SIZE + STREET_WIDTH, 
              left: x * CELL_SIZE + STREET_WIDTH, 
              width: CELL_SIZE - STREET_WIDTH, 
              height: CELL_SIZE - STREET_WIDTH,
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)'
            }}
          />
        ))
      )}

      {/* Colored territory fills (when blocks are owned) */}
      {grid.map((row, y) => row.map((cell, x) => (
        cell.owner !== null && y < GRID_SIZE_Y - 1 && x < GRID_SIZE_X - 1 && (
          <div 
            key={`territory-${x}-${y}`} 
            className="absolute"
            style={{
              top: y * CELL_SIZE + STREET_WIDTH, 
              left: x * CELL_SIZE + STREET_WIDTH, 
              width: CELL_SIZE - STREET_WIDTH, 
              height: CELL_SIZE - STREET_WIDTH,
              backgroundColor: PLAYER_COLORS[cell.owner],
              opacity: 0.9,
              zIndex: 3
            }}
          />
        )
      )))}

      {/* Dotted painted trails on streets - ALIGNED TO GRID INTERSECTIONS */}
      {grid.map((row, y) => row.map((cell, x) => (
        <React.Fragment key={`street-${x}-${y}`}>
          {/* Horizontal trail - from intersection (x,y) going right */}
          {cell.right !== null && (
            <div 
              className="absolute" 
              style={{ 
                top: y * CELL_SIZE, 
                left: x * CELL_SIZE, 
                width: CELL_SIZE + STREET_WIDTH, 
                height: STREET_WIDTH, 
                backgroundColor: 'transparent',
                borderTop: `${STREET_WIDTH}px dotted ${PLAYER_COLORS[cell.right]}`,
                zIndex: 5
              }}
            />
          )}
          
          {/* Vertical trail - from intersection (x,y) going down */}
          {cell.down !== null && (
            <div 
              className="absolute" 
              style={{ 
                top: y * CELL_SIZE, 
                left: x * CELL_SIZE, 
                width: STREET_WIDTH, 
                height: CELL_SIZE + STREET_WIDTH, 
                backgroundColor: 'transparent',
                borderLeft: `${STREET_WIDTH}px dotted ${PLAYER_COLORS[cell.down]}`,
                zIndex: 5
              }}
            />
          )}
        </React.Fragment>
      )))}

      {/* Powerups */}
      {powerups.map((p) => (
        <div 
          key={p.id} 
          className="absolute flex items-center justify-center transition-opacity duration-300" 
          style={{ 
            top: p.gridY * CELL_SIZE - 16, // Use gridY for positioning
            left: p.gridX * CELL_SIZE - 16, // Use gridX for positioning
            width: 32, 
            height: 32, 
            zIndex: 15, 
            opacity: p.life > 0 ? 1 : 0 
          }}
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg">
            {p.type === 'health' && <Heart className="w-5 h-5 text-red-500" />}
            {p.type === 'ammo' && <Gun className="w-5 h-5 text-gray-700" />}
            {p.type === 'shield' && <Shield className="w-5 h-5 text-cyan-500" />}
          </div>
        </div>
      ))}

      {/* Bullets */}
      {bullets.map(b => (
        <div 
          key={b.id} 
          className="absolute rounded-full" 
          style={{
            top: b.y - 5, 
            left: b.x - 5, 
            width: 10, 
            height: 10,
            backgroundColor: PLAYER_COLORS[b.ownerId], 
            border: '2px solid white',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)',
            zIndex: 25
          }}
        />
      ))}

      {/* Players */}
      {players.map(player => (
        player.health > 0 && (
          <div 
            key={player.id}
            className="absolute" // REMOVED transition classes
            style={{
              // REFACTORED: Use pixelX and pixelY for smooth positioning
              top: player.pixelY - PLAYER_SIZE / 2,
              left: player.pixelX - PLAYER_SIZE / 2,
              width: PLAYER_SIZE, 
              height: PLAYER_SIZE,
              backgroundColor: PLAYER_COLORS[player.id], 
              border: '4px solid black',
              borderRadius: '6px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.6), 0 0 0 2px white',
              zIndex: 20,
              // REMOVED transitionDuration, it's now handled by interpolation logic
              animation: player.hitAnimation > 0 ? 'blink 0.1s 5' : 'none',
            }}
          >
            {/* Shield effect */}
            {player.hasShield && (
              <div 
                className="absolute inset-[-10px] rounded-lg animate-pulse" 
                style={{
                  border: `5px solid ${PLAYER_COLORS[player.id]}`,
                  opacity: 0.8,
                  boxShadow: `0 0 20px ${PLAYER_COLORS[player.id]}`
                }}
              />
            )}
          </div>
        )
      ))}
    </div>
  );
};

export default GameGrid;