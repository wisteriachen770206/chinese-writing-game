# -*- coding: utf-8 -*-
"""
Read sixzu2.txt, split poem into levels (2 lines per level).
Replace spaces with comma, keep comma in characters.
Append to level_config.json.
"""
import json
import re

INPUT_FILE = 'sixzu2.txt'
COMMA = '，'  # Chinese comma

def space_to_comma(s):
    """Replace full-width space (U+3000) and regular space with comma."""
    s = s.replace('\u3000', COMMA).replace(' ', COMMA)
    return s.strip()

def main():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        text = f.read()

    # Split into stanzas by blank lines (one or more newlines with optional spaces)
    stanzas = re.split(r'\n\s*\n', text)

    levels = []
    for stanza in stanzas:
        lines = [space_to_comma(line) for line in stanza.split('\n') if line.strip()]
        if not lines:
            continue
        # Group into pairs: each level gets up to 2 lines
        for i in range(0, len(lines), 2):
            chunk = lines[i:i+2]
            level_text = COMMA.join(chunk)
            # characters: keep commas (user asked to keep comma in characters)
            characters = level_text
            n = len(characters)
            levels.append({
                'id': f'sixzu2_{len(levels)+1:03d}',
                'name': f'六祖偈頌2 {len(levels)+1}',
                'description': level_text,
                'characters': characters,
                'numCharacters': n,
                'totalStrokes': 0,
                'difficulty': 'easy',
                'maxHP': 100,
                'estimatedTime': '2-3 mins',
                'backgroundImage': 'guanyin.jpg',
                'backgroundMusic': 'rain.mp3'
            })

    with open('level_config.json', 'r', encoding='utf-8') as f:
        config = json.load(f)

    config['levels'].extend(levels)

    with open('level_config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"Added {len(levels)} levels from {INPUT_FILE}")
    print(f"Total levels now: {len(config['levels'])}")

if __name__ == '__main__':
    main()
