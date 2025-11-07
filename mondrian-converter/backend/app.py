# Save this file as app.py
import sys
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import threading
from backend_conversion import CONVERSION_STRATEGIES
# --- NEW SLIDER MODULE IMPORTS ---
from backend_ai_generator import generate_presentation
import subprocess
import uuid
import glob
from gtts import gTTS
import trafilatura

app = Flask(__name__)
CORS(app)

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

# --- CONFIGURATION ---
UPLOAD_FOLDER = os.path.join(base_path, 'uploads')
OUTPUT_FOLDER = os.path.join(base_path, 'outputs')
FFMPEG_PATH = os.path.join(base_path, 'bin')
VOICES_FOLDER = os.path.join(base_path, 'voices')
# --- NEW: Templates folder for Slider module ---
TEMPLATES_FOLDER = os.path.join(base_path, 'templates')
STATS_FILE = os.path.join(os.path.dirname(sys.executable), 'mondrian_stats.json') if getattr(sys, 'frozen', False) else 'mondrian_stats.json'

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'doc', 'docx', 'csv', 'mp4', 'mkv', 'mov', 'avi', 'webm', 'mp3'}

# --- CREATE FOLDERS ---
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(FFMPEG_PATH, exist_ok=True)
os.makedirs(VOICES_FOLDER, exist_ok=True)
os.makedirs(TEMPLATES_FOLDER, exist_ok=True)

# --- IN-MEMORY STATE MANAGEMENT ---
active_conversions = {}
# --- NEW: Dictionary for active AI generations ---
active_generations = {}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_stats():
    if not os.path.exists(STATS_FILE): return {'usage_count': 0, 'last_opened': 'Never'}
    try:
        with open(STATS_FILE, 'r') as f: return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {'usage_count': 0, 'last_opened': 'Never'}

def save_stats(stats):
    with open(STATS_FILE, 'w') as f: json.dump(stats, f, indent=4)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(load_stats())

@app.route('/api/stats/increment', methods=['POST'])
def increment_stats():
    stats = load_stats()
    stats['usage_count'] += 1
    stats['last_opened'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_stats(stats)
    return jsonify(stats)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files: return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename): return jsonify({'error': 'Invalid file type'}), 400
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H:%M:%S")
    unique_filename = f"{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    return jsonify({'success': True, 'filename': unique_filename, 'original_name': filename})

@app.route('/api/download-youtube', methods=['POST'])
def download_youtube_video():
    data = request.get_json()
    url = data.get('url')
    format_choice = data.get('format')
    if not url or not format_choice: return jsonify({'error': 'Missing URL or format'}), 400
    try:
        title_command = ['yt-dlp', '--get-title', url]
        title_result = subprocess.run(title_command, check=True, capture_output=True, text=True, encoding='utf-8')
        original_title = title_result.stdout.strip()
    except Exception:
        original_title = "downloaded_video"
    unique_id = str(uuid.uuid4())
    command = ['yt-dlp', '--ffmpeg-location', FFMPEG_PATH]
    filename = None
    best_quality_video = 'bestvideo+bestaudio/best'
    if format_choice == 'mp3_audio':
        filename = f"{unique_id}.mp3"
        output_path_template = os.path.join(OUTPUT_FOLDER, f"{unique_id}.%(ext)s")
        command.extend(['-x', '--audio-format', 'mp3', '-o', output_path_template, url])
    elif format_choice == 'mkv_video':
        filename = f"{unique_id}.mkv"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        command.extend(['-f', best_quality_video, '--merge-output-format', 'mkv', '-o', output_path, url])
    elif format_choice == 'default_video':
        output_path_template = os.path.join(OUTPUT_FOLDER, f"{unique_id}.%(ext)s")
        command.extend(['-f', best_quality_video, '-o', output_path_template, url])
    else: # Default to mp4_video
        filename = f"{unique_id}.mp4"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        command.extend(['-f', best_quality_video, '--merge-output-format', 'mp4', '--postprocessor-args', 'Merger:-c:a aac', '-o', output_path, url])
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        if filename is None:
            search_pattern = os.path.join(OUTPUT_FOLDER, f"{unique_id}.*")
            files = glob.glob(search_pattern)
            if files: filename = os.path.basename(files[0])
            else: raise FileNotFoundError("Could not find downloaded file.")
        return jsonify({'message': 'Download successful!', 'filename': filename, 'originalTitle': original_title})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': 'Failed to download or convert video.', 'details': e.stderr}), 500
    except Exception as e:
        return jsonify({'error': 'An unexpected server error occurred.'}), 500
        
