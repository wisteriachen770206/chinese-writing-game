// ============================================
// HANZI WRITER CLASS
// ============================================
console.log('✅ hanzi-writer.js loaded');

// newHanziWriter class - encapsulates all drawing/writing functionality
class newHanziWriter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.guideCanvas = null;
        this.guideCtx = null;
        this.currentStrokeIndex = 0;
        this.totalStrokes = 0;
        this.isAnimating = false;
        this.drawnStrokes = [];
        this.guideDrawn = false; // Track if guide character has been drawn
        this.strokeData = {
            character: null,
            rawCharData: null,
            strokes: [],
            initialized: false
        };
    }
    
    initCanvas() {
        // Initialize main canvas for green strokes
        this.canvas = document.getElementById('character-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Initialize guide canvas for background guide character
        this.guideCanvas = document.getElementById('guide-canvas');
        if (!this.guideCanvas) {
            console.error('Guide canvas element not found');
            return;
        }
        
        // Set canvas size to match container
        const wrapper = document.querySelector('.character-wrapper');
        const size = Math.min(wrapper.offsetWidth || 800, wrapper.offsetHeight || 800);
        this.canvas.width = size;
        this.canvas.height = size;
        this.guideCanvas.width = size;
        this.guideCanvas.height = size;
        
        this.ctx = this.canvas.getContext('2d');
        this.guideCtx = this.guideCanvas.getContext('2d');
        if (!this.ctx || !this.guideCtx) {
            console.error('Could not get canvas context');
            return;
        }
        
        // Clear main canvas (guide canvas stays as background)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set drawing style for main canvas
        this.ctx.strokeStyle = '#1C1C1C'; // Drawing color
        // Use thinner strokes for characters with more than 10 strokes
        this.ctx.lineWidth = this.totalStrokes > 10 ? 18 : 25;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        console.log(`Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
        
        // Draw guide character on guide canvas if stroke data is available
        if (this.strokeData.rawCharData && this.strokeData.rawCharData.medians) {
            this.drawGuideCharacter();
            // Set currentStrokeIndex to zero after guide is prepared
            this.currentStrokeIndex = 0;
        }
        
        const self = this;
        window.addEventListener('resize', () => {
            const size = Math.min(wrapper.offsetWidth || 420, wrapper.offsetHeight || 420);
            self.canvas.width = size;
            self.canvas.height = size;
            self.guideCanvas.width = size;
            self.guideCanvas.height = size;
            // Redraw guide on guide canvas
            if (self.guideDrawn) {
                self.drawGuideCharacter();
            }
            // Redraw all drawn strokes on main canvas
            self.redrawAllStrokes();
        });
    }
    
    drawGuideCharacter() {
        if (!this.guideCtx || !this.strokeData.rawCharData || !this.strokeData.rawCharData.medians) return;
        
        const medians = this.strokeData.rawCharData.medians;
        if (medians.length === 0) return;
        
        // Ensure all stroke data is prepared when guide character is drawn
        // Check if strokes need to be processed (if lengths are missing)
        if (!this.strokeData.strokes || this.strokeData.strokes.length === 0 || 
            this.strokeData.strokes.some(s => !s || s.length === null || s.length === undefined)) {
            console.log('[drawGuideCharacter] Preparing all stroke data from rawCharData...');
            this.prepareAllStrokeData();
        }
        
        // Clear guide canvas first
        this.guideCtx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
        
        // Get canvas dimensions and calculate scale/offset (same as drawStroke)
        const canvasSize = this.guideCanvas.width;
        const dataWidth = 900;
        const dataHeight = 900;
        // Use thinner strokes for characters with more than 10 strokes
        const guideLineWidth = this.totalStrokes > 10 ? 15 : 20;
        const strokeHalfWidth = guideLineWidth / 2; // Use the actual stroke width for calculations
        const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1);
        const availableSize = canvasSize - (padding * 2);
        const scale = availableSize / Math.max(dataWidth, dataHeight);
        const offsetX = (canvasSize - (dataWidth * scale)) / 2;
        const offsetY = (canvasSize - (dataHeight * scale)) / 2;
        
        // Draw all strokes in grey on guide canvas
        this.guideCtx.strokeStyle = '#9A9A9A'; // Guide character color
        this.guideCtx.lineWidth = guideLineWidth;
        this.guideCtx.lineCap = 'round';
        this.guideCtx.lineJoin = 'round';
        
        for (let i = 0; i < medians.length; i++) {
            const strokePoints = medians[i];
            if (!strokePoints || strokePoints.length === 0) continue;
            
            // Convert points to canvas coordinates
            const canvasPoints = strokePoints.map(([x, y]) => {
                return {
                    x: x * scale + offsetX,
                    y: (dataHeight - y) * scale + offsetY
                };
            });
            
            // Draw the stroke on guide canvas
            this.guideCtx.beginPath();
            this.guideCtx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
            for (let j = 1; j < canvasPoints.length; j++) {
                this.guideCtx.lineTo(canvasPoints[j].x, canvasPoints[j].y);
            }
            this.guideCtx.stroke();
        }
        
        // Mark guide as drawn
        this.guideDrawn = true;
    }
    
    prepareAllStrokeData() {
        // Prepare all stroke data from rawCharData when guide character is drawn
        if (!this.strokeData.rawCharData || !this.strokeData.rawCharData.medians) {
            return;
        }
        
        const medians = this.strokeData.rawCharData.medians;
        if (medians.length === 0) {
            return;
        }
        
        // Rebuild strokes array with calculated lengths if missing
        if (!this.strokeData.strokes || this.strokeData.strokes.length !== medians.length) {
            this.strokeData.strokes = [];
        }
        
        for (let i = 0; i < medians.length; i++) {
            let stroke = this.strokeData.strokes[i];
            
            // If stroke doesn't exist or is missing length, calculate it
            if (!stroke || stroke.length === null || stroke.length === undefined) {
                const strokePoints = medians[i].map(([x, y]) => ({ x, y }));
                
                // Calculate stroke length from points
                let length = 0;
                for (let j = 1; j < strokePoints.length; j++) {
                    const dx = strokePoints[j].x - strokePoints[j - 1].x;
                    const dy = strokePoints[j].y - strokePoints[j - 1].y;
                    length += Math.sqrt(dx * dx + dy * dy);
                }
                
                // Calculate angle data if needed (calculate manually since function is in different scope)
                let angleData = null;
                if (strokePoints.length >= 2) {
                    const startPoint = strokePoints[0];
                    
                    // Find the point with maximum distance from start point
                    let maxDistance = 0;
                    let endPoint = startPoint;
                    for (let j = 1; j < strokePoints.length; j++) {
                        const point = strokePoints[j];
                        const dx = point.x - startPoint.x;
                        const dy = point.y - startPoint.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > maxDistance) {
                            maxDistance = dist;
                            endPoint = point;
                        }
                    }
                    
                    // Convert to screen coordinates for consistent angle calculation
                    // Stroke data: (0,0) at bottom-left, y increases upward
                    // Screen: (0,0) at top-left, y increases downward
                    const conversionHeight = 900;
                    
                    const startScreen = {
                        x: startPoint.x,
                        y: conversionHeight - startPoint.y
                    };
                    const endScreen = {
                        x: endPoint.x,
                        y: conversionHeight - endPoint.y
                    };
                    
                    // Calculate direction in screen coordinates
                    const dx = endScreen.x - startScreen.x;
                    const dy = endScreen.y - startScreen.y;
                    
                    // Calculate angle in screen coordinates (consistent method)
                    angleData = {
                        startPoint: startPoint,
                        endPoint: endPoint,
                        direction: { dx, dy },
                        angle: Math.atan2(dy, dx),
                        angleDegrees: Math.atan2(dy, dx) * 180 / Math.PI,
                        length: length
                    };
                }
                
                // Create or update stroke object
                this.strokeData.strokes[i] = {
                    index: i,
                    rawData: medians[i],
                    points: strokePoints,
                    startPoint: angleData ? angleData.startPoint : (strokePoints[0] || null),
                    endPoint: angleData ? angleData.endPoint : (strokePoints[strokePoints.length - 1] || null),
                    direction: angleData ? angleData.direction : null,
                    angle: angleData ? angleData.angle : null,
                    angleDegrees: angleData ? angleData.angleDegrees : null,
                    length: length,
                    source: 'medians'
                };
            }
        }
        
        // Calculate distance between consecutive strokes (end point of stroke i to start point of stroke i+1)
        for (let i = 0; i < this.strokeData.strokes.length - 1; i++) {
            const currentStroke = this.strokeData.strokes[i];
            const nextStroke = this.strokeData.strokes[i + 1];
            
            if (currentStroke && currentStroke.endPoint && nextStroke && nextStroke.startPoint) {
                const dx = nextStroke.startPoint.x - currentStroke.endPoint.x;
                const dy = nextStroke.startPoint.y - currentStroke.endPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Store distance to next stroke in current stroke object
                if (!currentStroke.distanceToNext) {
                    currentStroke.distanceToNext = distance;
                } else {
                    // Update if already exists (in case of recalculation)
                    currentStroke.distanceToNext = distance;
                }
            }
        }
        
        // Last stroke has no next stroke, so distanceToNext is null/undefined
        
        this.strokeData.initialized = true;
    }
    
    redrawAllStrokes() {
        if (!this.ctx || !this.strokeData.rawCharData) return;
        
        // Only clear and redraw the main canvas (green strokes)
        // Guide canvas stays as background, no need to redraw
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all completed strokes in green on main canvas
        this.ctx.strokeStyle = '#1C1C1C'; // Drawing color
        // Use thinner strokes for characters with more than 10 strokes
        this.ctx.lineWidth = this.totalStrokes > 10 ? 18 : 25;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Redraw all previously drawn strokes
        for (let i = 0; i < this.drawnStrokes.length; i++) {
            this.drawStroke(this.drawnStrokes[i], false); // false = no animation
        }
    }
    
    drawStroke(strokeIndex, animate = true) {
        if (!this.ctx || !this.strokeData.rawCharData || !this.strokeData.rawCharData.medians) {
            console.error('Cannot draw stroke: missing data');
            return;
        }
        
        // Set isAnimating flag IMMEDIATELY before starting animation
        // This prevents other operations from interfering
        if (animate) {
            this.isAnimating = true;
        }
        
        // Ensure stroke style is set to bright green
        this.ctx.strokeStyle = '#1C1C1C'; // Drawing color // Bright green
        // Use thinner strokes for characters with more than 10 strokes
        this.ctx.lineWidth = this.totalStrokes > 10 ? 18 : 25;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        
        const medians = this.strokeData.rawCharData.medians;
        if (strokeIndex >= medians.length) {
            console.error(`Stroke index ${strokeIndex} out of range`);
            return;
        }
        
        const strokePoints = medians[strokeIndex];
        if (!strokePoints || strokePoints.length === 0) {
            console.error(`No points for stroke ${strokeIndex}`);
            return;
        }
        
        // Get canvas dimensions and calculate scale/offset
        const canvasSize = this.canvas.width;
        const dataWidth = 900; // Standard width for character data
        const dataHeight = 900; // Standard height for character data
        
        // Account for stroke width (half on each side) and padding
        const strokeHalfWidth = this.ctx.lineWidth / 2;
        const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1); // At least 10px + stroke width
        const availableSize = canvasSize - (padding * 2);
        
        // Scale to fit within available space
        const scale = availableSize / Math.max(dataWidth, dataHeight);
        
        // Center the character
        const offsetX = (canvasSize - (dataWidth * scale)) / 2;
        const offsetY = (canvasSize - (dataHeight * scale)) / 2;
        
        // Convert points from data coordinates to canvas coordinates
        // Data uses bottom-left origin, canvas uses top-left origin
        const canvasPoints = strokePoints.map(([x, y]) => {
            return {
                x: x * scale + offsetX,
                y: (dataHeight - y) * scale + offsetY // Flip y-axis
            };
        });
        
        if (animate) {
            // Animate stroke drawing
            this.animateStrokeDrawing(canvasPoints);
        } else {
            // Draw immediately
            this.ctx.beginPath();
            this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
            for (let i = 1; i < canvasPoints.length; i++) {
                this.ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
            }
            this.ctx.stroke();
        }
    }
    
    animateStrokeDrawing(points) {
        if (points.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        let currentIndex = 0;
        // Calculate animation speed based on stroke length for consistent timing
        // Aim for ~300ms animation time regardless of stroke length
        const targetDuration = 300; // milliseconds
        const fps = 60; // frames per second
        const totalFrames = Math.ceil((targetDuration / 1000) * fps);
        const animationSpeed = Math.max(1, Math.ceil(points.length / totalFrames));
        
        const self = this;
        function animate() {
            if (currentIndex >= points.length) {
                self.isAnimating = false;
                return;
            }
            
            self.ctx.beginPath();
            self.ctx.moveTo(points[0].x, points[0].y);
            
            const endIndex = Math.min(currentIndex + animationSpeed, points.length);
            for (let i = 1; i < endIndex; i++) {
                self.ctx.lineTo(points[i].x, points[i].y);
            }
            self.ctx.stroke();
            
            currentIndex = endIndex;
            
            if (currentIndex < points.length) {
                requestAnimationFrame(animate);
            } else {
                self.isAnimating = false;
            }
        }
        
        animate();
    }
}
