# backend/build.py
import os
import subprocess
import dateparser

# Find the path to the dateparser data
dateparser_path = os.path.join(os.path.dirname(dateparser.__file__), 'data')

# Build the PyInstaller command
command = [
    'pyinstaller',
    '--noconfirm',
    '--onedir',
    '--windowed',
    '--name=mondrian_backend',
    '--add-data', f'{os.path.join("templates")}{os.pathsep}templates',
    '--add-data', f'{dateparser_path}{os.pathsep}dateparser/data',
    'app.py'
]

print(f"Running command: {' '.join(command)}")

# Execute the command
subprocess.run(command, check=True)