/**
 * Projectile class
 * Represents projectiles fired by player or enemies
 */
class Projectile extends Entity {
    constructor(x, y, dx, dy, type) {
        super(x, y, Config.PROJECTILE_WIDTH, Config.PROJECTILE_HEIGHT);
        this.dx = dx;
        this.dy = dy;
        this.type = type; // 'player' or 'enemy'
        this.active = true;
    }
    
    /**
     * Update projectile position
     */
    update() {
        // Move projectile
        this.x += this.dx;
        this.y += this.dy;
        
        // Check if out of bounds
        if (
            this.x < 0 ||
            this.x > Config.CANVAS_WIDTH ||
            this.y < 0 ||
            this.y > Config.CANVAS_HEIGHT
        ) {
            this.active = false;
        }
    }
    
    /**
     * Render projectile on canvas
     */
    render(ctx) {
        // Draw projectile
        ctx.fillStyle = this.type === 'enemy' ? Config.COLORS.enemyProjectile : Config.COLORS.projectile;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Config.PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Deactivate projectile and create particles
     */
    deactivate(particles) {
        this.active = false;
        
        // Create impact particles
        const color = this.type === 'enemy' ? Config.COLORS.enemyProjectile : Config.COLORS.projectile;
        
        for (let i = 0; i < Config.PROJECTILE_IMPACT_PARTICLE_COUNT; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                Utils.randomFloat(Config.PROJECTILE_IMPACT_PARTICLE_MIN_SPEED, Config.PROJECTILE_IMPACT_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.PROJECTILE_IMPACT_PARTICLE_MIN_SPEED, Config.PROJECTILE_IMPACT_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.PROJECTILE_IMPACT_PARTICLE_MIN_SIZE, Config.PROJECTILE_IMPACT_PARTICLE_MAX_SIZE),
                color,
                Utils.randomInt(Config.PROJECTILE_IMPACT_PARTICLE_MIN_LIFETIME, Config.PROJECTILE_IMPACT_PARTICLE_MAX_LIFETIME)
            ));
        }
    }
}
