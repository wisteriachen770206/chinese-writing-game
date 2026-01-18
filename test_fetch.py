#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick test to fetch character data"""

import requests
import json

character = '中'  # Hardcoded for testing
print(f"Testing fetch for character: {character} (U+{ord(character):04X})")

url = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt'
print(f"Fetching: {url}")

response = requests.get(url, timeout=30, stream=True)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    count = 0
    found = False
    for line in response.iter_lines(decode_unicode=True):
        if not line or not line.strip():
            continue
        try:
            data = json.loads(line)
            count += 1
            if data.get('character') == character:
                print(f"\nFound! Line {count}")
                print(f"Keys: {list(data.keys())}")
                print(f"Has strokes: {'strokes' in data}")
                print(f"Has medians: {'medians' in data}")
                if 'strokes' in data:
                    print(f"Number of strokes: {len(data['strokes'])}")
                found = True
                break
            if count % 1000 == 0:
                print(f"Processed {count} characters...")
        except json.JSONDecodeError:
            continue
    
    if not found:
        print(f"\nCharacter not found after checking {count} characters")
else:
    print(f"Failed to fetch: HTTP {response.status_code}")
