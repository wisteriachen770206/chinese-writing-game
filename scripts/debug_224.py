#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('../224.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f.readlines()]

with open('debug_output.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total lines: {len(lines)}\n\n")
    
    for i, line in enumerate(lines[:20]):
        out.write(f"Line {i}: {repr(line)}\n")
        if line:
            # Try different regex patterns
            match1 = re.match(r'^(\d+)(.+?)：(.+)$', line)
            match2 = re.match(r'^(\d+)([^：:]+)[：:](.+)$', line)
            match3 = re.match(r'^\d+.+[：:]', line)
            
            out.write(f"  Pattern 1: {bool(match1)}\n")
            out.write(f"  Pattern 2: {bool(match2)}\n")
            out.write(f"  Pattern 3: {bool(match3)}\n")
            
            if match2:
                out.write(f"  Groups: {match2.groups()}\n")
        out.write("\n")

print("Debug output written to debug_output.txt")
