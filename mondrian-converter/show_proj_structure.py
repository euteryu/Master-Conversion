import os

# --- Configuration: Customize these lists ---

# Folders to completely ignore (won't even look inside them)
IGNORED_FOLDERS = {
    '__pycache__', 
    'node_modules', 
    '.git', 
    '.vscode', 
    'build', 
    'dist',
    '.cache'
}

# Specific files to ignore by name
IGNORED_FILES = {
    '.gitignore', 
    'package.json', 
    'package-lock.json',
    'README.md',
    'postcss.config.js',
    'tailwind.config.js'
}
# --- End of Configuration ---


def generate_tree(start_path, output_file):
    """
    Main function to generate and save the directory tree.
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write the root directory name first
            root_name = os.path.basename(os.path.abspath(start_path))
            f.write(f"{root_name}/\n")
            # Start the recursive listing from the root
            list_items_recursively(start_path, f, prefix="")
        
        print(f"Project structure has been successfully saved to '{output_file}'")

    except Exception as e:
        print(f"An error occurred: {e}")


def list_items_recursively(directory, file_handle, prefix=""):
    """
    A recursive function that walks through a directory and prints its structure.
    """
    # Get all items in the directory, then filter out the ignored ones
    items = [
        item for item in os.listdir(directory) 
        if item not in IGNORED_FOLDERS and item not in IGNORED_FILES
    ]
    items.sort() # Sort for consistent order

    for i, item in enumerate(items):
        path = os.path.join(directory, item)
        is_last = (i == len(items) - 1)

        # Determine the connector for the current item
        connector = "└── " if is_last else "├── "
        file_handle.write(f"{prefix}{connector}{item}\n")

        # If the item is a directory, recurse into it
        if os.path.isdir(path):
            # The prefix for the next level depends on whether this was the last item
            next_prefix = prefix + ("    " if is_last else "│   ")
            list_items_recursively(path, file_handle, prefix=next_prefix)


# --- How to use ---
if __name__ == "__main__":
    # The script will map the structure of the directory it is in.
    start_directory = '.'
    
    # The name of the output text file.
    output_filename = 'clean_project_structure.txt'
    
    # Run the main function
    generate_tree(start_directory, output_filename)