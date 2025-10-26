// services/conversionService.js
const API_URL = 'http://localhost:5000/api';

export const conversionService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async convert({ filename, from_format, to_format, mode, quality }) {
    const response = await fetch(`${API_URL}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        from_format,
        to_format,
        mode,
        quality
      })
    });
    
    if (!response.ok) {
      throw new Error('Conversion failed to start');
    }
    
    return response.json();
  },

  async getStatus(conversionId) {
    const response = await fetch(`${API_URL}/conversion/${conversionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get conversion status');
    }
    
    return response.json();
  },

  downloadFile(filename) {
    window.open(`${API_URL}/download/${filename}`, '_blank');
  },

  // --- NEW FUNCTION ADDED HERE ---
  async downloadYoutubeVideo(url, format) {
    const response = await fetch(`${API_URL}/download-youtube`, { // Using a distinct endpoint name
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, format }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An unknown error occurred during download.');
    }
  
    return response.json();
  }
};