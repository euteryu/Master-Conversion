// src/components/MainMenu.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Settings, X } from 'lucide-react';

const MainMenu = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:wght@700&family=Oswald:wght@600&display=swap');
        .title-font { font-family: 'Bebas Neue', sans-serif; }
        .body-font { font-family: 'Roboto Condensed', sans-serif; }
        .accent-font { font-family: 'Oswald', sans-serif; }
      `}</style>

      {/* SVG canvas with perspective grid */}
      <svg width="100%" height="100%" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <defs>
          <style>
            {`
              .title-font { font-family: 'Bebas Neue', sans-serif; }
              .body-font { font-family: 'Roboto Condensed', sans-serif; }
              .accent-font { font-family: 'Oswald', sans-serif; }
            `}
          </style>
        </defs>

        {/* Small red top left */}
        <polygon 
          points="20,50 200,80 180,160 20,140" 
          fill="#D21404" 
          stroke="black" 
          strokeWidth="8"
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Tiny yellow square left */}
        <polygon 
          points="20,180 80,185 75,230 20,225" 
          fill="#F7D002" 
          stroke="black" 
          strokeWidth="6"
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Large red bottom left - Stats */}
        <polygon 
          points="20,550 680,580 650,750 20,720" 
          fill="#D21404" 
          stroke="black" 
          strokeWidth="10"
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        <g transform="translate(60, 620) rotate(2.5)">
          <text x="0" y="0" fontSize="32" fontWeight="bold" fill="white" className="title-font">MONDRIAN CONVERTER</text>
          <text x="0" y="40" fontSize="20" fill="white" className="body-font">Launches: {stats.usage_count}</text>
          <text x="0" y="65" fontSize="16" fill="white" opacity="0.9" className="body-font">Last: {stats.last_opened}</text>
        </g>
        
        {/* Large yellow - PDF to PPT (MAIN BUTTON) */}
        <polygon 
          points="80,120 650,180 620,450 60,380" 
          fill="#F7D002" 
          stroke="black" 
          strokeWidth="12"
          className="cursor-pointer hover:brightness-110 transition-all"
          onClick={() => navigate('/pdf-to-ppt')}
        />
        <g transform="translate(200, 220) rotate(5)" className="pointer-events-none">
          <circle cx="80" cy="0" r="45" fill="black" opacity="0.85"/>
          <path d="M 80 -20 L 80 15 M 70 -10 L 80 -20 L 90 -10" stroke="white" strokeWidth="4" fill="none"/>
          <text x="0" y="80" fontSize="52" fontWeight="bold" fill="black" className="title-font">PDF TO PPT</text>
          <text x="45" y="120" fontSize="24" fill="black" className="body-font">CONVERTER</text>
        </g>
        
        {/* Small blue top center */}
        <polygon 
          points="320,90 480,100 475,145 315,135" 
          fill="#0047AB" 
          stroke="black" 
          strokeWidth="8"
        />
        
        {/* Red horizontal top right */}
        <polygon 
          points="500,105 900,120 885,195 490,175" 
          fill="#D21404" 
          stroke="black" 
          strokeWidth="10"
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        <g transform="translate(640, 148) rotate(1.2)">
          <text x="0" y="0" fontSize="22" fontWeight="bold" fill="white" className="accent-font">SETTINGS</text>
        </g>
        
        {/* Yellow triangle top right corner */}
        <polygon 
          points="950,90 1380,85 1100,200" 
          fill="#F7D002" 
          stroke="black" 
          strokeWidth="8"
        />
        
        {/* Large blue center */}
        <polygon 
          points="610,280 1150,310 1140,480 600,450" 
          fill="#0047AB" 
          stroke="black" 
          strokeWidth="12"
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        <g transform="translate(820, 370) rotate(1.5)" className="pointer-events-none">
          <circle cx="0" cy="0" r="38" fill="white" opacity="0.3"/>
          <text x="-80" y="50" fontSize="26" fontWeight="bold" fill="white" className="accent-font">COMING SOON</text>
        </g>
        
        {/* Large cream/white right side */}
        <polygon 
          points="950,220 1380,200 1380,650 940,620" 
          fill="#F5F5F0" 
          stroke="black" 
          strokeWidth="10"
        />
        <g transform="translate(1080, 420) rotate(-1.5)">
          <text x="0" y="0" fontSize="18" fill="gray" opacity="0.5" className="body-font">FUTURE TOOLS</text>
        </g>
        
        {/* Yellow triangle bottom right */}
        <polygon 
          points="780,630 1380,670 1380,780 850,750" 
          fill="#F7D002" 
          stroke="black" 
          strokeWidth="10"
        />
        
        {/* White section bottom center */}
        <polygon 
          points="650,480 940,495 850,750 640,730" 
          fill="#F5F5F0" 
          stroke="black" 
          strokeWidth="8"
        />
        
        {/* Close button */}
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