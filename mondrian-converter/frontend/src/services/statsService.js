// src/services/statsService.js
const API_URL = 'http://localhost:5000/api';

export const statsService = {
  async getStats() {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to load stats');
    return response.json();
  },

  async incrementUsage() {
    const response = await fetch(`${API_URL}/stats/increment`, { 
      method: 'POST' 
    });
    if (!response.ok) throw new Error('Failed to update stats');
    return response.json();
  }
};