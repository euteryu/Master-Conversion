# Save this file as pdf_converter_view.py
import customtkinter as ctk
from tkinter import filedialog
import threading
import os
import datetime
import platform
from backend_conversion import CONVERSION_STRATEGIES

class AppColors:
    SUCCESS, ERROR, INFO, SECONDARY = "#4CAF50", "#F44336", "#FFFFFF", "#B0BEC5"

QUALITY_MAP = {"High (150 DPI)": 150, "Good (120 DPI)": 120, "Fast (96 DPI)": 96}

class PdfConverterView(ctk.CTkFrame):
    def __init__(self, master, back_callback):
        super().__init__(master, fg_color="transparent")
        self.back_callback = back_callback # Function to call to go back to main menu
        self.input_file_path = None
        self.last_output_path = None

        self.grid_columnconfigure(0, weight=1)
        self._create_widgets()

    def _create_widgets(self):
        # --- Back Button ---
        back_button = ctk.CTkButton(self, text="< Back to Main Menu", command=self.back_callback, width=150)
        back_button.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")
        
        # --- The rest of the UI is the same as before, but attached to 'self' ---
        format_frame = ctk.CTkFrame(self)
        format_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        # ... (all the widget creation code from your previous UI) ...
        # (For brevity, I'm pasting the full, correct block from the previous step)
        format_frame.grid_columnconfigure((1, 3), weight=1)
        ctk.CTkLabel(format_frame, text="From").grid(row=0, column=0, padx=(10,5))
        self.from_menu = ctk.CTkOptionMenu(format_frame, values=["PDF", "PPT", "DOC", "CSV"], command=self._on_format_change)
        self.from_menu.grid(row=0, column=1, padx=5, pady=10, sticky="ew")
        ctk.CTkLabel(format_frame, text="To").grid(row=0, column=2, padx=(10,5))
        self.to_menu = ctk.CTkOptionMenu(format_frame, values=["PDF", "PPT", "DOC", "CSV"])
        self.to_menu.grid(row=0, column=3, padx=(5,10), pady=10, sticky="ew")
        self.from_menu.set("PDF")
        self.to_menu.set("PPT")
        self._on_format_change("PDF")

        file_frame = ctk.CTkFrame(self)
        file_frame.grid(row=2, column=0, padx=20, pady=10, sticky="ew")
        file_frame.grid_columnconfigure(1, weight=1)
        self.select_file_button = ctk.CTkButton(file_frame, text="Select File...", command=self._select_input_file)
        self.select_file_button.grid(row=0, column=0, padx=10, pady=10)
        self.file_label = ctk.CTkLabel(file_frame, text="No file selected", text_color=AppColors.SECONDARY, anchor="w")
        self.file_label.grid(row=0, column=1, padx=10, pady=10, sticky="ew")

        options_frame = ctk.CTkFrame(self, fg_color="transparent")
        options_frame.grid(row=3, column=0, padx=20, pady=10, sticky="nsew")
        options_frame.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(options_frame, text="Options", font=ctk.CTkFont(weight="bold")).grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(options_frame, text="Conversion Mode:").grid(row=1, column=0, pady=(10,5), sticky="w")
        self.mode_selector = ctk.CTkSegmentedButton(options_frame, values=["Hybrid (Editable Text)", "Image Only (Flattened)"])
        self.mode_selector.grid(row=2, column=0, sticky="ew")
        self.mode_selector.set("Hybrid (Editable Text)")
        ctk.CTkLabel(options_frame, text="Background Quality:").grid(row=3, column=0, pady=(15,5), sticky="w")
        self.quality_selector = ctk.CTkSegmentedButton(options_frame, values=list(QUALITY_MAP.keys()))
        self.quality_selector.grid(row=4, column=0, sticky="ew")
        self.quality_selector.set("Good (120 DPI)")

        self.convert_button = ctk.CTkButton(self, text="Convert", font=ctk.CTkFont(size=24, weight="bold"), height=60, command=self._start_conversion_thread)
        self.convert_button.grid(row=4, column=0, padx=20, pady=20, sticky="ew")
        
        status_frame = ctk.CTkFrame(self, fg_color="transparent")
        status_frame.grid(row=5, column=0, padx=20, pady=(0, 20), sticky="ew")
        status_frame.grid_columnconfigure(0, weight=1)
        self.status_label = ctk.CTkLabel(status_frame, text="Ready", text_color=AppColors.SECONDARY, anchor="w")
        self.status_label.grid(row=0, column=0, sticky="ew")
        self.progress_bar = ctk.CTkProgressBar(self)
        self.progress_bar.grid(row=6, column=0, padx=20, pady=(0, 20), sticky="ew")
        self.progress_bar.set(0)

        self.open_file_button = ctk.CTkButton(status_frame, text="Open File", command=self._open_output_file, fg_color=AppColors.SUCCESS, hover_color="#388E3C")

    # Paste all the helper methods (_on_format_change, _select_input_file, etc.) here without any changes
    # ... (all methods from _on_format_change to _set_ui_state go here) ...
    def _on_format_change(self, selected_from):
        to_options = [opt for opt in ["PDF", "PPT", "DOC", "CSV"] if opt != selected_from]
        self.to_menu.configure(values=to_options)
        if self.to_menu.get() == selected_from: self.to_menu.set(to_options[0])

    def _select_input_file(self):
        filepath = filedialog.askopenfilename(title="Select a PDF file", filetypes=[("PDF files", "*.pdf")])
        if filepath:
            self.input_file_path = filepath
            self.file_label.configure(text=os.path.basename(filepath), text_color=AppColors.INFO)
            self.status_label.configure(text="Ready to convert.", text_color=AppColors.SECONDARY)
            self.open_file_button.grid_forget()

    def _start_conversion_thread(self):
        if not self.input_file_path:
            self.status_label.configure(text="❌ Error: Please select a file first!", text_color=AppColors.ERROR)
            return
        self.open_file_button.grid_forget()
        self._set_ui_state(is_converting=True)
        thread = threading.Thread(target=self._run_conversion, daemon=True)
        thread.start()

    def _run_conversion(self):
        from_format, to_format, mode, quality_text = self.from_menu.get(), self.to_menu.get(), self.mode_selector.get(), self.quality_selector.get()
        dpi = QUALITY_MAP.get(quality_text, 120)
        strategy_key = (from_format, to_format, mode)
        conversion_function = CONVERSION_STRATEGIES.get(strategy_key)
        base_name = os.path.splitext(os.path.basename(self.input_file_path))[0]
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{base_name}_{timestamp}.pptx"
        self.last_output_path = os.path.join(os.path.dirname(self.input_file_path), output_filename)
        error_message = conversion_function(self.input_file_path, self.last_output_path, lambda c, t: self.after(0, self._update_progress, c, t), dpi=dpi) if conversion_function else f"Conversion not supported."
        self.after(0, self._finish_conversion, error_message, self.last_output_path)

    def _finish_conversion(self, error_message, output_path):
        if error_message:
            self.status_label.configure(text=f"❌ Error: {error_message}", text_color=AppColors.ERROR, wraplength=450)
            self.progress_bar.set(0)
        else:
            self.status_label.configure(text=f"✔ Success! Saved to {os.path.basename(output_path)}", text_color=AppColors.SUCCESS, wraplength=450)
            self.progress_bar.set(1)
            self.open_file_button.grid(row=0, column=1, padx=(10,0))
        self._set_ui_state(is_converting=False)

    def _open_output_file(self):
        if self.last_output_path and os.path.exists(self.last_output_path):
            if platform.system() == "Windows": os.startfile(self.last_output_path)
            elif platform.system() == "Darwin": os.system(f'open "{self.last_output_path}"')
            else: os.system(f'xdg-open "{self.last_output_path}"')

    def _update_progress(self, current, total):
        self.progress_bar.set(current / total)
        self.status_label.configure(text=f"Processing page {current} of {total}...", text_color=AppColors.INFO)

    def _set_ui_state(self, is_converting):
        state = "disabled" if is_converting else "normal"
        button_text = "Converting..." if is_converting else "Convert"
        for widget in [self.from_menu, self.to_menu, self.select_file_button, self.mode_selector, self.quality_selector]:
            widget.configure(state=state)
        self.convert_button.configure(state=state, text=button_text)
        if not is_converting: self.progress_bar.set(0)