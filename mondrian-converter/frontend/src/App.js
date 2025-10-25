import React, { useState, useEffect } from 'react';
import { Upload, X, ArrowLeft, Settings, Download } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const MondrianConverter = () => {
  const [currentView, setCurrentView] = useState('main');
  const [stats, setStats] = useState({ usage_count: 0, last_opened: 'Never' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionId, setConversionId] = useState(null);
  const [outputFilename, setOutputFilename] = useState(null);
  const [error, setError] = useState(null);
  const [fromFormat, setFromFormat] = useState('PDF');
  const [toFormat, setToFormat] = useState('PPT');
  const [mode, setMode] = useState('hybrid');
  const [quality, setQuality] = useState('good');

  useEffect(() => {
    fetch(`${API_URL}/stats/increment`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  useEffect(() => {
    if (conversionId && converting) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/conversion/${conversionId}`);
          const data = await response.json();
          
          if (data.total > 0) {
            setProgress(Math.round((data.progress / data.total) * 100));
          }
          
          if (data.status === 'completed') {
            setConverting(false);
            setOutputFilename(data.output_file);
            clearInterval(interval);
          } else if (data.status === 'error') {
            setConverting(false);
            setError(data.error || 'Conversion failed');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to get conversion status:', err);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [conversionId, converting]);

  const MainView = () => (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      {/* SVG canvas with perspective grid */}
      <svg width="100%" height="100%" viewBox="0 0 1400 800" className="max-w-[95vw] max-h-[90vh]">
        {/* Define the perspective grid with trapezoids */}
        
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
        
        {/* Large red bottom left */}
        <polygon 
          points="20,550 680,580 650,750 20,720" 
          fill="#D21404" 
          stroke="black" 
          strokeWidth="10"
          className="cursor-pointer hover:brightness-110 transition-all"
        >
          <title>Stats Panel</title>
        </polygon>
        <text x="60" y="640" fontSize="28" fontWeight="bold" fill="white">Mondrian Converter</text>
        <text x="60" y="675" fontSize="18" fill="white">Launches: {stats.usage_count}</text>
        <text x="60" y="700" fontSize="14" fill="white">Last: {stats.last_opened}</text>
        
        {/* Large yellow - PDF to PPT (MAIN BUTTON) */}
        <polygon 
          points="80,120 650,180 620,450 60,380" 
          fill="#F7D002" 
          stroke="black" 
          strokeWidth="12"
          className="cursor-pointer hover:brightness-110 transition-all"
          onClick={() => setCurrentView('converter')}
        />
        <g className="pointer-events-none">
          <circle cx="280" cy="240" r="40" fill="black" opacity="0.8"/>
          <path d="M 280 220 L 280 250 M 270 230 L 280 220 L 290 230" stroke="white" strokeWidth="3" fill="none"/>
          <text x="200" y="310" fontSize="42" fontWeight="bold" fill="black">PDF to PPT</text>
          <text x="245" y="345" fontSize="20" fill="black">Converter</text>
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
        <text x="640" y="160" fontSize="18" fontWeight="bold" fill="white">Settings</text>
        
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
        <g className="pointer-events-none">
          <circle cx="850" cy="380" r="35" fill="white" opacity="0.3"/>
          <text x="770" y="425" fontSize="22" fontWeight="bold" fill="white">Coming Soon</text>
        </g>
        
        {/* Large cream/white right side */}
        <polygon 
          points="950,220 1380,200 1380,650 940,620" 
          fill="#F5F5F0" 
          stroke="black" 
          strokeWidth="10"
        />
        <text x="1080" y="430" fontSize="16" fill="gray" opacity="0.5">Future Tools</text>
        
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
        <g onClick={() => alert('Close application')} className="cursor-pointer hover:opacity-80 transition-all">
          <rect x="1300" y="30" width="70" height="70" fill="#D21404" stroke="black" strokeWidth="5"/>
          <line x1="1320" y1="50" x2="1350" y2="80" stroke="white" strokeWidth="4"/>
          <line x1="1350" y1="50" x2="1320" y2="80" stroke="white" strokeWidth="4"/>
        </g>
      </svg>
    </div>
  );

  const ConverterView = () => {
    const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setError(null);
        setOutputFilename(null);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          
          if (data.success) {
            setUploadedFilename(data.filename);
          } else {
            setError(data.error || 'Upload failed');
          }
        } catch (err) {
          setError('Failed to upload file: ' + err.message);
        }
      }
    };

    const startConversion = async () => {
      if (!uploadedFilename) {
        setError('Please select a file first');
        return;
      }
      
      setConverting(true);
      setProgress(0);
      setError(null);
      setOutputFilename(null);
      
      try {
        const response = await fetch(`${API_URL}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadedFilename,
            from_format: fromFormat,
            to_format: toFormat,
            mode: mode,
            quality: quality
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setConversionId(data.conversion_id);
        } else {
          setError(data.error || 'Conversion failed to start');
          setConverting(false);
        }
      } catch (err) {
        setError('Failed to start conversion: ' + err.message);
        setConverting(false);
      }
    };

    const downloadFile = () => {
      if (outputFilename) {
        window.open(`${API_URL}/download/${outputFilename}`, '_blank');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
        <button
          onClick={() => setCurrentView('main')}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Main Menu
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border-4 border-black">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">FROM</label>
                <select 
                  value={fromFormat}
                  onChange={(e) => setFromFormat(e.target.value)}
                  disabled={converting}
                  className="w-full bg-gray-700 border-2 border-yellow-500 rounded px-4 py-3 text-white font-bold"
                >
                  <option>PDF</option>
                  <option>PPT</option>
                  <option>DOC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">TO</label>
                <select
                  value={toFormat}
                  onChange={(e) => setToFormat(e.target.value)}
                  disabled={converting}
                  className="w-full bg-gray-700 border-2 border-blue-500 rounded px-4 py-3 text-white font-bold"
                >
                  <option>PPT</option>
                  <option>PDF</option>
                  <option>DOC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border-4 border-black">
            <label className="block mb-4">
              <span className="text-lg font-bold text-red-400 mb-2 block">Select File</span>
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={converting}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-3 file:px-6
                  file:rounded file:border-0
                  file:text-sm file:font-bold
                  file:bg-red-600 file:text-white
                  hover:file:bg-red-700 file:cursor-pointer
                  disabled:opacity-50"
              />
            </label>
            {selectedFile && (
              <p className="text-green-400 mt-2">✓ Selected: {selectedFile.name}</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border-4 border-black">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Conversion Options</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Mode:</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('hybrid')}
                  disabled={converting}
                  className={`flex-1 py-3 px-4 rounded font-bold transition-colors disabled:opacity-50 ${
                    mode === 'hybrid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Hybrid (Editable)
                </button>
                <button
                  onClick={() => setMode('image')}
                  disabled={converting}
                  className={`flex-1 py-3 px-4 rounded font-bold transition-colors disabled:opacity-50 ${
                    mode === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Image Only
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Quality:</label>
              <div className="flex gap-4">
                {[
                  { label: 'Fast', value: 'fast' },
                  { label: 'Good', value: 'good' },
                  { label: 'High', value: 'high' }
                ].map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    disabled={converting}
                    className={`flex-1 py-3 px-4 rounded font-bold transition-colors disabled:opacity-50 ${
                      quality === q.value ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startConversion}
            disabled={!selectedFile || converting}
            className={`w-full py-6 text-2xl font-bold rounded-lg transition-all ${
              !selectedFile || converting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-2xl'
            }`}
          >
            {converting ? 'Converting...' : 'Convert'}
          </button>

          {converting && (
            <div className="mt-6">
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border-2 border-black">
                <div
                  className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center mt-2 text-blue-400">Processing: {progress}%</p>
            </div>
          )}

          {outputFilename && !converting && (
            <div className="mt-6 p-4 bg-green-900 border-4 border-green-500 rounded">
              <p className="text-green-300 font-bold text-lg text-center mb-4">✓ Conversion Complete!</p>
              <button
                onClick={downloadFile}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download {outputFilename}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900 border-4 border-red-500 rounded">
              <p className="text-red-300 font-bold">✗ Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return currentView === 'main' ? <MainView /> : <ConverterView />;
};

export default MondrianConverter;