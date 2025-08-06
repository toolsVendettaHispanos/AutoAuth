#!/usr/bin/env python
import os
import json

def get_dir_structure(rootpath, include_content=False):
    """
    Recursively walks a directory and returns a dictionary representing the structure.
    Optionally includes the content of .ts and .tsx files.
    """
    dir_dict = {
        'name': os.path.basename(rootpath),
        'type': 'directory',
        'children': []
    }

    try:
        # Sort the directory contents for consistent output
        dir_contents = sorted(os.listdir(rootpath))
    except OSError:
        # If the directory is not accessible, return the empty structure
        return dir_dict

    for item in dir_contents:
        item_path = os.path.join(rootpath, item)
        if os.path.isdir(item_path):
            dir_dict['children'].append(get_dir_structure(item_path, include_content))
        else:
            file_info = {'name': item, 'type': 'file'}
            # If content is requested, read .ts and .tsx files
            if include_content and (item.endswith('.ts') or item.endswith('.tsx')):
                try:
                    with open(item_path, 'r', encoding='utf-8') as f:
                        file_info['content'] = f.read()
                except Exception as e:
                    file_info['content'] = f"Error reading file: {e}"
            dir_dict['children'].append(file_info)

    return dir_dict

def main():
    """
    Main function to generate the JSON files describing the 'src' directory.
    """
    src_path = 'src'
    output_structure_only_path = 'estructura.json'
    output_with_content_path = 'estructura_y_contenido.json'

    if not os.path.isdir(src_path):
        print(f"Error: Source directory '{src_path}' not found in the current location.")
        return

    # --- Generate structure without content ---
    print(f"Generating directory structure for '{src_path}'...")
    structure_only = get_dir_structure(src_path, include_content=False)
    try:
        with open(output_structure_only_path, 'w', encoding='utf-8') as f:
            json.dump(structure_only, f, indent=2)
        print(f"Successfully created '{output_structure_only_path}'")
    except IOError as e:
        print(f"Error writing to file '{output_structure_only_path}': {e}")


    # --- Generate structure with content for .ts/.tsx files ---
    print(f"\nGenerating directory structure with file content for '{src_path}'...")
    structure_with_content = get_dir_structure(src_path, include_content=True)
    try:
        with open(output_with_content_path, 'w', encoding='utf-8') as f:
            json.dump(structure_with_content, f, indent=2)
        print(f"Successfully created '{output_with_content_path}'")
    except IOError as e:
        print(f"Error writing to file '{output_with_content_path}': {e}")


if __name__ == '__main__':
    main()
