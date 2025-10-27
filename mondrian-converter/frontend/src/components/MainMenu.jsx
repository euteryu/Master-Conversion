// src/components/MainMenu.jsx
import React from 'react'; // No longer need useState here
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';

// Receive new props for audio control from App.js
const MainMenu = ({ stats, volume, setVolume, isMuted, setIsMuted }) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <style>{`
        /* --- (Existing styles are the same) --- */
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .title-font { font-family: 'Audiowide', sans-serif; }
        .body-font { font-family: 'Audiowide', sans-serif; }
        .accent-font { font-family: 'Audiowide', sans-serif; }
        
        @keyframes bounceAround {
          0% { transform: translate(0, 0); } 25% { transform: translate(80px, -30px); }
          50% { transform: translate(120px, 20px); } 75% { transform: translate(40px, 40px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes pdfCircleBounce {
          0% { transform: translate(0, 0); } 12.5% { transform: translate(45px, -25px); }
          25% { transform: translate(80px, 10px); } 37.5% { transform: translate(110px, -35px); }
          50% { transform: translate(85px, 20px); } 62.5% { transform: translate(35px, 35px); }
          75% { transform: translate(10px, -15px); } 87.5% { transform: translate(60px, 25px); }
          100% { transform: translate(0, 0); }
        }

        /* --- CSS FOR SETTINGS PANEL (updated to use volume prop) --- */
        .settings-container {
          background-color: white; border: 8px solid black; padding: 1rem;
          width: 100%; height: 100%; box-sizing: border-box;
          display: flex; flex-direction: column;
        }
        .settings-header {
          background-color: black; color: white; font-family: 'Audiowide', sans-serif;
          font-size: 1.5rem; text-align: center; padding: 0.5rem; letter-spacing: 2px;
          margin: -1rem -1rem 1.5rem -1rem; border-bottom: 8px solid black;
        }
        .volume-slider {
          -webkit-appearance: none; appearance: none; width: 100%; height: 12px;
          /* Dynamically set gradient based on volume prop */
          background: linear-gradient(to right, #0047AB 0%, #0047AB ${volume}%, #D21404 ${volume}%, #D21404 80%, #F7D002 80%, #F7D002 100%);
          outline: none; border: 2px solid black;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 24px; height: 24px;
          background: #D21404; cursor: pointer; border-radius: 50%; border: 2px solid black;
        }
        .language-select {
          width: 100%; background-color: black; color: white; font-family: 'Audiowide', sans-serif;
          border: 2px solid black; padding: 0.5rem; font-size: 1rem; margin-top: 0.5rem;
        }
      `}</style>

      <svg width="100%" height="100%" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <defs>
          <style>{`/* SVG-specific fonts */`}</style>
          <clipPath id="yellowBoxClip"><polygon points="80,120 650,180 620,450 60,380" /></clipPath>
          <clipPath id="blueBoxClip"><polygon points="610,280 1150,310 1140,480 600,450" /></clipPath>
        </defs>

        {/* --- (All existing polygons are the same) --- */}
        <polygon points="20,50 200,80 180,160 20,140" fill="#D21404" stroke="black" strokeWidth="8" className="cursor-pointer hover:brightness-110 transition-all"/>
        <polygon points="20,180 80,185 75,230 20,225" fill="#F7D002" stroke="black" strokeWidth="6" className="cursor-pointer hover:brightness-110 transition-all"/>
        <polygon points="20,550 680,580 650,750 20,720" fill="#D21404" stroke="black" strokeWidth="10" className="cursor-pointer hover:brightness-110 transition-all"/>
        <g transform="translate(60, 620) rotate(2.5)">
          <text x="0" y="0" fontSize="32" fontWeight="bold" fill="white" className="title-font">MONDRIAN CONVERTER</text>
          <text x="0" y="40" fontSize="20" fill="white" className="body-font">Launches: {stats.usage_count}</text>
          <text x="0" y="65" fontSize="16" fill="white" opacity="0.9" className="body-font">Last: {stats.last_opened}</text>
        </g>
        <polygon points="80,120 650,180 620,450 60,380" fill="#F7D002" stroke="black" strokeWidth="12" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/pdf-to-ppt')}/>
        
        {/* --- BOUNCING CIRCLE RESTORED --- */}
        <g clipPath="url(#yellowBoxClip)">
          <g transform="translate(200, 220) rotate(5)">
            <g style={{animation: 'pdfCircleBounce 12s ease-in-out infinite'}}>
              <circle cx="80" cy="8" r="45" fill="black" opacity="0.25"/>
              <path d="M 80 -12 L 80 23 M 70 -2 L 80 -12 L 90 -2" stroke="white" strokeWidth="4" fill="none"/>
            </g>
          </g>
        </g>

        <g transform="translate(200, 220) rotate(5)" className="pointer-events-none"><text x="0" y="80" fontSize="52" fontWeight="bold" fill="black" className="title-font">PDF TO PPT</text><text x="45" y="120" fontSize="24" fill="black" className="body-font">CONVERTER</text></g>
        <polygon points="320,90 480,100 475,145 315,135" fill="#0047AB" stroke="black" strokeWidth="8"/>
        <polygon points="500,105 900,120 885,195 490,175" fill="#D21404" stroke="black" strokeWidth="10" className="cursor-pointer hover:brightness-110 transition-all"/>
        <g transform="translate(640, 148) rotate(1.2)"><text x="0" y="0" fontSize="22" fontWeight="bold" fill="white" className="accent-font">SETTINGS</text></g>
        <polygon points="950,90 1380,85 1100,200" fill="#F7D002" stroke="black" strokeWidth="8"/>
        <polygon points="610,280 1150,310 1140,480 600,450" fill="#0047AB" stroke="black" strokeWidth="12" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/media-machine')}/>
        <g clipPath="url(#blueBoxClip)"><g style={{animation: 'bounceAround 8s ease-in-out infinite'}}><circle cx="875" cy="380" r="35" fill="white" opacity="0.4"/><path d="M 875 360 L 875 395 M 865 370 L 875 360 L 885 370" stroke="black" strokeWidth="3" fill="none" opacity="0.8"/></g></g>
        <g transform="translate(800, 370) rotate(1.5)" className="pointer-events-none"><text x="-95" y="5" fontSize="28" fontWeight="bold" fill="white" className="accent-font">VIDEO</text><text x="-135" y="40" fontSize="28" fontWeight="bold" fill="white" className="accent-font">DOWNLOADER</text></g>
        <polygon points="950,220 1380,200 1380,650 940,620" fill="#F5F5F0" stroke="black" strokeWidth="10"/>
        
        {/* --- SETTINGS PANEL WIRED UP TO PROPS --- */}
        <foreignObject x="970" y="240" width="380" height="350">
          <div xmlns="http://www.w3.org/1999/xhtml" className="settings-container">
            <div className="settings-header">SETTINGS</div>
            <div className="settings-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ fontFamily: 'Audiowide', color: 'black' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={24} style={{cursor: 'pointer'}} onClick={() => setIsMuted(false)} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume} // Show 0 when muted
                    onChange={(e) => {
                        setVolume(e.target.value);
                        if (e.target.value > 0) setIsMuted(false);
                    }}
                    className="volume-slider"
                  />
                  <VolumeX size={24} style={{cursor: 'pointer'}} onClick={() => setIsMuted(true)} />
                </div>
                <div style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem', letterSpacing: '1px' }}>
                  background music
                </div>
              </div>
              <div style={{ fontFamily: 'Audiowide', color: 'black' }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Language:</label>
                <select
                  // Language state is local for now as it doesn't need to be global
                  onChange={(e) => { /* Logic here if needed */ }}
                  className="language-select"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>
          </div>
        </foreignObject>

        <polygon points="780,630 1380,670 1380,780 850,750" fill="#F7D002" stroke="black" strokeWidth="10"/>
        <polygon points="650,480 940,495 850,750 640,730" fill="#F5F5F0" stroke="black" strokeWidth="8"/>
        
        <g onClick={() => window.close()} className="cursor-pointer hover:opacity-80 transition-all">
          <rect x="1300" y="30" width="70" height="70" fill="#D21404" stroke="black" strokeWidth="5"/>
          <line x1="1320" y1="50" x2="1350" y2="80" stroke="white" strokeWidth="4"/>
          <line x1="1350" y1="50" x2="1320" y2="80" stroke="white" strokeWidth="4"/>
        </g>
      </svg>
    </div>
  );
};

export default MainMenu;