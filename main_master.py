# Save this file as main_master.py
import customtkinter as ctk
from stats_manager import StatsManager
from pdf_converter_view import PdfConverterView

class MondrianView(ctk.CTkFrame):
    """The main menu view, redesigned to match the new Mondrian painting."""
    def __init__(self, master, controller, stats):
        super().__init__(master, fg_color="black", corner_radius=0)
        self.controller = controller

        # --- Configure the main grid: A large left column and a smaller right one ---
        self.grid_columnconfigure(0, weight=3)  # Left column is wider
        self.grid_columnconfigure(1, weight=1)  # Right column is narrower
        self.grid_rowconfigure(0, weight=1)     # A single row to fill the height
        self.grid_propagate(False)

        # --- Create containers for the two main columns ---
        left_container = ctk.CTkFrame(self, fg_color="black", corner_radius=0)
        right_container = ctk.CTkFrame(self, fg_color="black", corner_radius=0)
        left_container.grid(row=0, column=0, sticky="nsew")
        right_container.grid(row=0, column=1, sticky="nsew")

        # --- 1. Populate the Left Container ---
        left_container.grid_rowconfigure(0, weight=3)  # Top yellow is taller
        left_container.grid_rowconfigure(1, weight=2)  # Bottom red is shorter
        left_container.grid_columnconfigure(0, weight=1)

        # Use a thicker border_width for all frames
        border_thickness = 10
        
        frame_yellow_tl = ctk.CTkFrame(left_container, fg_color="#F7D002", border_width=border_thickness, border_color="black", corner_radius=0)
        frame_red_bl = ctk.CTkFrame(left_container, fg_color="#D21404", border_width=border_thickness, border_color="black", corner_radius=0)
        
        frame_yellow_tl.grid(row=0, column=0, sticky="nsew")
        frame_red_bl.grid(row=1, column=0, sticky="nsew")

        # --- 2. Populate the Right Container ---
        right_container.grid_rowconfigure(0, weight=1)  # Top band is shortest
        right_container.grid_rowconfigure(1, weight=3)  # Middle blue is tallest
        right_container.grid_rowconfigure(2, weight=2)  # Bottom yellow is medium
        right_container.grid_columnconfigure(0, weight=1)

        # Create a sub-container for the top-right band which has two colors
        top_right_container = ctk.CTkFrame(right_container, fg_color="black", corner_radius=0)
        top_right_container.grid(row=0, column=0, sticky="nsew")
        top_right_container.grid_columnconfigure((0, 1), weight=1)
        top_right_container.grid_rowconfigure(0, weight=1)

        frame_blue_tr_small = ctk.CTkFrame(top_right_container, fg_color="#0047AB", border_width=border_thickness, border_color="black", corner_radius=0)
        frame_red_tr = ctk.CTkFrame(top_right_container, fg_color="#D21404", border_width=border_thickness, border_color="black", corner_radius=0)
        frame_blue_tr_small.grid(row=0, column=0, sticky="nsew")
        frame_red_tr.grid(row=0, column=1, sticky="nsew")

        frame_blue_mid = ctk.CTkFrame(right_container, fg_color="#0047AB", border_width=border_thickness, border_color="black", corner_radius=0)
        frame_yellow_br = ctk.CTkFrame(right_container, fg_color="#F7D002", border_width=border_thickness, border_color="black", corner_radius=0)
        
        frame_blue_mid.grid(row=1, column=0, sticky="nsew")
        frame_yellow_br.grid(row=2, column=0, sticky="nsew")

        # --- 3. Add content and interactivity to the frames ---
        self.add_button(frame_yellow_tl, "PDF to PPT\nConverter", lambda: controller.show_view("pdf_converter"))
        self.populate_stats_panel(frame_red_bl, stats)
        
        # Placeholders
        self.add_button(frame_blue_tr_small, "Placeholder 1", None)
        self.add_button(frame_blue_mid, "Placeholder 2", None)
        self.add_button(frame_yellow_br, "Placeholder 3", None)

        # Close Button
        ctk.CTkButton(frame_red_tr, text="X", font=ctk.CTkFont(size=20, weight="bold"),
                      fg_color="transparent", text_color="white", hover=False,
                      command=controller.quit).pack(expand=True, fill="both")

    def add_button(self, parent_frame, text, command):
        button = ctk.CTkButton(parent_frame, text=text, command=command,
                               fg_color="transparent", hover=False,
                               font=ctk.CTkFont(size=20, weight="bold"), text_color="black")
        button.pack(expand=True, fill="both")
        if command is None:
            button.configure(state="disabled", text_color_disabled="#606060")

    def populate_stats_panel(self, parent_frame, stats):
        parent_frame.pack_propagate(False)
        parent_frame.grid_columnconfigure(0, weight=1)
        
        ctk.CTkLabel(parent_frame, text="Mondrian Converter", font=ctk.CTkFont(size=22, weight="bold"),
                     text_color="white").grid(row=0, column=0, pady=(10,5), padx=10, sticky="ew")
        ctk.CTkLabel(parent_frame, text=f"Launches: {stats['usage_count']}", font=ctk.CTkFont(size=14),
                     text_color="white").grid(row=1, column=0, pady=2, padx=10, sticky="ew")
        ctk.CTkLabel(parent_frame, text=f"Last Opened: {stats['last_opened']}", font=ctk.CTkFont(size=12),
                     text_color="white").grid(row=2, column=0, pady=2, padx=10, sticky="ew")

class MondrianApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Mondrian Converter")
        self.geometry("800x600")
        ctk.set_appearance_mode("Dark")

        # --- Manage stats ---
        stats_manager = StatsManager()
        self.stats = stats_manager.update_on_startup()

        # --- Main container to hold views ---
        self.container = ctk.CTkFrame(self, fg_color="transparent")
        self.container.pack(side="top", fill="both", expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        # --- Instantiate and store views (frames) ---
        self.views = {}
        for ViewClass, name in [(MondrianView, "mondrian"), (PdfConverterView, "pdf_converter")]:
            if name == "mondrian":
                view = ViewClass(self.container, self, self.stats)
            else: # Other views need a 'back' command
                view = ViewClass(self.container, lambda: self.show_view("mondrian"))
            self.views[name] = view
            view.grid(row=0, column=0, sticky="nsew")

        self.show_view("mondrian")

    def show_view(self, view_name):
        """Raises the requested view to the top."""
        view = self.views[view_name]
        view.tkraise()

if __name__ == "__main__":
    app = MondrianApp()
    app.mainloop()