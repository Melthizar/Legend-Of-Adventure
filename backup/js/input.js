/**
 * Input class
 * Handles player input (keyboard)
 */
class Input {
    constructor() {
        this.keys = {};
        // Define key-to-action mappings
        this.keyMap = {
            'ArrowUp': 'up',
            'w': 'up',
            'ArrowDown': 'down',
            's': 'down',
            'ArrowLeft': 'left',
            'a': 'left',
            'ArrowRight': 'right',
            'd': 'right',
            // Attack keys are handled separately in Game.js for now
            // but could be mapped here too, e.g.:
            // ' ': 'attack',
            // 'z': 'attack',
            // 'j': 'attack'
        };
        
        // Set up event listeners
        document.addEventListener('keydown', e => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', e => {
            this.keys[e.key] = false;
        });
    }
    
    /**
     * Check if a key is currently pressed
     */
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Check if any key mapped to the given action is pressed
     */
    isActionPressed(action) {
        for (const key in this.keyMap) {
            if (this.keyMap[key] === action && this.isKeyPressed(key)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Reset all keys (useful when changing game states)
     */
    reset() {
        this.keys = {};
    }
}
