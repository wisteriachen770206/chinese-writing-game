
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// calculateStrokeAngle function (exact copy from index.html)
function calculateStrokeAngle(points) {
    if (!points || points.length < 2) {
        return null;
    }
    
    const startPoint = points[0];
    
    // Find the point with maximum distance from start point
    let maxDistance = 0;
    let endPoint = startPoint;
    let endPointIndex = 0;
    
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > maxDistance) {
            maxDistance = distance;
            endPoint = point;
            endPointIndex = i;
        }
    }
    
    // Use start and end points directly (no switching)
    const finalStartPoint = startPoint;
    const finalEndPoint = endPoint;
    
    // Convert stroke coordinates from bottom-left origin to screen coordinates (top-left origin)
    const conversionHeight = 900;
    
    // Convert stroke points to screen coordinates
    let startPointScreen = {
        x: finalStartPoint.x,
        y: conversionHeight - finalStartPoint.y
    };
    
    let endPointScreen = {
        x: finalEndPoint.x,
        y: conversionHeight - finalEndPoint.y
    };
    
    // Switch start and end points if endPoint x+y < startPoint x+y (after coordinate conversion)
    let finalStartPointScreen = startPointScreen;
    let finalEndPointScreen = endPointScreen;
    let switched = false;
    
    const startSum = startPointScreen.x + startPointScreen.y;
    const endSum = endPointScreen.x + endPointScreen.y;
    
    if (endSum < startSum) {
        finalStartPointScreen = endPointScreen;
        finalEndPointScreen = startPointScreen;
        switched = true;
    }
    
    // Calculate direction vector
    const dx = finalEndPointScreen.x - finalStartPointScreen.x;
    const dy = finalEndPointScreen.y - finalStartPointScreen.y;
    
    // Calculate angle
    const angle = Math.atan2(dy, dx);
    const angleDegrees = angle * 180 / Math.PI;
    
    // Calculate approximate length
    let length = 0;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        length += Math.sqrt(
            Math.pow(curr.x - prev.x, 2) + 
            Math.pow(curr.y - prev.y, 2)
        );
    }
    
    return {
        startPoint: finalStartPointScreen,
        endPoint: finalEndPointScreen,
        direction: { dx, dy },
        angle: angle,
        angleDegrees: angleDegrees,
        length: length,
        switched: switched
    };
}

// parseSVGPath function (exact copy from processStrokeData)
function parseSVGPath(pathString) {
    if (!pathString) return null;
    const commands = pathString.match(/[MLml][\s]*([\d\.\-]+)[\s]*([\d\.\-]+)/g);
    if (!commands || commands.length === 0) return null;
    
    const points = [];
    for (let cmd of commands) {
        const coords = cmd.match(/[\d\.\-]+/g);
        if (coords && coords.length >= 2) {
            points.push({ x: parseFloat(coords[0]), y: parseFloat(coords[1]) });
        }
    }
    return points.length > 0 ? points : null;
}

// processStrokeData logic (exact copy from index.html)
function processStrokeData(charData) {
    if (!charData || !charData.strokes) {
        return { strokes: [] };
    }
    
    const processedStrokes = [];
    
    // Process each stroke
    for (let i = 0; i < charData.strokes.length; i++) {
        const rawStroke = charData.strokes[i];
        
        // Try to extract points from different sources
        let extractedPoints = null;
        let source = null;
        
        // Try medians first (common in HanziWriter)
        if (rawStroke.medians && rawStroke.medians.length > 0) {
            extractedPoints = rawStroke.medians.map(m => ({ x: m[0], y: m[1] }));
            source = 'medians';
        } 
        // Try path (SVG path data)
        else if (rawStroke.path) {
            extractedPoints = parseSVGPath(rawStroke.path);
            source = 'path';
        }
        // Try points array
        else if (rawStroke.points && rawStroke.points.length > 0) {
            extractedPoints = rawStroke.points.map(p => {
                if (Array.isArray(p)) {
                    return { x: p[0], y: p[1] };
                }
                return p;
            });
            source = 'points';
        }
        
        // If we got points, calculate stroke angle using calculateStrokeAngle
        if (extractedPoints && extractedPoints.length > 0) {
            const angleData = calculateStrokeAngle(extractedPoints);
            
            if (angleData) {
                processedStrokes.push({
                    index: i,
                    startPoint: angleData.startPoint,
                    endPoint: angleData.endPoint,
                    direction: angleData.direction,
                    angle: angleData.angle,
                    angleDegrees: angleData.angleDegrees,
                    length: angleData.length,
                    source: source,
                    pointsCount: extractedPoints.length
                });
            }
        }
    }
    
    return { strokes: processedStrokes };
}

async function processAllCharacters() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Load hanzi-writer from CDN
    await page.goto('data:text/html,<html><head></head><body><div id="temp"></div></body></html>');
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.2.0/dist/hanzi-writer.min.js' });
    await page.waitForFunction(() => typeof HanziWriter !== 'undefined', { timeout: 10000 });
    
    // Read characters from ToWriteText.txt
    const text = fs.readFileSync('ToWriteText.txt', 'utf-8').trim();
    const characters = [...new Set(text.replace(/\s/g, '').split(''))];
    
    console.log(`Processing ${characters.length} unique characters...`);
    
    const allData = {
        timestamp: new Date().toISOString(),
        totalCharacters: characters.length,
        characters: []
    };
    
    // Process each character
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        try {
            const charData = await page.evaluate(async (character) => {
                return new Promise((resolve, reject) => {
                    try {
                        const writer = HanziWriter.create('temp', character, {
                            width: 600,
                            height: 600,
                            padding: 50,
                            strokeColor: '#ffffff',
                            strokeWidth: 20,
                            showOutline: false,
                            showCharacter: false
                        });
                        
                        setTimeout(() => {
                            try {
                                let charData = null;
                                if (writer.getCharacterData) {
                                    const result = writer.getCharacterData();
                                    if (result && typeof result.then === 'function') {
                                        result.then(data => resolve(data)).catch(reject);
                                        return;
                                    } else {
                                        charData = result;
                                    }
                                } else if (writer._charData) {
                                    charData = writer._charData;
                                }
                                
                                if (charData) {
                                    resolve(charData);
                                } else {
                                    reject(new Error('No character data'));
                                }
                            } catch (error) {
                                reject(error);
                            }
                        }, 1500);
                    } catch (error) {
                        reject(error);
                    }
                });
            }, char);
            
            // Process the character data using the same logic as processStrokeData
            const processed = processStrokeData(charData);
            
            allData.characters.push({
                character: char,
                totalStrokes: processed.strokes.length,
                strokes: processed.strokes
            });
            
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
    
    await browser.close();
    
    // Save to file
    fs.writeFileSync('all_strokes.json', JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`\nSaved to all_strokes.json`);
    console.log(`Total characters processed: ${allData.characters.length}`);
}

processAllCharacters().catch(console.error);
