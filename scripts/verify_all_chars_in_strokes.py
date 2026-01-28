#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to verify that all characters in level_config.json exist in data/all_strokes.json
"""

import json
import sys
import io
from collections import defaultdict

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def verify_all_characters():
    """Verify all characters from level_config.json exist in all_strokes.json"""
    
    # Load level_config.json
    try:
        with open('../level_config.json', 'r', encoding='utf-8') as f:
            level_config = json.load(f)
    except FileNotFoundError:
        print("❌ Error: level_config.json not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing level_config.json: {e}")
        return False
    
    # Load all_strokes.json
    try:
        with open('../data/all_strokes.json', 'r', encoding='utf-8') as f:
            strokes_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: data/all_strokes.json not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing all_strokes.json: {e}")
        return False
    
    # Get all characters from all_strokes.json
    if 'characters' in strokes_data:
        available_chars = set(strokes_data['characters'].keys())
    else:
        print("❌ Error: all_strokes.json doesn't have 'characters' key")
        return False
    
    print(f"✅ Loaded {len(available_chars)} characters from all_strokes.json")
    print(f"✅ Checking {len(level_config.get('levels', []))} levels from level_config.json\n")
    
    # Collect all characters from all levels
    all_chars_from_levels = set()
    missing_by_level = defaultdict(list)
    level_info = []
    
    for level in level_config.get('levels', []):
        level_id = level.get('id', 'unknown')
        level_name = level.get('name', 'Unknown')
        characters = level.get('characters', '')
        
        level_chars = set(characters)
        all_chars_from_levels.update(level_chars)
        
        missing = [c for c in level_chars if c not in available_chars]
        if missing:
            missing_by_level[level_id] = missing
            level_info.append({
                'id': level_id,
                'name': level_name,
                'total_chars': len(level_chars),
                'missing': missing,
                'missing_count': len(missing)
            })
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total unique characters in level_config.json: {len(all_chars_from_levels)}")
    print(f"Total characters in all_strokes.json: {len(available_chars)}")
    
    missing_total = all_chars_from_levels - available_chars
    if missing_total:
        print(f"\n❌ MISSING CHARACTERS: {len(missing_total)}")
        print(f"Missing: {''.join(sorted(missing_total))}")
    else:
        print(f"\n✅ ALL CHARACTERS FOUND!")
    
    # Report by level
    if missing_by_level:
        print("\n" + "=" * 70)
        print("LEVELS WITH MISSING CHARACTERS")
        print("=" * 70)
        for info in sorted(level_info, key=lambda x: x['missing_count'], reverse=True):
            print(f"\nLevel {info['id']}: {info['name']}")
            print(f"  Total chars: {info['total_chars']}")
            print(f"  Missing: {info['missing_count']} - {''.join(info['missing'])}")
    else:
        print("\n✅ All levels have all their characters in all_strokes.json!")
    
    return len(missing_total) == 0

if __name__ == '__main__':
    success = verify_all_characters()
    sys.exit(0 if success else 1)
