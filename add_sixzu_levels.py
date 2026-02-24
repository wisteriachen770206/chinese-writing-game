# -*- coding: utf-8 -*-
"""Append each line of sixzu_jiesong.txt as a new level to level_config.json."""
import json
import re

def chars_only(s):
    """Keep only CJK characters for the 'characters' field."""
    return re.sub(r'[^\u4e00-\u9fff]', '', s)

def main():
    with open('sixzu_jiesong.txt', 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    with open('level_config.json', 'r', encoding='utf-8') as f:
        config = json.load(f)

    levels = config['levels']
    for i, line in enumerate(lines, 1):
        c = chars_only(line)
        levels.append({
            'id': f'sixzu_{i:03d}',
            'name': f'六祖偈頌 {i}',
            'description': line,
            'characters': c,
            'numCharacters': len(c),
            'totalStrokes': 0,
            'difficulty': 'easy',
            'maxHP': 100,
            'estimatedTime': '2-3 mins',
            'backgroundImage': 'guanyin.jpg',
            'backgroundMusic': 'XJ.mp3'
        })

    with open('level_config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"Appended {len(lines)} levels from sixzu_jiesong.txt")
    print(f"Total levels now: {len(config['levels'])}")

if __name__ == '__main__':
    main()
