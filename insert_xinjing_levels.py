# -*- coding: utf-8 -*-
"""
Read xinjing.txt, each line -> one level.
Insert after xinjing_001 with ids xinjing_002, xinjing_003, ...
Keep punctuation in characters. Name = first sentence of line.
"""
import json

INPUT_FILE = 'xinjing.txt'
SEPS = ('\uFF0C', '\u3001', ',', '\u3002', '.', '\uFF1B', ';', '\uFF1A', ':')

def first_sentence(text):
    idx = -1
    for sep in SEPS:
        i = text.find(sep)
        if i != -1 and (idx == -1 or i < idx):
            idx = i
    s = (text[:idx] if idx != -1 else text).strip()
    return s if s else text[:20]

def main():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    with open('level_config.json', 'r', encoding='utf-8') as f:
        config = json.load(f)

    levels = config['levels']
    insert_idx = None
    for i, lev in enumerate(levels):
        if lev.get('id') == 'xinjing_001':
            insert_idx = i + 1
            break
    if insert_idx is None:
        print('xinjing_001 not found')
        return

    new_levels = []
    for k, line in enumerate(lines):
        new_levels.append({
            'id': f'xinjing_{k+2:03d}',
            'name': first_sentence(line),
            'description': line,
            'characters': line,
            'numCharacters': len(line),
            'totalStrokes': 0,
            'difficulty': 'easy',
            'maxHP': 100,
            'estimatedTime': '2-3 mins',
            'backgroundImage': 'guanyin.jpg',
            'backgroundMusic': 'XJ.mp3'
        })

    config['levels'] = levels[:insert_idx] + new_levels + levels[insert_idx:]

    with open('level_config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print('Inserted', len(new_levels), 'xinjing levels after xinjing_001')
    print('Total levels:', len(config['levels']))

if __name__ == '__main__':
    main()
