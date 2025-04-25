/**
 * Particle class
 * Represents visual effects particles
 */
class Particle {
    constructor(x, y, dx, dy, size, color, life) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.active = true;
    }
    
    /**
     * Update particle state
     */
    update() {
        // Move particle
        this.x += this.dx;
        this.y += this.dy;
        
        // Update life
        this.life--;
        
        // Check if particle should be removed
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    /**
     * Render particle on canvas
     */
    render(ctx) {
        // Set opacity based on remaining life
        const opacity = this.life / this.maxLife;
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset global alpha
        ctx.globalAlpha = 1;
    }
}
