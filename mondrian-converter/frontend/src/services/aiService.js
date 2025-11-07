// src/services/aiService.js
const API_URL = 'http://localhost:5000/api';

export const aiService = {
  /**
   * Starts the slide generation process on the backend.
   * @param {string} prompt The user's text prompt.
   * @param {string} theme The selected theme (e.g., 'Revision Theme').
   * @param {string} outputFormat The desired output format (e.g., 'powerpoint').
   * @returns {Promise<string>} A promise that resolves to the unique generation_id.
   */
  generateSlides: async (prompt, theme, outputFormat) => {
    const response = await fetch(`${API_URL}/generate-slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, theme, outputFormat }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start generation.');
    }
    const data = await response.json();
    return data.generation_id;
  },

  /**
   * Polls the backend for the status of an ongoing generation.
   * @param {string} generationId The ID of the job to check.
   * @returns {Promise<object>} A promise that resolves to the status object.
   */
  getGenerationStatus: async (generationId) => {
    const response = await fetch(`${API_URL}/generation-status/${generationId}`);
    if (!response.ok) {
      throw new Error('Failed to get generation status.');
    }
    return response.json();
  },
};