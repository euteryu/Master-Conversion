// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import PdfToPptConverter from './components/converters/PdfToPptConverter';
import VideoDownloader from './components/converters/VideoDownloader';
import YoutubeDownloader from './components/converters/YoutubeDownloader';
import { statsService } from './services/statsService';

function App() {
  const [stats, setStats] = useState({ usage_count: 0, last_opened: 'Never' });

  useEffect(() => {
    statsService.incrementUsage()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Menu Route */}
        <Route path="/" element={<MainMenu stats={stats} />} />
        
        {/* PDF to PPT Converter Route */}
        <Route path="/pdf-to-ppt" element={<PdfToPptConverter />} />
        
        {/* Media Machine Routes */}
        <Route path="/media-machine" element={<VideoDownloader />} />
        <Route path="/media-machine/convert-media" element={<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '2rem', fontFamily: 'Audiowide, sans-serif'}}>Convert Media - Coming Soon</div>} />
        {/* Updated route to use the new component */}
        <Route path="/media-machine/download-youtube" element={<YoutubeDownloader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;