// src/services/ttsService.js
const API_URL = 'http://localhost:5000/api';

export const ttsService = {
  /**
   * Sends a URL to the backend to have its main article text extracted.
   */
  async extractTextFromUrl(url) {
    const response = await fetch(`${API_URL}/extract-text-from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to extract text from URL.');
    }

    return response.json();
  },

  /**
   * Sends raw text to the backend to be converted into an MP3 speech file.
   */
  async convertTextToSpeech(text, voice) {
    const response = await fetch(`${API_URL}/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'en', voice })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.details || 'Conversion failed on the server.');
    }

    return response.json();
  }
};