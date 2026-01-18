# 汉字书写练习游戏 (Chinese Character Writing Practice Game)

An interactive web-based game for learning and practicing Chinese character writing with stroke-by-stroke guidance.

## 🎮 Live Demo

Play the game: [Your GitHub Pages URL will go here]

## ✨ Features

- **Level-based Learning**: 5 difficulty levels from basic strokes to complex characters
- **Real-time Feedback**: Direction checking with angle tolerance (±30°)
- **HP System**: Punishment system based on stroke accuracy and direction
- **Stroke-by-Stroke Guidance**: Visual guides showing correct stroke order
- **Progress Tracking**: Timer and HP bar to track performance
- **Mobile Support**: Touch and mouse input support
- **Background Music**: Optional background audio for immersive learning
- **Voice Pronunciation**: Character pronunciation support

## 📁 Project Structure

```
mySecond/
├── index.html              # Main game file
├── level_config.json       # Level definitions and character sets
├── all_strokes.json        # Stroke data for all characters
├── graphics.txt            # Raw character stroke data
├── ToWriteText.txt         # Character list for data generation
├── res/                    # Resources
│   ├── guanyin.jpg        # Background image
│   ├── XJ0106.mp3         # Background music
│   └── heart-sutra-wiki.mp3
├── package.json           # Node dependencies (for development)
└── README.md              # This file
```

## 🚀 Getting Started

### For GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Select "main" branch and "/" (root) as source
4. Your game will be live at `https://[username].github.io/mySecond/`

### Local Development

#### Simple Method (No Installation Required)

1. Clone the repository
2. Open `index.html` directly in your browser

#### With Local Server (Better for development)

**Option 1: Python**
```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

**Option 2: Node.js**
```bash
npm install -g http-server
http-server -p 8000
```

## 🎯 How to Play

1. **Select a Level**: Choose from 5 difficulty levels on the start screen
2. **Draw Strokes**: Use your mouse or finger to draw each stroke in the correct direction
3. **Direction Matters**: Draw within ±30° of the correct stroke direction for "perfect" rating
4. **Manage HP**: 
   - Perfect draws: +1 HP
   - Wrong direction: HP deduction based on angle difference
   - Start with level-specific HP (varies by difficulty)
5. **Complete Levels**: Finish all characters to unlock the next level
6. **Game Over**: HP reaches 0 - return to level selection to try again

## 🎨 Game Mechanics

### Direction Checking
- **Perfect**: Within 30° of correct stroke direction (+1 HP bonus)
- **Not Good**: Outside 30° tolerance (punishment applied)

### Punishment System
- Base: `abs(angle_difference - 30) × strokes_drawn`
- Exception 1: 2 strokes where 2nd stroke < 50% of 1st → no punishment
- Exception 2: >5 strokes and drag > 130% of remaining strokes → heavy punishment (strokes × 60)
- HP Deduction: No deduction if punishment < 50, otherwise deduction = punishment / 10

### Levels
1. **Level 1**: Basic Strokes (一二三十大小) - 100 HP
2. **Level 2**: Common Characters (人口手木水火山) - 120 HP
3. **Level 3**: Daily Words (今天好吃饭睡觉) - 150 HP
4. **Level 4**: Learning Phrases (學習寫漢字很難) - 180 HP
5. **Level 5**: Heart Sutra (Spring poem excerpt) - 200 HP

## 🛠️ Customization

### Adding New Levels

Edit `level_config.json`:
```json
{
  "id": 6,
  "name": "Your Level Name",
  "description": "Level description",
  "characters": "你的汉字",
  "numCharacters": 4,
  "totalStrokes": 20,
  "difficulty": "hard",
  "maxHP": 150,
  "estimatedTime": "5 min"
}
```

### Adding New Characters

1. Add characters to `ToWriteText.txt`
2. Run the data generation script:
   ```bash
   python get_all_strokes_from_text.py
   ```
3. This regenerates `all_strokes.json` with new character data

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

## 🔧 Technologies Used

- **Pure HTML5/CSS3/JavaScript** - No frameworks required
- **Canvas API** - For stroke rendering
- **Web Audio API** - For sound effects and pronunciation
- **LocalStorage** - For progress saving

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Credits

- Character stroke data based on Chinese character database
- Background music: Traditional Chinese meditation music
- Inspired by HanziWriter and similar character learning tools

## 🐛 Known Issues

- Some complex characters may have stroke order variations
- Touch input may be less precise than mouse on some devices

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Add new character sets
- Improve documentation

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for Chinese language learners
