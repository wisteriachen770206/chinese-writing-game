#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract lines that begin with '偈頌：' from sixzu.txt,
strip the '偈頌：' prefix, and write to a new file.
"""

INPUT_FILE = 'sixzu.txt'
OUTPUT_FILE = 'sixzu_jiesong.txt'
PREFIX = '偈頌：'

def main():
    lines_out = []
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            s = line.rstrip('\n\r')
            if s.startswith(PREFIX):
                lines_out.append(s[len(PREFIX):])

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines_out))
        if lines_out:
            f.write('\n')

    print(f"Read {INPUT_FILE}")
    print(f"Extracted {len(lines_out)} lines")
    print(f"Wrote to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
