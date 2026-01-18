# Stroke Data Structure Design

## Overview
This document defines the structure for storing Chinese character stroke data, including raw data from sources and processed data for rendering and comparison.

## Main Data Structure

### Character Stroke Data Container
```javascript
{
    // Character identification
    character: string,              // The Chinese character (e.g., "中")
    unicode: number,                // Unicode code point (e.g., 20013)
    unicodeHex: string,             // Unicode in hex format (e.g., "U+4E2D")
    
    // Metadata
    timestamp: string,              // ISO 8601 timestamp when data was created
    version: string,                // Data structure version (e.g., "1.0")
    source: string,                 // Data source (e.g., "makemeahanzi", "hanzi-writer")
    
    // Stroke information
    totalStrokes: number,           // Total number of strokes
    strokes: StrokeData[],          // Array of stroke data objects
    
    // Raw data (optional, for reference)
    rawCharData: RawCharacterData   // Original unprocessed data from source
}
```

## Stroke Data Object

### StrokeData Structure
```javascript
{
    // Identification
    index: number,                  // Stroke index (0-based, in writing order)
    
    // Geometry - Points
    points: Point[],                // All points along the stroke path
    pointCount: number,             // Number of points in the stroke
    
    // Geometry - Key Points
    startPoint: Point,              // Starting point of the stroke
    endPoint: Point,                // Ending point of the stroke
    maxDistancePoint: Point,        // Point with maximum distance from start
    
    // Geometry - Direction & Angle
    direction: {
        dx: number,                 // X component of direction vector
        dy: number                  // Y component of direction vector
    },
    angle: number,                  // Angle in radians (using Math.atan2)
    angleDegrees: number,           // Angle in degrees (0-360)
    
    // Geometry - Measurements
    length: number,                 // Approximate total length of stroke path
    maxDistance: number,            // Maximum distance from start to any point
    
    // Coordinate System Information
    coordinateSystem: {
        origin: string,              // "bottom-left" or "top-left"
        conversionHeight: number,    // Reference height for coordinate conversion (e.g., 900)
        converted: boolean           // Whether coordinates have been converted to screen space
    },
    
    // Processing Metadata
    source: string,                 // Data source: "medians", "path", "points"
    processed: boolean,             // Whether this stroke has been processed
    switched: boolean,              // Whether start/end points were switched during processing
    
    // Raw Data (optional)
    rawData: any                    // Original stroke data from source (for reference)
}
```

## Point Structure

### Point Object
```javascript
{
    x: number,                      // X coordinate
    y: number                       // Y coordinate
}
```

## Raw Character Data Structure

### RawCharacterData (from hanzi-writer/makemeahanzi)
```javascript
{
    character: string,
    strokes: string[],              // Array of SVG path strings
    medians: number[][][],         // Array of median point arrays (one per stroke)
    // ... other raw properties
}
```

## Example Usage

### Complete Example
```javascript
const characterStrokeData = {
    character: "中",
    unicode: 20013,
    unicodeHex: "U+4E2D",
    timestamp: "2026-01-15T12:00:00.000Z",
    version: "1.0",
    source: "makemeahanzi",
    totalStrokes: 4,
    strokes: [
        {
            index: 0,
            points: [
                { x: 254, y: 596 },
                { x: 244, y: 603 },
                // ... more points
            ],
            pointCount: 12,
            startPoint: { x: 254, y: 596 },
            endPoint: { x: 306, y: 381 },
            maxDistancePoint: { x: 306, y: 381 },
            direction: { dx: 52, dy: -215 },
            angle: 1.33349295154379,
            angleDegrees: 76.40351813390237,
            length: 221.19900542271884,
            maxDistance: 221.19900542271884,
            coordinateSystem: {
                origin: "bottom-left",
                conversionHeight: 900,
                converted: true
            },
            source: "medians",
            processed: true,
            switched: false,
            rawData: "M 254 596 Q 244 603 ..."  // SVG path string
        },
        // ... more strokes
    ],
    rawCharData: {
        character: "中",
        strokes: ["M 254 596 ...", ...],
        medians: [[[254, 596], ...], ...]
    }
}
```

## Storage Format

### In-Memory (JavaScript)
```javascript
let strokeData = {
    character: string,
    strokes: StrokeData[],
    initialized: boolean
};
```

### File Format (JSON)
```json
{
    "character": "中",
    "unicode": 20013,
    "unicodeHex": "U+4E2D",
    "timestamp": "2026-01-15T12:00:00.000Z",
    "version": "1.0",
    "source": "makemeahanzi",
    "totalStrokes": 4,
    "strokes": [...],
    "rawCharData": {...}
}
```

### Multiple Characters Format
```json
{
    "sourceFile": "ToWriteText.txt",
    "timestamp": "2026-01-15T12:00:00.000Z",
    "version": "1.0",
    "totalCharacters": 116,
    "successfulCharacters": 116,
    "failedCharacters": 0,
    "characters": {
        "观": { /* CharacterStrokeData */ },
        "自": { /* CharacterStrokeData */ },
        // ... more characters
    }
}
```

## Benefits of This Structure

1. **Clear Separation**: Raw data vs processed data
2. **Extensible**: Easy to add new properties
3. **Self-Documenting**: Property names are descriptive
4. **Type-Safe**: Clear data types for each property
5. **Versioned**: Can track structure changes
6. **Traceable**: Includes source and processing metadata
7. **Coordinate System Aware**: Tracks coordinate transformations

## Migration Notes

When updating existing code:
- Map old `strokeData.strokes[]` to new `StrokeData[]` structure
- Add missing properties with default values
- Update processing functions to populate new structure
- Maintain backward compatibility where possible
