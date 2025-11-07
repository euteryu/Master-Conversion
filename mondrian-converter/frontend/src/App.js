// src/App.js
import React, { useState, useEffect, useRef } from 'react';
// 1. Import useLocation from react-router-dom
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainMenu from './components/MainMenu';
import PdfToPptConverter from './components/converters/PdfToPptConverter';
import VideoDownloader from './components/converters/VideoDownloader';
import YoutubeDownloader from './components/converters/YoutubeDownloader';
import VideoConverter from './components/converters/VideoConverter';
import TextToSpeechConverter from './components/converters/TextToSpeechConverter';
import SliderConverter from './components/converters/SliderConverter';
import AboutPage from './components/AboutPage';
import ShapeGangWars from './components/game/ShapeGangWars';
import { statsService } from './services/statsService';

// We create a separate component for the content to gain access to the useLocation hook,
// as hooks can only be used inside a component that is a child of the Router.
const AppContent = () => {
  const [stats, setStats] = useState({ usage_count: 0, last_opened: 'Never' });
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState('en');
  
  // 2. Get the current location
  const location = useLocation();

  useEffect(() => {
    statsService.incrementUsage()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  // 3. This is the new, combined effect for audio control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Apply volume and mute settings
      audio.volume = isMuted ? 0 : volume / 100;

      // Decide whether to play or pause based on the current route
      if (location.pathname === '/shape-gang-wars') {
        // If we are on the game page, pause the menu music.
        audio.pause();
      } else {
        // On any other page, try to play the menu music.
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Audio autoplay was prevented. User interaction needed."));
        }
      }
    }
  }, [volume, isMuted, location.pathname]); // It runs when volume, mute, OR the path changes.

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
  };
  
  return (
    <>
      {/* Ensure the audio tag has the correct path. It should be relative to the public folder. */}
      {/* For example, if your music is in public/sounds/, it would be "sounds/background.mp3" */}
      <audio ref={audioRef} src="music/background.mp3" loop />
      <Routes>
        <Route 
          path="/" 
          element={<MainMenu 
            stats={stats} 
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            language={language}
            onLanguageChange={handleLanguageChange}
          />} 
        />
        <Route path="/pdf-to-ppt" element={<PdfToPptConverter />} />
        <Route path="/text-to-speech" element={<TextToSpeechConverter />} />
        <Route path="/media-machine" element={<VideoDownloader />} />
        <Route path="/media-machine/convert-media" element={<VideoConverter />} /> 
        <Route path="/media-machine/download-youtube" element={<YoutubeDownloader />} />
        <Route path="/slider" element={<SliderConverter />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/shape-gang-wars" element={<ShapeGangWars />} />
      </Routes>
    </>
  );
}

// The main App component now just sets up the Router
function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;