/**
 * Utility functions
 */
const Utils = {
    /**
     * Generate a random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Generate a random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    
    /**
     * Normalize a vector (x, y) to have length 1
     */
    normalizeVector(x, y) {
        const length = Math.sqrt(x * x + y * y);
        
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        
        return {
            x: x / length,
            y: y / length
        };
    }
};
