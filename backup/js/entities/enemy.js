/**
 * Enemy class
 * Base class for all enemy types
 */
class Enemy extends Entity {
    constructor(x, y, type) {
        const size = type === 'boss' ? Config.BOSS_SIZE : Config.OCTOROK_SIZE;
        super(x, y, size, size);
        
        this.type = type;
        this.direction = 'down';
        this.health = type === 'boss' ? Config.BOSS_HEALTH : Config.OCTOROK_HEALTH;
        this.maxHealth = this.health;
        this.cooldown = 0;
    }
    
    /**
     * Update enemy state
     */
    update(player, collision, projectiles, particles) {
        if (this.health <= 0) return;
        
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        
        // Handle AI based on enemy type
        if (this.type === 'octorok') {
            this.updateOctorok(player, collision, projectiles);
        } else if (this.type === 'boss') {
            this.updateBoss(player, collision, projectiles);
        }
    }
    
    /**
     * Update logic for octorok enemy type
     */
    updateOctorok(player, collision, projectiles) {
        // Random movement
        if (Math.random() < Config.OCTOROK_MOVE_CHANGE_DIR_CHANCE) {
            const directions = ['up', 'down', 'left', 'right'];
            this.direction = directions[Utils.randomInt(0, 3)];
        }
        
        // Move in current direction
        let dx = 0;
        let dy = 0;
        
        switch (this.direction) {
            case 'up':
                dy -= Config.ENEMY_SPEED / 2;
                break;
            case 'down':
                dy += Config.ENEMY_SPEED / 2;
                break;
            case 'left':
                dx -= Config.ENEMY_SPEED / 2;
                break;
            case 'right':
                dx += Config.ENEMY_SPEED / 2;
                break;
        }
        
        // Apply movement if no wall collision
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        if (!collision.checkRectCollisionWithWalls(newX, this.y, this.width, this.height)) {
            this.x = newX;
        } else {
            // Change direction if hit wall
            this.direction = this.direction === 'left' ? 'right' : this.direction === 'right' ? 'left' : this.direction;
        }
        
        if (!collision.checkRectCollisionWithWalls(this.x, newY, this.width, this.height)) {
            this.y = newY;
        } else {
            // Change direction if hit wall
            this.direction = this.direction === 'up' ? 'down' : this.direction === 'down' ? 'up' : this.direction;
        }
        
        // Shoot at player occasionally
        if (this.cooldown <= 0 && Math.random() < Config.OCTOROK_SHOOT_CHANCE) {
            // Calculate direction to player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Utils.distance(this.x, this.y, player.x, player.y);
            
            // Only shoot if player is in line of sight
            if (distance < Config.OCTOROK_SHOOT_RANGE) {
                const normalized = Utils.normalizeVector(dx, dy);
                
                // Create projectile
                projectiles.push(new Projectile(
                    this.x, 
                    this.y, 
                    normalized.x * Config.PROJECTILE_SPEED, 
                    normalized.y * Config.PROJECTILE_SPEED, 
                    'enemy'
                ));
                
                this.cooldown = Config.OCTOROK_SHOOT_COOLDOWN;
            }
        }
    }
    
    /**
     * Update logic for boss enemy type
     */
    updateBoss(player, collision, projectiles) {
        // Chase player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Utils.distance(this.x, this.y, player.x, player.y);
        
        // Update direction based on player position
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
        
        // Move towards player
        const moveSpeed = Config.ENEMY_SPEED * 0.5;
        const normalized = Utils.normalizeVector(dx, dy);
        
        const newX = this.x + normalized.x * moveSpeed;
        const newY = this.y + normalized.y * moveSpeed;
        
        if (!collision.checkRectCollisionWithWalls(newX, this.y, this.width, this.height)) {
            this.x = newX;
        }
        
        if (!collision.checkRectCollisionWithWalls(this.x, newY, this.width, this.height)) {
            this.y = newY;
        }
        
        // Shoot at player frequently
        if (this.cooldown <= 0 && Math.random() < Config.BOSS_SHOOT_CHANCE) {
            // Shoot in multiple directions
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];
            
            for (const dir of directions) {
                projectiles.push(new Projectile(
                    this.x, 
                    this.y, 
                    dir.x * Config.PROJECTILE_SPEED, 
                    dir.y * Config.PROJECTILE_SPEED, 
                    'enemy'
                ));
            }
            
            this.cooldown = Config.BOSS_SHOOT_COOLDOWN;
        }
        
