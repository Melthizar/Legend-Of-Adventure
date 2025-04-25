/**
 * Renderer class
 * Handles rendering of all game elements
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    /**
     * Clear canvas
     */
    clear() {
        this.ctx.fillStyle = Config.COLORS.floor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Render the entire game
     */
    render(room, player, projectiles, particles) {
        // Clear canvas
        this.clear();
        
        // Draw room (includes floor, walls, items, enemies)
        room.render(this.ctx);
        
        // Draw projectiles
        for (const projectile of projectiles) {
            if (projectile.active) {
                projectile.render(this.ctx);
            }
        }
        
        // Draw player
        player.render(this.ctx);
        
        // Draw particles
        for (const particle of particles) {
            if (particle.active) {
                particle.render(this.ctx);
            }
        }
    }
}
