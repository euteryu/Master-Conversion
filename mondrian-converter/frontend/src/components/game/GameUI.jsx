// src/components/game/GameUI.jsx
import React from 'react';
import { Heart, Shield, Target } from 'lucide-react';

const PLAYER_COLORS = { 0: '#3B82F6', 1: '#D21404', 2: '#22C55E', 3: '#F7D002' };
const PLAYER_NAMES = { 0: 'P1', 1: 'P2', 2: 'P3', 3: 'P4' };

const GameUI = ({ players, timer, scores, gridWidth }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (!players || players.length === 0) {
    return (
      <div 
        className="w-full flex justify-center items-center bg-gray-800 p-2 border-4 border-gray-700 text-white mondrian-font mb-4 text-4xl"
        style={{ width: gridWidth, height: '84px' }}
      >
        LOADING...
      </div>
    );
  }

  return (
    <div 
      className="w-full flex justify-between items-stretch bg-black border-8 border-black text-white mondrian-font mb-0"
      style={{ width: gridWidth, minHeight: "100px", boxSizing: "border-box" }}
    >
      {/* Left side - P1 and P2 with colored backgrounds */}
      <div className="flex flex-col flex-1 border-r-4 border-black">
        {players.slice(0, 2).map((p, idx) => (
          <div 
            key={p.id} 
            className={`flex items-center justify-between px-4 py-3 ${idx === 0 ? 'border-b-4 border-black' : ''}`}
            style={{ 
              backgroundColor: p.health > 0 ? PLAYER_COLORS[p.id] : '#1f2937',
              opacity: p.health > 0 ? 1 : 0.4,
              flex: 1
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-2xl text-black drop-shadow-lg">{PLAYER_NAMES[p.id]}</span>
              <div className="flex gap-1">
                {Array.from({ length: p.health }).map((_, i) => (
                  <Heart key={i} size={18} fill="#D21404" stroke="black" />
                ))}
              </div>
              {p.hasShield && (
                <div className="bg-black rounded-full p-1">
                  <Shield size={18} className="text-cyan-400" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl text-black bg-white px-3 py-1 border-2 border-black flex items-center gap-1">
                {p.ammo}
                <Target size={16} />
              </span>
              <span className="font-bold text-3xl text-black drop-shadow-lg">
                {scores[p.id]}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Center - Timer with bold Mondrian styling */}
      <div 
        className="flex items-center justify-center border-x-4 border-black"
        style={{ 
          minWidth: '180px',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="text-6xl font-bold text-black tracking-wider">
          {formatTime(timer)}
        </div>
      </div>
      
      {/* Right side - P3 and P4 with colored backgrounds */}
      <div className="flex flex-col flex-1 border-l-4 border-black">
        {players.slice(2, 4).map((p, idx) => (
          <div 
            key={p.id} 
            className={`flex items-center justify-between px-4 py-3 ${idx === 0 ? 'border-b-4 border-black' : ''}`}
            style={{ 
              backgroundColor: p.health > 0 ? PLAYER_COLORS[p.id] : '#1f2937',
              opacity: p.health > 0 ? 1 : 0.4,
              flex: 1
            }}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-3xl text-black drop-shadow-lg">
                {scores[p.id]}
              </span>
              <span className="font-bold text-xl text-black bg-white px-3 py-1 border-2 border-black flex items-center gap-1">
                {p.ammo}
                <Target size={16} />
              </span>
            </div>
            <div className="flex items-center gap-3">
              {p.hasShield && (
                <div className="bg-black rounded-full p-1">
                  <Shield size={18} className="text-cyan-400" />
                </div>
              )}
              <div className="flex gap-1">
                {Array.from({ length: p.health }).map((_, i) => (
                  <Heart key={i} size={18} fill="#D21404" stroke="black" />
                ))}
              </div>
              <span className="font-bold text-2xl text-black drop-shadow-lg">{PLAYER_NAMES[p.id]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameUI;