# Save this file as app.py
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import threading
from backend_conversion import CONVERSION_STRATEGIES
import subprocess # <-- NEW IMPORT
import uuid       # <-- NEW IMPORT

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
STATS_FILE = 'mondrian_stats.json'
ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'doc', 'docx', 'csv'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Store active conversions
active_conversions = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_stats():
    """Load stats from JSON file"""
    if not os.path.exists(STATS_FILE):
        return {'usage_count': 0, 'last_opened': 'Never'}
    try:
        with open(STATS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {'usage_count': 0, 'last_opened': 'Never'}

def save_stats(stats):
    """Save stats to JSON file"""
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f, indent=4)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    stats = load_stats()
    return jsonify(stats)

@app.route('/api/stats/increment', methods=['POST'])
def increment_stats():
    """Increment usage count and update last opened"""
    stats = load_stats()
    stats['usage_count'] += 1
    stats['last_opened'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_stats(stats)
    return jsonify(stats)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    return jsonify({
        'success': True,
        'filename': unique_filename,
        'original_name': filename
    })

# --- NEW YOUTUBE DOWNLOADER ROUTE ---
@app.route('/api/download-youtube', methods=['POST'])
def download_youtube_video():
    data = request.get_json()
    url = data.get('url')
    format_choice = data.get('format')

    if not url or not format_choice:
        return jsonify({'error': 'Missing URL or format'}), 400

    unique_id = str(uuid.uuid4())
    command = ['yt-dlp']
    
    if format_choice == 'mp3_audio':
        filename = f"{unique_id}.mp3"
        output_path_template = os.path.join(OUTPUT_FOLDER, f"{unique_id}.%(ext)s")
        command.extend(['-x', '--audio-format', 'mp3', '-o', output_path_template, url])
    
    elif format_choice == 'mkv_video':
        filename = f"{unique_id}.mkv"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        command.extend(['-f', 'bv*+ba/b', '--merge-output-format', 'mkv', '-o', output_path, url])

    else: # Default to mp4_video
        filename = f"{unique_id}.mp4"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        command.extend(['-f', 'bv*+ba/b', '--merge-output-format', 'mp4', '-o', output_path, url])
    
    try:
        print(f"Executing command: {' '.join(command)}")
        # Using check=True will raise an exception if yt-dlp fails
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Successfully created file: {filename}")
        return jsonify({'message': 'Download successful!', 'filename': filename})
    except subprocess.CalledProcessError as e:
        print("Error from yt-dlp:", e.stderr)
        return jsonify({'error': 'Failed to download or convert video.', 'details': e.stderr}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An unexpected server error occurred.'}), 500
# --- END OF NEW ROUTE ---


@app.route('/api/convert', methods=['POST'])
def convert_file():
    """Start file conversion"""
    data = request.json
    input_filename = data.get('filename')
    from_format = data.get('from_format', 'PDF')
    to_format = data.get('to_format', 'PPT')
    mode = data.get('mode', 'Hybrid (Editable Text)')
    quality = data.get('quality', 'good')
    
    # Map quality to DPI
    quality_map = {
        'fast': 96,
        'good': 120,
        'high': 150
    }
    dpi = quality_map.get(quality, 120)
    
    # Map mode to strategy key
    mode_map = {
        'hybrid': 'Hybrid (Editable Text)',
        'image': 'Image Only (Flattened)'
    }
    strategy_mode = mode_map.get(mode, 'Hybrid (Editable Text)')
    
    input_path = os.path.join(UPLOAD_FOLDER, input_filename)
    if not os.path.exists(input_path):
        return jsonify({'error': 'Input file not found'}), 404
    
    base_name = os.path.splitext(input_filename)[0]
    output_extension = '.pptx' if to_format == 'PPT' else f'.{to_format.lower()}'
    output_filename = f"{base_name}_converted{output_extension}"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    strategy_key = (from_format, to_format, strategy_mode)
    conversion_function = CONVERSION_STRATEGIES.get(strategy_key)
    
    if not conversion_function:
        return jsonify({'error': f'Conversion from {from_format} to {to_format} not supported'}), 400
    
    conversion_id = f"{datetime.now().timestamp()}"
    active_conversions[conversion_id] = {
        'status': 'processing', 'progress': 0, 'total': 0,
        'output_file': output_filename
    }
    
    def progress_callback(current, total):
        active_conversions[conversion_id]['progress'] = current
        active_conversions[conversion_id]['total'] = total
    
    def run_conversion():
        try:
            error = conversion_function(
                input_path, output_path, progress_callback, dpi=dpi
            )
            if error:
                active_conversions[conversion_id]['status'] = 'error'
                active_conversions[conversion_id]['error'] = error
            else:
                active_conversions[conversion_id]['status'] = 'completed'
                active_conversions[conversion_id]['progress'] = active_conversions[conversion_id]['total']
        except Exception as e:
            active_conversions[conversion_id]['status'] = 'error'
            active_conversions[conversion_id]['error'] = str(e)
    
    thread = threading.Thread(target=run_conversion, daemon=True)
    thread.start()
    
    return jsonify({'success': True, 'conversion_id': conversion_id})

@app.route('/api/conversion/<conversion_id>', methods=['GET'])
def get_conversion_status(conversion_id):
    """Get conversion progress"""
    if conversion_id not in active_conversions:
        return jsonify({'error': 'Conversion not found'}), 404
    
    return jsonify(active_conversions[conversion_id])

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download converted file from either process"""
    # Using send_from_directory is safer as it prevents path traversal attacks
    try:
        return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/cleanup', methods=['POST'])
def cleanup_files():
    """Clean up old files"""
    try:
        # Clean uploads older than 1 hour
        for filename in os.listdir(UPLOAD_folder):
            filepath = os.path.join(UPLOAD_folder, filename)
            if os.path.getmtime(filepath) < datetime.now().timestamp() - 3600:
                os.remove(filepath)
        
        # Clean outputs older than 24 hours
        for filename in os.listdir(OUTPUT_FOLDER):
            filepath = os.path.join(OUTPUT_FOLDER, filename)
            if os.path.getmtime(filepath) < datetime.now().timestamp() - 86400:
                os.remove(filepath)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)