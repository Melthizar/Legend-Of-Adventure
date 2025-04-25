/**
 * Base Entity class
 * Parent class for all game entities (player, enemies, items, etc.)
 */
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }
    
    /**
     * Update entity state
     */
    update() {
        // Base update logic - to be overridden by subclasses
    }
    
    /**
     * Render entity on canvas
     */
    render(ctx) {
        // Base render logic - to be overridden by subclasses
    }
    
    /**
     * Check if this entity collides with another entity
     */
    collidesWith(entity) {
        return (
            this.x + this.width / 2 > entity.x - entity.width / 2 &&
            this.x - this.width / 2 < entity.x + entity.width / 2 &&
            this.y + this.height / 2 > entity.y - entity.height / 2 &&
            this.y - this.height / 2 < entity.y + entity.height / 2
        );
    }

    /**
     * Attempts to move the entity by dx, dy, checking for wall collisions.
     * @param {number} dx - The horizontal displacement.
     * @param {number} dy - The vertical displacement.
     * @param {Collision} collision - The collision checker instance.
     * @returns {boolean} - True if the entity moved, false otherwise.
     */
    applyDisplacement(dx, dy, collision) {
        const targetX = this.x + dx;
        const targetY = this.y + dy;

        // Check if the target position is valid (not inside a wall)
        if (!collision.checkRectCollisionWithWalls(targetX, targetY, this.width, this.height)) {
            this.x = targetX;
            this.y = targetY;
            return true;
        }

        // Optional: Could add logic here to slide along the wall,
        // similar to player movement, but for now, just block the knockback.
        return false;
    }
}
