import json

with open('../level_config.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total levels: {len(data['levels'])}")
print(f"\nFirst 3 levels:")
for i, level in enumerate(data['levels'][:3]):
    print(f"{i+1}. ID: {level['id']}, Name: {level['name'][:30]}...")
    print(f"   Characters: {level['characters'][:50]}...")
    print(f"   Num chars: {level['numCharacters']}")

print(f"\nLast 3 levels:")
for i, level in enumerate(data['levels'][-3:], len(data['levels'])-2):
    print(f"{i}. ID: {level['id']}, Name: {level['name'][:30]}...")
    print(f"   Characters: {level['characters'][:50]}...")
    print(f"   Num chars: {level['numCharacters']}")
