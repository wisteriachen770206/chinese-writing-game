#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('level_config.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

output = open('difficulty_check.txt', 'w', encoding='utf-8')

# Check first 5 (should be easy)
output.write("First 5 levels (should be EASY):\n")
for i in range(5):
    level = data['levels'][i]
    output.write(f"{i+1}. {level['id']}: {level['name']}\n")
    output.write(f"   Difficulty: {level['difficulty']}, MaxHP: {level['maxHP']}\n\n")

# Check levels 28-32 (should transition easy->medium)
output.write("\nLevels 28-32 (transition EASY to MEDIUM):\n")
for i in range(27, 32):
    level = data['levels'][i]
    output.write(f"{i+1}. {level['id']}: {level['name']}\n")
    output.write(f"   Difficulty: {level['difficulty']}, MaxHP: {level['maxHP']}\n\n")

# Check levels 58-62 (should transition medium->hard)
output.write("\nLevels 58-62 (transition MEDIUM to HARD):\n")
for i in range(57, 62):
    level = data['levels'][i]
    output.write(f"{i+1}. {level['id']}: {level['name']}\n")
    output.write(f"   Difficulty: {level['difficulty']}, MaxHP: {level['maxHP']}\n\n")

# Check last 5 (should be hard)
output.write("\nLast 5 levels (should be HARD):\n")
for i in range(len(data['levels'])-5, len(data['levels'])):
    level = data['levels'][i]
    output.write(f"{i+1}. {level['id']}: {level['name']}\n")
    output.write(f"   Difficulty: {level['difficulty']}, MaxHP: {level['maxHP']}\n\n")

# Count by difficulty
easy_count = sum(1 for l in data['levels'] if l['difficulty'] == 'easy')
medium_count = sum(1 for l in data['levels'] if l['difficulty'] == 'medium')
hard_count = sum(1 for l in data['levels'] if l['difficulty'] == 'hard')

output.write("\n" + "="*50 + "\n")
output.write(f"Summary:\n")
output.write(f"  Easy levels: {easy_count}\n")
output.write(f"  Medium levels: {medium_count}\n")
output.write(f"  Hard levels: {hard_count}\n")
output.write(f"  Total: {len(data['levels'])}\n")

output.close()
print("Difficulty verification written to difficulty_check.txt")
