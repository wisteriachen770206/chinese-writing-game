#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import sys
import io

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    except:
        pass

with open('../data/all_strokes.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = list(data['characters'].keys())
print(f'Total characters: {len(chars)}')
print(f'First 30: {"".join(chars[:30])}')
print()
print('Level 1 characters (一二三十大小):')
for c in '一二三十大小':
    exists = c in data['characters']
    if exists:
        strokes = data['characters'][c].get('totalStrokes', 0)
        print(f'  {c}: ✓ ({strokes} strokes)')
    else:
        print(f'  {c}: ✗ MISSING')
