// src/services/videoConversionService.js
const API_URL = 'http://localhost:5000/api';

export const videoConversionService = {
  /**
   * Uploads a file to the server.
   * This is used by the local video converter before conversion.
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Upload failed');
    }
    
    return response.json();
  },

  /**
   * Sends a YouTube URL and format to the backend for download and conversion.
   */
  async downloadYoutubeVideo(url, format) {
    const response = await fetch(`${API_URL}/download-youtube`, {
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
  },

  /**
   * Requests the conversion of an already uploaded local video file.
   */
  async convertLocalVideo(filename, targetFormat) {
    const response = await fetch(`${API_URL}/convert-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, targetFormat })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Conversion failed');
    }

    return response.json();
  }
};