        // Check for collision with player
        if (this.collidesWith(player) && player.invulnerable <= 0) {
            player.takeDamage(Config.BOSS_CONTACT_DAMAGE);
            
            // Knockback player using applyDisplacement
            const knockbackDistance = Config.BOSS_KNOCKBACK_DISTANCE;
            let kbDx = 0;
            let kbDy = 0;
            switch (this.direction) {
                case 'up':    kbDy = -knockbackDistance; break;
                case 'down':  kbDy = knockbackDistance; break;
                case 'left':  kbDx = -knockbackDistance; break;
                case 'right': kbDx = knockbackDistance; break;
            }
            player.applyDisplacement(kbDx, kbDy, collision);
        }
    }
    
    /**
     * Render enemy on canvas
     */
    render(ctx) {
        if (this.health <= 0) return;
        
        const size = this.type === 'boss' ? Config.BOSS_SIZE : Config.OCTOROK_SIZE;
        
        // Draw enemy body
        ctx.fillStyle = this.type === 'boss' ? Config.COLORS.boss : Config.COLORS.enemy;
        ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
        
        // Draw enemy health
        const healthBarWidth = size;
        const healthBarHeight = Config.ENEMY_HEALTH_BAR_HEIGHT;
        const healthPercentage = this.health / this.maxHealth;
        const healthBarY = this.y - size/2 - Config.ENEMY_HEALTH_BAR_OFFSET_Y;
        
        ctx.fillStyle = Config.COLORS.healthBarBackground;
        ctx.fillRect(this.x - healthBarWidth/2, healthBarY, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = Config.COLORS.healthBarForeground;
        ctx.fillRect(this.x - healthBarWidth/2, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Draw direction indicator
        ctx.fillStyle = '#FFFFFF';
        switch (this.direction) {
            case 'up':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - size/2 - 5);
                ctx.lineTo(this.x - 5, this.y - size/2 + 5);
                ctx.lineTo(this.x + 5, this.y - size/2 + 5);
                ctx.fill();
                break;
            case 'down':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + size/2 + 5);
                ctx.lineTo(this.x - 5, this.y + size/2 - 5);
                ctx.lineTo(this.x + 5, this.y + size/2 - 5);
                ctx.fill();
                break;
            case 'left':
                ctx.beginPath();
                ctx.moveTo(this.x - size/2 - 5, this.y);
                ctx.lineTo(this.x - size/2 + 5, this.y - 5);
                ctx.lineTo(this.x - size/2 + 5, this.y + 5);
                ctx.fill();
                break;
            case 'right':
                ctx.beginPath();
                ctx.moveTo(this.x + size/2 + 5, this.y);
                ctx.lineTo(this.x + size/2 - 5, this.y - 5);
                ctx.lineTo(this.x + size/2 - 5, this.y + 5);
                ctx.fill();
                break;
        }
        
        // Add crown for boss
        if (this.type === 'boss') {
            ctx.fillStyle = Config.COLORS.bossCrown;
            ctx.beginPath();
            ctx.moveTo(this.x - 15, this.y - size/2 - 5);
            ctx.lineTo(this.x + 15, this.y - size/2 - 5);
            ctx.lineTo(this.x + 20, this.y - size/2 + 5);
            ctx.lineTo(this.x + 10, this.y - size/2);
            ctx.lineTo(this.x, this.y - size/2 + 5);
            ctx.lineTo(this.x - 10, this.y - size/2);
            ctx.lineTo(this.x - 20, this.y - size/2 + 5);
            ctx.fill();
        }
    }
    
    /**
     * Enemy takes damage
     * Added collision parameter for knockback handling
     */
    takeDamage(amount, direction, particles, items, collision) {
        this.health -= amount;
        
        // Create damage particles
        for (let i = 0; i < Config.ENEMY_DAMAGE_PARTICLE_COUNT; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                Utils.randomFloat(Config.ENEMY_DAMAGE_PARTICLE_MIN_SPEED, Config.ENEMY_DAMAGE_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.ENEMY_DAMAGE_PARTICLE_MIN_SPEED, Config.ENEMY_DAMAGE_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.ENEMY_DAMAGE_PARTICLE_MIN_SIZE, Config.ENEMY_DAMAGE_PARTICLE_MAX_SIZE),
                Config.ENEMY_DAMAGE_PARTICLE_COLOR,
                Utils.randomInt(Config.ENEMY_DAMAGE_PARTICLE_MIN_LIFETIME, Config.ENEMY_DAMAGE_PARTICLE_MAX_LIFETIME)
            ));
        }
        
        // Check if enemy is defeated
        if (this.health <= 0) {
            // Create death particles
            for (let i = 0; i < Config.ENEMY_DEATH_PARTICLE_COUNT; i++) {
                particles.push(new Particle(
                    this.x,
                    this.y,
                    Utils.randomFloat(Config.ENEMY_DEATH_PARTICLE_MIN_SPEED, Config.ENEMY_DEATH_PARTICLE_MAX_SPEED),
                    Utils.randomFloat(Config.ENEMY_DEATH_PARTICLE_MIN_SPEED, Config.ENEMY_DEATH_PARTICLE_MAX_SPEED),
                    Utils.randomFloat(Config.ENEMY_DEATH_PARTICLE_MIN_SIZE, Config.ENEMY_DEATH_PARTICLE_MAX_SIZE),
                    Config.ENEMY_DEATH_PARTICLE_COLOR,
                    Utils.randomInt(Config.ENEMY_DEATH_PARTICLE_MIN_LIFETIME, Config.ENEMY_DEATH_PARTICLE_MAX_LIFETIME)
                ));
            }
            
            // Drop item chance
            if (Math.random() < Config.ENEMY_ITEM_DROP_CHANCE) {
                const itemType = Math.random() < Config.ENEMY_ITEM_RUPEE_CHANCE ? 'rupee' : 'heart';
                const itemValue = itemType === 'rupee' ? Config.ITEM_RUPEE_VALUE : Config.ITEM_HEART_VALUE;
                
                items.push(new Item(
                    this.x,
                    this.y,
                    itemType,
                    itemValue
                ));
            }
            
            return true;
        } else {
            // Apply knockback using applyDisplacement
            const knockbackDistance = Config.ENEMY_KNOCKBACK_ON_HIT_DISTANCE;
            let kbDx = 0;
            let kbDy = 0;
            switch (direction) {
                case 'up':    kbDy = -knockbackDistance; break;
                case 'down':  kbDy = knockbackDistance; break;
                case 'left':  kbDx = -knockbackDistance; break;
                case 'right': kbDx = knockbackDistance; break;
            }
            this.applyDisplacement(kbDx, kbDy, collision);
            
            return false;
        }
    }
}
