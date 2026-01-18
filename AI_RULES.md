# AI Rules

## Filename Requirements

All filenames must adhere to the following rules:

1. **ASCII only** - Use only ASCII characters (letters, numbers, and basic punctuation)
2. **No non-English characters** - Avoid Unicode characters, Chinese characters, emojis, or any non-ASCII symbols
3. **No spaces** - Use underscores (`_`), hyphens (`-`), or camelCase instead of spaces

### Examples

✅ **Valid filenames:**
- `stroke_data_zhong_1234567890.json`
- `get_one_character_strokes.py`
- `all-strokes-data.json`
- `characterData.json`

❌ **Invalid filenames:**
- `stroke_data_中_1234567890.json` (contains Chinese character)
- `get one character strokes.py` (contains spaces)
- `stroke-data-中.json` (contains Chinese character)
- `data_测试.json` (contains Chinese characters)

### Implementation

When creating files programmatically:
- Replace non-ASCII characters with ASCII equivalents or Unicode code points
- Replace spaces with underscores or hyphens
- Use ASCII-safe encoding for filenames
