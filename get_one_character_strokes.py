#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to get stroke data for one character by fetching directly from data source
Pure HTTP data-fetching approach, no browser needed
"""

import json
import sys
import io
import requests
from datetime import datetime

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def parse_svg_path(path_string):
    """Parse SVG path string to extract points"""
    if not path_string:
        return None
    
    # Match M (moveTo) and L (lineTo) commands with coordinates
    import re
    commands = re.findall(r'[MLml][\s]*([\d\.\-]+)[\s]*([\d\.\-]+)', path_string)
    if not commands:
        return None
    
    points = []
    for cmd in commands:
        try:
            x = float(cmd[0])
            y = float(cmd[1])
            points.append({'x': x, 'y': y})
        except (ValueError, IndexError):
            continue
    
    return points if len(points) > 0 else None

def calculate_stroke_angle(points):
    """Calculate stroke angle using the same logic as index.html"""
    if not points or len(points) < 2:
        return None
    
    start_point = points[0]
    
    # Find the point with maximum distance from start point
    max_distance = 0
    end_point = start_point
    end_point_index = 0
    
    for i in range(1, len(points)):
        point = points[i]
        dx = point['x'] - start_point['x']
        dy = point['y'] - start_point['y']
        distance = (dx * dx + dy * dy) ** 0.5
        
        if distance > max_distance:
            max_distance = distance
            end_point = point
            end_point_index = i
    
    # Use start and end points directly (no switching)
    final_start_point = start_point
    final_end_point = end_point
    
    # Convert stroke coordinates from bottom-left origin to screen coordinates (top-left origin)
    conversion_height = 900
    
    # Convert stroke points to screen coordinates
    start_point_screen = {
        'x': final_start_point['x'],
        'y': conversion_height - final_start_point['y']
    }
    
    end_point_screen = {
        'x': final_end_point['x'],
        'y': conversion_height - final_end_point['y']
    }
    
    # Switch start and end points if endPoint x+y < startPoint x+y (after coordinate conversion)
    final_start_point_screen = start_point_screen
    final_end_point_screen = end_point_screen
    switched = False
    
    start_sum = start_point_screen['x'] + start_point_screen['y']
    end_sum = end_point_screen['x'] + end_point_screen['y']
    
    if end_sum < start_sum:
        final_start_point_screen = end_point_screen
        final_end_point_screen = start_point_screen
        switched = True
    
    # Calculate direction vector
    dx = final_end_point_screen['x'] - final_start_point_screen['x']
    dy = final_end_point_screen['y'] - final_start_point_screen['y']
    
    # Calculate angle
    import math
    angle = math.atan2(dy, dx)
    angle_degrees = angle * 180 / math.pi
    
    # Calculate approximate length
    length = 0
    for i in range(1, len(points)):
        prev = points[i - 1]
        curr = points[i]
        length += ((curr['x'] - prev['x'])**2 + (curr['y'] - prev['y'])**2) ** 0.5
    
    return {
        'startPoint': final_start_point_screen,
        'endPoint': final_end_point_screen,
        'direction': {'dx': dx, 'dy': dy},
        'angle': angle,
        'angleDegrees': angle_degrees,
        'length': length,
        'switched': switched
    }

def get_character_data_from_graphics_txt(character):
    """Fetch character data from graphics.txt (newline-delimited JSON)"""
    url = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt'
    
    try:
        print(f"Fetching graphics.txt from: {url}")
        response = requests.get(url, timeout=30, stream=True)
        
        if response.status_code != 200:
            print(f"  HTTP {response.status_code}")
            return None
        
        print("  Parsing graphics.txt (this may take a moment)...")
        # Parse newline-delimited JSON
        for line in response.iter_lines(decode_unicode=True):
            if not line or not line.strip():
                continue
            try:
                data = json.loads(line)
                if data.get('character') == character:
                    print(f"Successfully found character data in graphics.txt")
                    return data
            except json.JSONDecodeError:
                continue
        
        print(f"  Character '{character}' not found in graphics.txt")
        return None
        
    except Exception as e:
        print(f"  Error fetching graphics.txt: {e}")
        return None

def get_character_data_from_api(character):
    """Fetch character stroke data from hanzi-writer data source"""
    # First try graphics.txt (most reliable source)
    data = get_character_data_from_graphics_txt(character)
    if data:
        return data
    
    # Fallback: try other endpoints
    import urllib.parse
    try:
        char_encoded = urllib.parse.quote(character)
        char_unicode = ord(character) if len(character) == 1 else None
    except (TypeError, ValueError):
        # Character might be mangled, try to use as-is
        char_encoded = urllib.parse.quote(character.encode('utf-8').decode('latin-1', errors='ignore'))
        char_unicode = None
    
    sources = []
    if char_unicode:
        sources.append(f'https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/{char_unicode}.json')
    sources.extend([
        f'https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/{char_encoded}.json',
        f'https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/{character}.json',
    ])
    
    for url in sources:
        try:
            print(f"Trying: {url}")
            response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            print(f"  Status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and ('strokes' in data or 'medians' in data):
                    print(f"Successfully fetched data from: {url}")
                    return data
        except Exception as e:
            print(f"  Error: {e}")
            continue
    
    return None

def process_stroke_data(char_data):
    """Process character data using the same logic as processStrokeData in index.html"""
    if not char_data or 'strokes' not in char_data:
        return {'strokes': []}
    
    processed_strokes = []
    
    # Process each stroke
    for i, raw_stroke in enumerate(char_data['strokes']):
        # Try to extract points from different sources
        extracted_points = None
        source = None
        
        # Try medians first (common in HanziWriter)
        if 'medians' in raw_stroke and raw_stroke['medians']:
            extracted_points = [{'x': m[0], 'y': m[1]} for m in raw_stroke['medians']]
            source = 'medians'
        # Try path (SVG path data)
        elif 'path' in raw_stroke and raw_stroke['path']:
            extracted_points = parse_svg_path(raw_stroke['path'])
            source = 'path'
        # Try points array
        elif 'points' in raw_stroke and raw_stroke['points']:
            extracted_points = []
            for p in raw_stroke['points']:
                if isinstance(p, list) and len(p) >= 2:
                    extracted_points.append({'x': p[0], 'y': p[1]})
                elif isinstance(p, dict) and 'x' in p and 'y' in p:
                    extracted_points.append(p)
            source = 'points'
        
        # If we got points, calculate stroke angle using calculateStrokeAngle
        if extracted_points and len(extracted_points) > 0:
            angle_data = calculate_stroke_angle(extracted_points)
            
            if angle_data:
                processed_strokes.append({
                    'index': i,
                    'startPoint': angle_data['startPoint'],
                    'endPoint': angle_data['endPoint'],
                    'direction': angle_data['direction'],
                    'angle': angle_data['angle'],
                    'angleDegrees': angle_data['angleDegrees'],
                    'length': angle_data['length'],
                    'source': source,
                    'pointsCount': len(extracted_points)
                })
    
    return {'strokes': processed_strokes}

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python get_one_character_strokes.py <character>")
        print("Example: python get_one_character_strokes.py 中")
        print("Or use Unicode: python get_one_character_strokes.py 20013")
        return
    
    # Check if argument is a Unicode code point (numeric)
    if sys.argv[1].isdigit():
        character = chr(int(sys.argv[1]))
        print(f"Using Unicode code point: {sys.argv[1]} -> {character}")
    else:
        character = sys.argv[1]
        # Handle encoding issues with command line arguments
        # Windows console encoding can mangle Chinese characters
        try:
            if isinstance(character, bytes):
                character = character.decode('utf-8')
            # If character looks mangled (common Windows issue), try to fix
            if len(character) == 1:
                unicode_val = ord(character)
                # If it's in a weird range, might be mangled
                if unicode_val < 0x4E00 or unicode_val > 0x9FFF:
                    # Might be mangled, but we'll try anyway
                    pass
        except:
            pass
    
    # Display character info
    try:
        unicode_val = ord(character)
        print(f"Getting stroke data for character: {character}")
        print(f"Character Unicode: U+{unicode_val:04X} ({unicode_val})")
        print()
    except (TypeError, ValueError):
        print(f"Getting stroke data for character: {character}")
        print(f"Warning: Could not determine Unicode value")
        print()
    
    # Fetch character data from API
    char_data = get_character_data_from_api(character)
    
    if not char_data:
        print("\\nFailed to fetch character data from all sources")
        print("The character may not be available in the data source.")
        return
    
    # Process the character data using the same logic as processStrokeData
    processed = process_stroke_data(char_data)
    
    # Prepare output
    output_data = {
        'character': character,
        'timestamp': datetime.now().isoformat(),
        'totalStrokes': len(processed['strokes']),
        'strokes': processed['strokes'],
        'rawCharData': char_data
    }
    
    # Save to file in strokes_data folder
    import os
    strokes_dir = 'strokes_data'
    if not os.path.exists(strokes_dir):
        os.makedirs(strokes_dir)
    
    # Create ASCII-safe filename (replace non-ASCII characters with Unicode code point)
    char_code = ord(character) if len(character) == 1 else 0
    safe_char_name = f'U{char_code:04X}' if char_code > 0 else 'unknown'
    output_file = os.path.join(strokes_dir, f'stroke_data_{safe_char_name}_{int(datetime.now().timestamp() * 1000)}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\\nSuccessfully saved stroke data to: {output_file}")
    print(f"Character: {output_data['character']}")
    print(f"Total strokes: {output_data['totalStrokes']}")

if __name__ == "__main__":
    main()
