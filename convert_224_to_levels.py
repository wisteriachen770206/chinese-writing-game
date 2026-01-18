#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert 224.txt (Tang poems) to level_config.json format
Each level contains: author name, poem name, and poem text (without punctuation)
"""

import json
import re
import sys

def remove_punctuation(text):
    """Remove all punctuation marks from text, keep only Chinese characters and spaces"""
    # Remove common Chinese and English punctuation
    punctuation = r'[，。、；：？！""''（）【】《》〈〉「」『』〔〕…—·,\.\;:?!\'"()\[\]{}<>/\-_+=*&^%$#@~`|［］]'
    return re.sub(punctuation, '', text)

def parse_poems(filename):
    """Parse 224.txt and extract poems"""
    poems = []
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    print(f"Total lines in file: {len(lines)}")
    
    # Open debug file
    debug_file = open('parse_debug.txt', 'w', encoding='utf-8')
    
    i = 0
    matches_found = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this is a title line (format: 数字作者：诗名)
        # Note: The colon might be full-width Chinese colon
        match = re.match(r'^(\d+)([^：:]+)[：:](.+)$', line)
        if match:
            matches_found += 1
            number = match.group(1)
            author = match.group(2)
            poem_title = match.group(3)
            
            # Skip empty line after title
            i += 1
            while i < len(lines) and not lines[i]:
                i += 1
            
            # Collect poem lines (non-empty lines)
            poem_lines = []
            while i < len(lines) and lines[i]:
                poem_lines.append(lines[i])
                i += 1
            
            # Combine poem lines and remove punctuation
            poem_text = ''.join(poem_lines)
            poem_text_clean = remove_punctuation(poem_text)
            
            if matches_found <= 3:
                debug_file.write(f"\nPoem {number} - {author}:{poem_title}\n")
                debug_file.write(f"  Poem lines collected: {len(poem_lines)}\n")
                debug_file.write(f"  Original text: {poem_text[:50]}\n")
                debug_file.write(f"  Clean text: {poem_text_clean[:50]}\n")
                debug_file.write(f"  Clean text length: {len(poem_text_clean)}\n")
            
            # Only add if we have valid content
            if poem_text_clean:
                poems.append({
                    'number': number,
                    'author': author,
                    'title': poem_title,
                    'text': poem_text_clean,
                    'original_text': ''.join(poem_lines)
                })
        
        i += 1
    
    debug_file.close()
    print(f"Matches found: {matches_found}")
    print(f"Poems extracted: {len(poems)}")
    return poems

def create_level_config(poems):
    """Create level_config.json structure from poems"""
    levels = []
    
    for idx, poem in enumerate(poems):
        # Get all unique characters from the poem (no punctuation)
        characters = ''.join(sorted(set(poem['text'])))
        
        # Determine difficulty based on index
        # First 30: easy, next 30: medium, rest: hard
        if idx < 30:
            difficulty = "easy"
            max_hp = 100
        elif idx < 60:
            difficulty = "medium"
            max_hp = 150
        else:
            difficulty = "hard"
            max_hp = 200
        
        level = {
            "id": f"poem_{poem['number']}",
            "name": f"{poem['author']}：{poem['title']}",
            "description": poem['original_text'][:30] + "...",
            "characters": poem['text'],
            "numCharacters": len(poem['text']),  # Total characters, not unique
            "totalStrokes": 0,  # Will need to calculate
            "difficulty": difficulty,
            "maxHP": max_hp,
            "estimatedTime": "2-3 mins"
        }
        levels.append(level)
    
    # Create full config structure
    config = {
        "levels": levels,
        "difficulties": {
            "easy": {
                "punishmentMultiplier": 1,
                "perfectHPBonus": 1,
                "strokesPerCharacter": 10
            },
            "medium": {
                "punishmentMultiplier": 1.5,
                "perfectHPBonus": 1,
                "strokesPerCharacter": 15
            },
            "hard": {
                "punishmentMultiplier": 2,
                "perfectHPBonus": 2,
                "strokesPerCharacter": 20
            }
        },
        "gameSettings": {
            "defaultMaxHP": 100,
            "hpDecreasePerStroke": 2,
            "perfectAngleThreshold": 30
        }
    }
    
    return config

def main():
    input_file = '224.txt'
    output_file = 'level_config.json'
    
    print(f"Reading poems from {input_file}...")
    poems = parse_poems(input_file)
    print(f"Found {len(poems)} poems")
    
    # Show first few poems as sample
    print("\nFirst 3 poems written to sample_poems.txt")
    
    print(f"\nCreating level config...")
    config = create_level_config(poems)
    
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OK] Successfully created {output_file}")
    print(f"  Total levels: {len(config['levels'])}")
    print(f"  Use a text editor to view {output_file} with Chinese characters")

if __name__ == '__main__':
    main()