@app.route('/api/convert-video', methods=['POST'])
def convert_local_video():
    data = request.get_json()
    input_filename = data.get('filename')
    target_format = data.get('targetFormat')
    if not input_filename or not target_format: return jsonify({'error': 'Missing filename or target format'}), 400
    input_path = os.path.join(UPLOAD_FOLDER, input_filename)
    if not os.path.exists(input_path): return jsonify({'error': 'Input file not found'}), 404
    base_name = os.path.splitext(input_filename)[0]
    output_filename = f"{base_name}_converted.{target_format}"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    command = [os.path.join(FFMPEG_PATH, 'ffmpeg'), '-y', '-i', input_path]
    if target_format == 'mp3':
        command.extend(['-vn', '-acodec', 'libmp3lame', '-q:a', '2', output_path])
    else:
        command.extend(['-c:v', 'copy', '-c:a', 'copy', output_path])
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError:
        command[-3:-1] = []
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            return jsonify({'error': 'Conversion failed.', 'details': e.stderr}), 500
    return jsonify({'message': 'Conversion successful!', 'filename': output_filename})

@app.route('/api/extract-text-from-url', methods=['POST'])
def extract_text_from_url():
    data = request.get_json()
    url = data.get('url')
    if not url: return jsonify({'error': 'No URL provided'}), 400
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted_text = trafilatura.extract(downloaded)
            return jsonify({'text': extracted_text})
        else:
            return jsonify({'error': 'Could not fetch content from the provided URL.'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to parse the article from the URL.', 'details': str(e)}), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    text = data.get('text')
    language = data.get('language', 'en')
    voice = data.get('voice', 'en-female')
    if not text: return jsonify({'error': 'No text provided'}), 400
    words = text.split()
    final_text = ' '.join(words[:2000])
    try:
        tts = gTTS(text=final_text, lang=language, slow=False)
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}.mp3"
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        tts.save(filepath)
        return jsonify({'message': 'TTS conversion successful!', 'filename': filename})
    except Exception as e:
        return jsonify({'error': 'Text-to-speech conversion failed.', 'details': str(e)}), 500

@app.route('/api/convert', methods=['POST'])
def convert_file():
    data = request.json
    input_filename = data.get('filename')
    
    input_path = os.path.join(UPLOAD_FOLDER, input_filename)
    if not os.path.exists(input_path):
        return jsonify({'error': 'Input file not found'}), 404

    base_name = os.path.splitext(input_filename)[0]
    conversion_function = None
    output_filename = ""
    
    # --- INTELLIGENT DISPATCHER LOGIC ---
    if input_filename.lower().endswith('.pdf'):
        output_filename = f"{base_name}_converted.pptx"
        conversion_function = CONVERSION_STRATEGIES.get('pdf_to_ppt')
    elif input_filename.lower().endswith(('.ppt', '.pptx')):
        output_filename = f"{base_name}_converted.pdf"
        conversion_function = CONVERSION_STRATEGIES.get('ppt_to_pdf')
    else:
        return jsonify({'error': 'Unsupported file type for this converter.'}), 400

    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    if not conversion_function:
        return jsonify({'error': 'Internal error: No conversion strategy found.'}), 500

    conversion_id = str(uuid.uuid4())
    active_conversions[conversion_id] = {'status': 'processing', 'progress': 0, 'total': 0, 'output_file': output_filename}
    
    def progress_callback(current, total, message="Converting..."): # Add message for future use
        active_conversions[conversion_id]['progress'] = current
        active_conversions[conversion_id]['total'] = total
        active_conversions[conversion_id]['message'] = message

    def run_conversion():
        try:
            # Note: The PDF function takes an extra 'dpi' argument which PPT does not.
            if input_filename.lower().endswith('.pdf'):
                error = conversion_function(input_path, output_path, progress_callback, dpi=150)
            else:
                error = conversion_function(input_path, output_path, progress_callback)

            if error:
                active_conversions[conversion_id]['status'] = 'error'
                active_conversions[conversion_id]['error'] = error
            else:
                active_conversions[conversion_id]['status'] = 'completed'
                active_conversions[conversion_id]['progress'] = active_conversions[conversion_id].get('total', 1)
        except Exception as e:
            active_conversions[conversion_id]['status'] = 'error'
            active_conversions[conversion_id]['error'] = str(e)

    thread = threading.Thread(target=run_conversion, daemon=True)
    thread.start()
    return jsonify({'success': True, 'conversion_id': conversion_id})

@app.route('/api/conversion/<conversion_id>', methods=['GET'])
def get_conversion_status(conversion_id):
    if conversion_id not in active_conversions: return jsonify({'error': 'Conversion not found'}), 404
    return jsonify(active_conversions[conversion_id])
    
# --- NEW SLIDER MODULE ENDPOINTS ---

@app.route('/api/generate-slides', methods=['POST'])
def generate_slides_endpoint():
    data = request.json
    prompt = data.get('prompt')
    output_format = data.get('outputFormat', 'powerpoint')
    theme = data.get('theme', 'Revision Theme')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"ai_generated_{timestamp}.pptx"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    generation_id = str(uuid.uuid4())
    active_generations[generation_id] = {
        'status': 'processing', 
        'progress': 0, 
        'total': 4, 
        'message': 'Initializing...',
        'output_file': output_filename,
        'error': None
    }

    def progress_callback(current, total, message):
        if generation_id in active_generations:
            active_generations[generation_id]['progress'] = current
            active_generations[generation_id]['total'] = total
            active_generations[generation_id]['message'] = message
        
    def run_generation():
        try:
            error = generate_presentation(prompt, output_format, theme, output_path, TEMPLATES_FOLDER, progress_callback)
            if error:
                active_generations[generation_id]['status'] = 'error'
                active_generations[generation_id]['error'] = error
            else:
                active_generations[generation_id]['status'] = 'completed'
                active_generations[generation_id]['message'] = 'Generation complete!'
                active_generations[generation_id]['progress'] = active_generations[generation_id].get('total', 4)
        except Exception as e:
            active_generations[generation_id]['status'] = 'error'
            active_generations[generation_id]['error'] = str(e)
            
    thread = threading.Thread(target=run_generation, daemon=True)
    thread.start()
    
    return jsonify({'success': True, 'generation_id': generation_id})

@app.route('/api/generation-status/<generation_id>', methods=['GET'])
def get_generation_status(generation_id):
    if generation_id not in active_generations:
        return jsonify({'error': 'Generation job not found'}), 404
    return jsonify(active_generations[generation_id])


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/cleanup', methods=['POST'])
def cleanup_files():
    try:
        for filename in os.listdir(UPLOAD_FOLDER):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.getmtime(filepath) < datetime.now().timestamp() - 3600: os.remove(filepath)
        for filename in os.listdir(OUTPUT_FOLDER):
            filepath = os.path.join(OUTPUT_FOLDER, filename)
            if os.path.getmtime(filepath) < datetime.now().timestamp() - 86400: os.remove(filepath)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Please ensure the Ollama application is running in the background.")
    app.run(debug=True, port=5000)