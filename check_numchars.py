#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('level_config.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

output = open('check_results.txt', 'w', encoding='utf-8')

output.write("Checking numCharacters field:\n\n")

for i, level in enumerate(data['levels'][:10]):
    chars = level['characters']
    num_chars_field = level['numCharacters']
    actual_total = len(chars)
    actual_unique = len(set(chars))
    
    output.write(f"Level {i+1} ({level['id']}):\n")
    output.write(f"  Name: {level['name']}\n")
    output.write(f"  Characters (first 40): {chars[:40]}\n")
    output.write(f"  numCharacters field: {num_chars_field}\n")
    output.write(f"  Actual total chars: {actual_total}\n")
    output.write(f"  Actual unique chars: {actual_unique}\n")
    output.write(f"  Match? {num_chars_field == actual_total or num_chars_field == actual_unique}\n")
    output.write("\n")

output.close()
print("Results written to check_results.txt")
