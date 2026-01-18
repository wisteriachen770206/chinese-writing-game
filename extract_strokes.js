
const fs = require('fs');
const HanziWriter = require('hanzi-writer');

async function getStrokeData(character) {
    return new Promise((resolve, reject) => {
        // Create a temporary writer to get data
        const writer = HanziWriter.create('temp', character, {
            width: 600,
            height: 600,
            padding: 50
        });
        
        // Wait for data to load
        setTimeout(() => {
            try {
                let charData = null;
                if (writer.getCharacterData) {
                    charData = writer.getCharacterData();
                } else if (writer._charData) {
                    charData = writer._charData;
                }
                
                if (charData && charData.strokes) {
                    const strokes = charData.strokes.map((stroke, index) => {
                        let points = null;
                        let source = null;
                        
                        if (stroke.medians && stroke.medians.length > 0) {
                            points = stroke.medians.map(m => ({ x: m[0], y: m[1] }));
                            source = 'medians';
                        } else if (stroke.path) {
                            source = 'path';
                            // Parse path if needed
                        } else if (stroke.points && stroke.points.length > 0) {
                            points = stroke.points.map(p => 
                                Array.isArray(p) ? { x: p[0], y: p[1] } : p
                            );
                            source = 'points';
                        }
                        
                        // Calculate angle from points
                        let angleData = null;
                        if (points && points.length > 0) {
                            const startPoint = points[0];
                            const endPoint = points[points.length - 1];
                            
                            // Find max distance point
                            let maxDist = 0;
                            let maxPoint = endPoint;
                            for (let p of points) {
                                const dx = p.x - startPoint.x;
                                const dy = p.y - startPoint.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist > maxDist) {
                                    maxDist = dist;
                                    maxPoint = p;
                                }
                            }
                            
                            // Convert coordinates (900 - y)
                            const conversionHeight = 900;
                            const startScreen = { x: startPoint.x, y: conversionHeight - startPoint.y };
                            const endScreen = { x: maxPoint.x, y: conversionHeight - maxPoint.y };
                            
                            // Switch if end x+y < start x+y
                            let finalStart = startScreen;
                            let finalEnd = endScreen;
                            if (endScreen.x + endScreen.y < startScreen.x + startScreen.y) {
                                finalStart = endScreen;
                                finalEnd = startScreen;
                            }
                            
                            const dx = finalEnd.x - finalStart.x;
                            const dy = finalEnd.y - finalStart.y;
                            const angle = Math.atan2(dy, dx);
                            
                            angleData = {
                                startPoint: finalStart,
                                endPoint: finalEnd,
                                direction: { dx, dy },
                                angle: angle,
                                angleDegrees: angle * 180 / Math.PI,
                                length: maxDist
                            };
                        }
                        
                        return {
                            index: index,
                            startPoint: angleData ? angleData.startPoint : null,
                            endPoint: angleData ? angleData.endPoint : null,
                            direction: angleData ? angleData.direction : null,
                            angle: angleData ? angleData.angle : null,
                            angleDegrees: angleData ? angleData.angleDegrees : null,
                            length: angleData ? angleData.length : null,
                            source: source,
                            pointsCount: points ? points.length : 0
                        };
                    });
                    
                    resolve({
                        character: character,
                        totalStrokes: strokes.length,
                        strokes: strokes
                    });
                } else {
                    resolve({
                        character: character,
                        totalStrokes: 0,
                        strokes: []
                    });
                }
            } catch (error) {
                reject(error);
            }
        }, 500);
    });
}

async function processAllCharacters() {
    const fs = require('fs');
    const text = fs.readFileSync('ToWriteText.txt', 'utf-8').trim();
    const characters = [...new Set(text.replace(/\s/g, '').split(''))];
    
    console.log(`Processing ${characters.length} unique characters...`);
    
    const allData = {
        timestamp: new Date().toISOString(),
        totalCharacters: characters.length,
        characters: []
    };
    
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        try {
            const charData = await getStrokeData(char);
            allData.characters.push(charData);
            if ((i + 1) % 10 === 0) {
                console.log(`Processed ${i + 1}/${characters.length} characters...`);
            }
        } catch (error) {
            console.error(`Error processing ${char}:`, error.message);
            allData.characters.push({
                character: char,
                totalStrokes: 0,
                strokes: [],
                error: error.message
            });
        }
    }
    
    fs.writeFileSync('all_strokes.json', JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`\nSaved to all_strokes.json`);
    console.log(`Total characters processed: ${allData.characters.length}`);
}

processAllCharacters().catch(console.error);
