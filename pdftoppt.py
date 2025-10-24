# Save this file as pdftoppt.py in the SAME directory as backend_conversion.py

import customtkinter as ctk
from tkinter import filedialog
import threading
import os
import datetime # Import the datetime module for timestamps

# Import the conversion logic from your backend file
from backend_conversion import CONVERSION_STRATEGIES

# --- Constants & Configuration ---
APP_TITLE = "Smart File Converter"
WINDOW_SIZE = "550x600"
FORMAT_OPTIONS = ["PDF", "PPT", "DOC", "CSV"]

class FileConverterApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry(WINDOW_SIZE)
        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("blue")
        self.input_file_path = None
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        self._create_widgets()

    def _create_widgets(self):
        # This combines all widget creation methods into one for simplicity
        # Format Selection Frame
        format_frame = ctk.CTkFrame(self)
        format_frame.grid(row=0, column=0, padx=20, pady=20, sticky="ew")
        format_frame.grid_columnconfigure((1, 3), weight=1)
        ctk.CTkLabel(format_frame, text="From", font=ctk.CTkFont(size=14)).grid(row=0, column=0, padx=(10,5))
        self.from_menu = ctk.CTkOptionMenu(format_frame, values=FORMAT_OPTIONS, command=self._on_format_change)
        self.from_menu.grid(row=0, column=1, padx=5, pady=10, sticky="ew")
        ctk.CTkLabel(format_frame, text="To", font=ctk.CTkFont(size=14)).grid(row=0, column=2, padx=(10,5))
        self.to_menu = ctk.CTkOptionMenu(format_frame, values=FORMAT_OPTIONS)
        self.to_menu.grid(row=0, column=3, padx=(5,10), pady=10, sticky="ew")
        self.from_menu.set("PDF")
        self.to_menu.set("PPT")
        self._on_format_change("PDF")

        # File Selection Frame
        file_frame = ctk.CTkFrame(self)
        file_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        file_frame.grid_columnconfigure(1, weight=1)
        self.select_file_button = ctk.CTkButton(file_frame, text="Select File...", command=self._select_input_file)
        self.select_file_button.grid(row=0, column=0, padx=10, pady=10)
        self.file_label = ctk.CTkLabel(file_frame, text="No file selected", text_color="gray", anchor="w")
        self.file_label.grid(row=0, column=1, padx=10, pady=10, sticky="ew")

        # Mode Selection
        self.mode_label = ctk.CTkLabel(self, text="Conversion Mode:", font=ctk.CTkFont(size=12, weight="bold"))
        self.mode_label.grid(row=2, column=0, padx=20, pady=(15, 5), sticky="sw")
        self.mode_selector = ctk.CTkSegmentedButton(self, values=["Hybrid (Editable Text)", "Image Only (Flattened)"])
        self.mode_selector.grid(row=3, column=0, padx=20, pady=(0, 20), sticky="new")
        self.mode_selector.set("Hybrid (Editable Text)")

        # Convert Button
        self.convert_button = ctk.CTkButton(self, text="Convert", font=ctk.CTkFont(size=24, weight="bold"), height=60, corner_radius=15, command=self._start_conversion_thread)
        self.convert_button.grid(row=4, column=0, padx=20, pady=20, sticky="ew")
        
        # Status Widgets
        self.status_label = ctk.CTkLabel(self, text="Ready", font=ctk.CTkFont(size=12), anchor="w")
        self.status_label.grid(row=5, column=0, padx=20, pady=(10, 5), sticky="ew")
        self.progress_bar = ctk.CTkProgressBar(self)
        self.progress_bar.grid(row=6, column=0, padx=20, pady=(0, 20), sticky="ew")
        self.progress_bar.set(0)

    def _on_format_change(self, selected_from):
        to_options = [opt for opt in FORMAT_OPTIONS if opt != selected_from]
        self.to_menu.configure(values=to_options)
        if self.to_menu.get() == selected_from:
            self.to_menu.set(to_options[0])

    def _select_input_file(self):
        from_format = self.from_menu.get().lower()
        filetypes = [(f"{from_format.upper()} files", f"*.{from_format}")]
        filepath = filedialog.askopenfilename(title=f"Select a {from_format.upper()} file", filetypes=filetypes)
        if filepath:
            self.input_file_path = filepath
            self.file_label.configure(text=os.path.basename(filepath), text_color="white")
            self.status_label.configure(text="File selected. Ready to convert.", text_color="white")

    def _update_progress(self, current, total):
        progress_value = current / total
        self.progress_bar.set(progress_value)
        self.status_label.configure(text=f"Processing page {current} of {total}...")

    def _start_conversion_thread(self):
        if not self.input_file_path:
            self.status_label.configure(text="Error: Please select a file first!", text_color="#E57373")
            return
        
        self._set_ui_state(is_converting=True)
        thread = threading.Thread(target=self._run_conversion, daemon=True)
        thread.start()

    def _run_conversion(self):
        from_format = self.from_menu.get()
        to_format = self.to_menu.get()
        mode = self.mode_selector.get()
        
        strategy_key = (from_format, to_format, mode)
        conversion_function = CONVERSION_STRATEGIES.get(strategy_key)

        # --- FIX for PermissionError: Generate a unique filename ---
        base_name = os.path.splitext(os.path.basename(self.input_file_path))[0]
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{base_name}_{timestamp}.pptx"
        output_path = os.path.join(os.path.dirname(self.input_file_path), output_filename)
        
        error_message = None
        if conversion_function:
            progress_callback = lambda current, total: self.after(0, self._update_progress, current, total)
            error_message = conversion_function(self.input_file_path, output_path, progress_callback)
        else:
            error_message = f"Conversion from {from_format} to {to_format} ({mode}) is not supported."
        
        self.after(0, self._finish_conversion, error_message, output_path)

    def _finish_conversion(self, error_message, output_path):
        if error_message:
            self.status_label.configure(text=f"Error: {error_message}", text_color="#E57373")
            self.progress_bar.set(0)
        else:
            self.status_label.configure(text=f"Success! Saved to {os.path.basename(output_path)}", text_color="#81C784")
            self.progress_bar.set(1)
        self._set_ui_state(is_converting=False)
        
    def _set_ui_state(self, is_converting):
        state = "disabled" if is_converting else "normal"
        button_text = "Converting..." if is_converting else "Convert"
        for widget in [self.convert_button, self.from_menu, self.to_menu, self.select_file_button, self.mode_selector]:
            widget.configure(state=state)
        self.convert_button.configure(text=button_text)
        if not is_converting: self.progress_bar.set(0)

if __name__ == "__main__":
    app = FileConverterApp()
    app.mainloop()