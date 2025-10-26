// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import PdfToPptConverter from './components/converters/PdfToPptConverter';
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
        
        {/* Add more routes here for future converters */}
        {/* <Route path="/image-compressor" element={<ImageCompressor />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;