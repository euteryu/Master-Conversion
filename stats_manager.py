# Save this file as stats_manager.py
import json
import os
from datetime import datetime

STATS_FILE = "mondrian_stats.json"

class StatsManager:
    def __init__(self):
        self.data = self._load_stats()

    def _load_stats(self):
        """Loads stats from the JSON file, or creates it if it doesn't exist."""
        if not os.path.exists(STATS_FILE):
            return {'usage_count': 0, 'last_opened': 'Never'}
        try:
            with open(STATS_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # If file is corrupted or unreadable, return default
            return {'usage_count': 0, 'last_opened': 'Never'}

    def _save_stats(self):
        """Saves the current stats data to the JSON file."""
        with open(STATS_FILE, 'w') as f:
            json.dump(self.data, f, indent=4)

    def update_on_startup(self):
        """Increments usage count, updates last opened time, and saves."""
        self.data['usage_count'] += 1
        self.data['last_opened'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self._save_stats()
        return self.data