#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to get stroke data for all characters in ToWriteText.txt
"""

import json
import sys
import io
import os
from datetime import datetime

# Import functions from get_one_character_strokes
from get_one_character_strokes import (
    parse_svg_path,
    calculate_stroke_angle,
    process_stroke_data
)

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def read_characters_from_file(filename):
    """Read all characters from a text file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        # Extract unique characters (preserve order)
        unique_chars = []
        seen = set()
        for char in content:
            # Only process Chinese characters (CJK Unified Ideographs)
            if '\u4e00' <= char <= '\u9fff' and char not in seen:
                unique_chars.append(char)
                seen.add(char)
        
        return unique_chars
    except Exception as e:
        print(f"Error reading file {filename}: {e}")
        return []

def download_graphics_txt(local_file='graphics.txt'):
    """Download graphics.txt and save it locally"""
    import requests
    
    url = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt'
    
    # Check if file already exists locally
    if os.path.exists(local_file):
        print(f"Local graphics.txt found: {local_file}")
        print(f"  File size: {os.path.getsize(local_file) / (1024*1024):.2f} MB")
        return True
    
    try:
        print(f"Downloading graphics.txt from: {url}")
        print("  This may take a few minutes (file is large)...")
        response = requests.get(url, timeout=300, stream=True)  # 5 minute timeout
        
        if response.status_code != 200:
            print(f"  HTTP {response.status_code}")
            return False
        
        # Download and save to local file
        total_size = 0
        with open(local_file, 'w', encoding='utf-8') as f:
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    f.write(line + '\n')
                    total_size += len(line.encode('utf-8'))
                    if total_size % (10 * 1024 * 1024) == 0:  # Print every 10MB
                        print(f"  Downloaded: {total_size / (1024*1024):.2f} MB...")
        
        print(f"  Successfully saved to: {local_file}")
        print(f"  Total size: {total_size / (1024*1024):.2f} MB")
        return True
        
    except Exception as e:
        print(f"  Error downloading graphics.txt: {e}")
        if os.path.exists(local_file):
            os.remove(local_file)
        return False

def fetch_all_characters_from_graphics_txt(characters_set, local_file='graphics.txt'):
    """Fetch character data for multiple characters from local graphics.txt file"""
    character_data_map = {}
    
    if not os.path.exists(local_file):
        print(f"Error: Local file '{local_file}' not found")
        return character_data_map
    
    try:
        print(f"Reading from local file: {local_file}")
        print("  Parsing graphics.txt for all characters...")
        found_count = 0
        
        with open(local_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                if not line or not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    char = data.get('character')
                    if char and char in characters_set:
                        character_data_map[char] = data
                        found_count += 1
                        if found_count == len(characters_set):
                            print(f"  Found all {found_count} characters!")
                            break
                        if found_count % 10 == 0:
                            print(f"  Found {found_count}/{len(characters_set)} characters...")
                except json.JSONDecodeError:
                    continue
                
                # Progress indicator for large files
                if line_num % 10000 == 0:
                    print(f"  Processed {line_num} lines, found {found_count} characters...")
        
        print(f"  Total found: {found_count}/{len(characters_set)}")
        return character_data_map
        
    except Exception as e:
        print(f"  Error reading graphics.txt: {e}")
        return character_data_map

def main():
    """Main function"""
    input_file = 'ToWriteText.txt'
    
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found")
        return
    
    print(f"Reading characters from: {input_file}")
    characters = read_characters_from_file(input_file)
    
    if not characters:
        print("No Chinese characters found in the file")
        return
    
    print(f"Found {len(characters)} unique characters")
    print(f"Characters: {''.join(characters[:20])}{'...' if len(characters) > 20 else ''}")
    print()
    
    # Download graphics.txt locally if needed, then fetch character data
    print()
    print("Step 1: Download graphics.txt (if needed)...")
    if not download_graphics_txt():
        print("Failed to download graphics.txt. Exiting.")
        return
    
    print()
    print("Step 2: Fetching character data from local file...")
    characters_set = set(characters)
    character_data_map = fetch_all_characters_from_graphics_txt(characters_set, local_file='graphics.txt')
    
    # Process all characters
    all_strokes_data = {}
    failed_characters = []
    
    print()
    print("Processing stroke data...")
    for i, character in enumerate(characters, 1):
        try:
            unicode_val = ord(character)
            print(f"[{i}/{len(characters)}] Processing: {character} (U+{unicode_val:04X})")
            
            # Get character data from the map (local file only, no network needed)
            char_data = character_data_map.get(character)
            
            if not char_data:
                print(f"  Failed to fetch data for {character}")
                failed_characters.append(character)
                continue
            
            # Process the stroke data
            processed = process_stroke_data(char_data)
            
            # Store the data
            all_strokes_data[character] = {
                'character': character,
                'unicode': unicode_val,
                'unicodeHex': f'U+{unicode_val:04X}',
                'totalStrokes': len(processed['strokes']),
                'strokes': processed['strokes'],
                'rawCharData': char_data
            }
            
            print(f"  Success: {len(processed['strokes'])} strokes")
            
        except Exception as e:
            print(f"  Error processing {character}: {e}")
            failed_characters.append(character)
            continue
    
    # Prepare output
    output_data = {
        'sourceFile': input_file,
        'timestamp': datetime.now().isoformat(),
        'totalCharacters': len(characters),
        'successfulCharacters': len(all_strokes_data),
        'failedCharacters': len(failed_characters),
        'characters': all_strokes_data
    }
    
    if failed_characters:
        output_data['failedCharacterList'] = failed_characters
    
    # Save to file
    output_file = 'all_strokes.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print(f"Summary:")
    print(f"  Total characters: {len(characters)}")
    print(f"  Successful: {len(all_strokes_data)}")
    print(f"  Failed: {len(failed_characters)}")
    print(f"  Output file: {output_file}")
    print("=" * 60)
    
    if failed_characters:
        print(f"\nFailed characters: {''.join(failed_characters)}")

if __name__ == "__main__":
    main()
