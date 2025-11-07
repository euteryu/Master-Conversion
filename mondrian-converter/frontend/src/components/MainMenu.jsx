// src/components/MainMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX } from 'lucide-react';

const MainMenu = ({ stats, volume, setVolume, isMuted, setIsMuted, language, onLanguageChange }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State for typewriter effect
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = ['PDF TO PPT', 'PPT TO PDF'];

  // --- MODIFIED: State for the GEOMETRIC secret question mark ---
  const [showSecret, setShowSecret] = useState(false);
  const [secretPos, setSecretPos] = useState({ x: 0, y: 0 });
  const mondrianColors = ['#D21404', '#0047AB', '#F7D002', '#FFFFFF', '#000000'];
  // We need 5 parts for our geometric question mark
  const [qMarkColors, setQMarkColors] = useState(Array(5).fill('#FFFFFF'));

  // useEffect for the typewriter animation
  useEffect(() => {
    const typingSpeed = 150;
    const deletingSpeed = 75;
    const pauseDuration = 2000;
    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        setDisplayedText(currentPhrase.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
      }
      if (!isDeleting && displayedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      }
    };
    const typingTimeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, phraseIndex, phrases]);

  // --- MODIFIED: useEffect for the multi-color-changing effect ---
  useEffect(() => {
    let interval;
    if (showSecret) {
      interval = setInterval(() => {
        // Create a new array of 5 random colors
        const newColors = Array(5).fill(null).map(() => 
          mondrianColors[Math.floor(Math.random() * mondrianColors.length)]
        );
        setQMarkColors(newColors);
      }, 500); // Change colors every half a second
    }
    return () => clearInterval(interval);
  }, [showSecret]);


  return (
    <div className="relative h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      {/* --- MODIFIED: The Geometric Question Mark Component --- */}
      <div 
        className="absolute pointer-events-none transition-transform duration-200 ease-out"
        style={{
          left: secretPos.x,
          top: secretPos.y,
          transform: `translate(-50%, -50%) scale(${showSecret ? 1 : 0})`,
          zIndex: 100,
          width: '60px', // Container width
          height: '100px' // Container height
        }}
      >
        {/* Geometric parts of the question mark, positioned absolutely within the container */}
        <div className="absolute w-full h-1/4 top-0" style={{ backgroundColor: qMarkColors[0], transition: 'background-color 0.4s' }}></div>
        <div className="absolute w-1/3 h-1/2 top-1/4 right-0" style={{ backgroundColor: qMarkColors[1], transition: 'background-color 0.4s' }}></div>
        <div className="absolute w-full h-1/4 top-1/2" style={{ backgroundColor: qMarkColors[2], transition: 'background-color 0.4s' }}></div>
        <div className="absolute w-1/3 h-1/4 top-1/4 left-0" style={{ backgroundColor: qMarkColors[3], transition: 'background-color 0.4s' }}></div>
        <div className="absolute w-1/3 h-1/4 bottom-0 left-1/3" style={{ backgroundColor: qMarkColors[4], transition: 'background-color 0.4s' }}></div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .title-font { font-family: 'Audiowide', sans-serif; }
        .body-font { font-family: 'Audiowide', sans-serif; }
        .accent-font { font-family: 'Audiowide', sans-serif; }
        @keyframes bounceAround { 0% { transform: translate(0, 0); } 25% { transform: translate(80px, -30px); } 50% { transform: translate(120px, 20px); } 75% { transform: translate(40px, 40px); } 100% { transform: translate(0, 0); } }
        @keyframes pdfCircleBounce { 0% { transform: translate(0, 0); } 12.5% { transform: translate(45px, -25px); } 25% { transform: translate(80px, 10px); } 37.5% { transform: translate(110px, -35px); } 50% { transform: translate(85px, 20px); } 62.5% { transform: translate(35px, 35px); } 75% { transform: translate(10px, -15px); } 87.5% { transform: translate(60px, 25px); } 100% { transform: translate(0, 0); } }
        .settings-container { background-color: white; border: 8px solid black; padding: 1rem; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; }
        .settings-header { background-color: black; color: white; font-family: 'Audiowide', sans-serif; font-size: 1.5rem; text-align: center; padding: 0.5rem; letter-spacing: 2px; margin: -1rem -1rem 1.5rem -1rem; border-bottom: 8px solid black; }
        .volume-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 12px; background: linear-gradient(to right, #0047AB 0%, #0047AB ${volume}%, #D21404 ${volume}%, #D21404 80%, #F7D002 80%, #F7D002 100%); outline: none; border: 2px solid black; }
        .volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: #D21404; cursor: pointer; border-radius: 50%; border: 2px solid black; }
        .language-select { width: 100%; background-color: black; color: white; font-family: 'Audiowide', sans-serif; border: 2px solid black; padding: 0.5rem; font-size: 1rem; margin-top: 0.5rem; }
        .typewriter-text { display: inline-block; min-height: 60px; }
        .blinking-cursor { animation: blink 1s step-end infinite; font-weight: bold; }
        @keyframes blink { from, to { color: transparent; } 50% { color: black; } }
      `}</style>
      <svg width="100%" height="100%" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <defs>
          <clipPath id="yellowBoxClip"><polygon points="80,120 650,180 620,450 60,380" /></clipPath>
          <clipPath id="blueBoxClip"><polygon points="610,280 1150,310 1140,480 600,450" /></clipPath>
          <clipPath id="ttsRedBoxClip"><polygon points="500,105 900,120 885,195 490,175" /></clipPath>
          <clipPath id="sliderYellowBoxClip"><polygon points="780,630 1380,670 1380,780 850,750" /></clipPath>
        </defs>

        <polygon points="20,50 200,80 180,160 20,140" fill="#D21404" stroke="black" strokeWidth="8" className="cursor-pointer hover:brightness-110 transition-all"/>
        <polygon points="20,180 80,185 75,230 20,225" fill="#F7D002" stroke="black" strokeWidth="6" className="cursor-pointer hover:brightness-110 transition-all"/>
        <polygon points="20,550 680,580 650,750 20,720" fill="#D21404" stroke="black" strokeWidth="10" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/about')} />
        <g transform="translate(60, 620) rotate(2.5)" className="pointer-events-none">
          <text x="0" y="0" fontSize="32" fontWeight="bold" fill="white" className="title-font">{t('mainMenu.title')}</text>
          <text x="0" y="40" fontSize="20" fill="white" className="body-font">{t('mainMenu.launches', { count: stats.usage_count })}</text>
          <text x="0" y="65" fontSize="16" fill="white" opacity="0.9" className="body-font">{t('mainMenu.lastOpened', { date: stats.last_opened })}</text>
        </g>
        
        <polygon points="80,120 650,180 620,450 60,380" fill="#F7D002" stroke="black" strokeWidth="12" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/pdf-to-ppt')}/>
        <g clipPath="url(#yellowBoxClip)" className="pointer-events-none">
            <g transform="translate(200, 220) rotate(5)">
                <g style={{animation: 'pdfCircleBounce 12s ease-in-out infinite'}}>
                    <circle cx="80" cy="8" r="45" fill="black" opacity="0.25"/>
                    <path d="M 80 -12 L 80 23 M 70 -2 L 80 -12 L 90 -2" stroke="white" strokeWidth="4" fill="none"/>
                </g>
            </g>
        </g>
        <g transform="translate(200, 220) rotate(5)" className="pointer-events-none">
          <foreignObject x="-20" y="40" width="400" height="70">
            <div xmlns="http://www.w3.org/1999/xhtml" className="title-font typewriter-text" style={{ fontSize: '52px', fontWeight: 'bold', color: 'black' }}>
              <span>{displayedText}</span>
              <span className="blinking-cursor">|</span>
            </div>
          </foreignObject>
          <text x="45" y="120" fontSize="24" fill="black" className="body-font">{t('mainMenu.converter')}</text>
        </g>
        
        <polygon points="320,90 480,100 475,145 315,135" fill="#0047AB" stroke="black" strokeWidth="8"/>
        
        <polygon points="500,105 900,120 885,195 490,175" fill="#D21404" stroke="black" strokeWidth="10" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/text-to-speech')} />
        <g clipPath="url(#ttsRedBoxClip)" className="pointer-events-none">
            <g style={{animation: 'bounceAround 10s ease-in-out infinite reverse'}}>
                <circle cx="600" cy="150" r="25" fill="#FF6347" opacity="0.8"/>
                <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round">
                  <path d="M 595 145 Q 600 150 595 155" />
                  <path d="M 601 140 Q 606 150 601 160" />
                  <path d="M 607 135 Q 612 150 607 165" />
                </g>
            </g>
        </g>
        <g transform="translate(650, 155) rotate(1.2)" className="pointer-events-none">
          <text x="0" y="0" fontSize="36" fontWeight="bold" fill="white" className="accent-font">TTS</text>
        </g>

        <polygon points="950,90 1380,85 1100,200" fill="#F7D002" stroke="black" strokeWidth="8"/>
        <polygon points="610,280 1150,310 1140,480 600,450" fill="#0047AB" stroke="black" strokeWidth="12" className="cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate('/media-machine')}/>
        <g clipPath="url(#blueBoxClip)" className="pointer-events-none">
            <g style={{animation: 'bounceAround 8s ease-in-out infinite'}}>
                <circle cx="875" cy="380" r="35" fill="white" opacity="0.4"/>
                <polygon points="868,368 888,380 868,392" fill="black" opacity="0.8" />
            </g>
        </g>
        <g transform="translate(800, 370) rotate(1.5)" className="pointer-events-none"><text x="-95" y="5" fontSize="28" fontWeight="bold" fill="white" className="accent-font">VIDEO</text><text x="-135" y="40" fontSize="28" fontWeight="bold" fill="white" className="accent-font">{t('mainMenu.videoDownloader').split(' ')[1]}</text></g>
        
        <polygon points="950,220 1380,200 1380,650 940,620" fill="#F5F5F0" stroke="black" strokeWidth="10"/>
        <foreignObject x="970" y="240" width="380" height="350">
          <div xmlns="http://www.w3.org/1999/xhtml" className="settings-container">
            <div className="settings-header">{t('mainMenu.settings.title')}</div>
            <div className="settings-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ fontFamily: 'Audiowide', color: 'black' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={24} style={{cursor: 'pointer'}} onClick={() => setIsMuted(false)} />
                  <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(e.target.value); if (e.target.value > 0) setIsMuted(false); }} className="volume-slider"/>
                  <VolumeX size={24} style={{cursor: 'pointer'}} onClick={() => setIsMuted(true)} />
                </div>
                <div style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem', letterSpacing: '1px' }}>{t('mainMenu.settings.music')}</div>
              </div>
              <div style={{ fontFamily: 'Audiowide', color: 'black' }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{t('mainMenu.settings.language')}</label>
                <select value={language} onChange={(e) => onLanguageChange(e.target.value)} className="language-select">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="ko">Korean</option>
                </select>
              </div>
            </div>
          </div>
        </foreignObject>
        
        <polygon 
            points="780,630 1380,670 1380,780 850,750" 
            fill="#F7D002" 
            stroke="black" 
            strokeWidth="10" 
            className="cursor-pointer hover:brightness-110 transition-all" 
            onClick={() => navigate('/slider')}
        />
        <g clipPath="url(#sliderYellowBoxClip)" className="pointer-events-none">
            <g transform="translate(900, 620)">
                <g style={{animation: 'bounceAround 11s ease-in-out infinite'}}>
                    <circle cx="100" cy="80" r="40" fill="black" opacity="0.2"/>
                    <g fill="white" transform="translate(100, 80) scale(0.8)">
                      <path d="M 0 -15 L 4 -4 L 15 0 L 4 4 L 0 15 L -4 4 L -15 0 L -4 -4 Z" />
                      <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" opacity="0.7" transform="rotate(45)" />
                    </g>
                </g>
            </g>
        </g>
        <g transform="translate(970, 710) rotate(-2)" className="pointer-events-none">
            <text x="0" y="0" fontSize="48" fontWeight="bold" fill="black" className="title-font">{t('mainMenu.slider', 'Slider')}</text>
        </g>

        <polygon 
          points="650,480 940,495 850,750 640,730" 
          fill="#F5F5F0" 
          stroke="black" 
          strokeWidth="8"
          className="cursor-pointer"
          onMouseEnter={() => setShowSecret(true)}
          onMouseLeave={() => setShowSecret(false)}
          onMouseMove={(e) => setSecretPos({ x: e.clientX, y: e.clientY })}
          onClick={() => navigate('/shape-gang-wars')}
        />
        <g onClick={() => window.close()} className="cursor-pointer hover:opacity-80 transition-all"><rect x="1300" y="30" width="70" height="70" fill="#D21404" stroke="black" strokeWidth="5"/><line x1="1320" y1="50" x2="1350" y2="80" stroke="white" strokeWidth="4"/><line x1="1350" y1="50" x2="1320" y2="80" stroke="white" strokeWidth="4"/></g>
      </svg>
    </div>
  );
};

export default MainMenu;