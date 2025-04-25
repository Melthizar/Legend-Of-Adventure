/**
 * Player class
 * Represents the player character
 */
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 24, 32);
        this.direction = 'down';
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.invulnerable = 0;
        this.health = Config.PLAYER_MAX_HEALTH;
        this.rupees = 0;
    }
    
    /**
     * Update player state
     */
    update(input, collision) {
        // Handle movement
        let dx = 0;
        let dy = 0;
        
        // Use isActionPressed for movement
        if (input.isActionPressed('up')) { 
            dy -= Config.PLAYER_SPEED;
            this.direction = 'up';
        }
        if (input.isActionPressed('down')) { 
            dy += Config.PLAYER_SPEED;
            this.direction = 'down';
        }
        if (input.isActionPressed('left')) { 
            dx -= Config.PLAYER_SPEED;
            this.direction = 'left';
        }
        if (input.isActionPressed('right')) { 
            dx += Config.PLAYER_SPEED;
            this.direction = 'right';
        }
        
        // Apply movement with collision detection
        if (dx !== 0 || dy !== 0) {
            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                const normalize = Math.sqrt(2) / 2;
                dx *= normalize;
                dy *= normalize;
            }
            
            // Check collision and move using new method
            const nextX = this.x + dx;
            const nextY = this.y + dy;

            // Check X-axis movement
            if (!collision.checkRectCollisionWithWalls(nextX, this.y, this.width, this.height)) {
                this.x = nextX;
            }
            // Check Y-axis movement (using potentially updated X)
            if (!collision.checkRectCollisionWithWalls(this.x, nextY, this.width, this.height)) {
                this.y = nextY;
            }
        }
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Update invulnerability
        if (this.invulnerable > 0) {
            this.invulnerable--;
        }
    }
    
    /**
     * Render player on canvas
     */
    render(ctx) {
        // Skip drawing during invulnerability every few frames for flashing effect
        if (this.invulnerable > 0 && this.invulnerable % 6 < 3) {
            return;
        }
        
        // Draw player body
        ctx.fillStyle = Config.COLORS.player;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Draw direction indicator
        ctx.fillStyle = '#FFFFFF';
        switch (this.direction) {
            case 'up':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.height/2 - 5);
                ctx.lineTo(this.x - 5, this.y - this.height/2 + 5);
                ctx.lineTo(this.x + 5, this.y - this.height/2 + 5);
                ctx.fill();
                break;
            case 'down':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height/2 + 5);
                ctx.lineTo(this.x - 5, this.y + this.height/2 - 5);
                ctx.lineTo(this.x + 5, this.y + this.height/2 - 5);
                ctx.fill();
                break;
            case 'left':
                ctx.beginPath();
                ctx.moveTo(this.x - this.width/2 - 5, this.y);
                ctx.lineTo(this.x - this.width/2 + 5, this.y - 5);
                ctx.lineTo(this.x - this.width/2 + 5, this.y + 5);
                ctx.fill();
                break;
            case 'right':
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2 + 5, this.y);
                ctx.lineTo(this.x + this.width/2 - 5, this.y - 5);
                ctx.lineTo(this.x + this.width/2 - 5, this.y + 5);
                ctx.fill();
                break;
        }
        
        // Draw weapon if attacking
        if (this.isAttacking) {
            ctx.fillStyle = '#CCCCCC';
            
            // Use Config constants for rendering
            const swordLength = Config.SWORD_RENDER_LENGTH;
            const swordWidth = Config.SWORD_RENDER_WIDTH;
            const swordOffset = Config.SWORD_RENDER_OFFSET;

            let rectX, rectY, rectW, rectH;

            switch (this.direction) {
                case 'up':
                    rectX = this.x - swordWidth / 2;
                    rectY = this.y - this.height / 2 - swordOffset - swordLength;
                    rectW = swordWidth;
                    rectH = swordLength;
                    break;
                case 'down':
                    rectX = this.x - swordWidth / 2;
                    rectY = this.y + this.height / 2 + swordOffset;
                    rectW = swordWidth;
                    rectH = swordLength;
                    break;
                case 'left':
                    rectX = this.x - this.width / 2 - swordOffset - swordLength;
                    rectY = this.y - swordWidth / 2;
                    rectW = swordLength;
                    rectH = swordWidth;
                    break;
                case 'right':
                    rectX = this.x + this.width / 2 + swordOffset;
                    rectY = this.y - swordWidth / 2;
                    rectW = swordLength;
                    rectH = swordWidth;
                    break;
            }
            ctx.fillRect(rectX, rectY, rectW, rectH);
        }
    }
    
    /**
     * Start player attack
     */
    attack() {
        if (this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackCooldown = Config.PLAYER_ATTACK_COOLDOWN;
            
            // Stop attack after duration
            setTimeout(() => {
                this.isAttacking = false;
            }, Config.PLAYER_ATTACK_DURATION);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.invulnerable <= 0) {
            this.health -= amount;
            this.invulnerable = Config.PLAYER_INVULNERABLE_TIME;
            return true;
        }
        
        return false;
    }
    
    /**
     * Heal player
     */
    heal(amount) {
        this.health = Math.min(this.health + amount, Config.PLAYER_MAX_HEALTH);
    }
    
    /**
     * Add rupees to player
     */
    addRupees(amount) {
        this.rupees += amount;
    }
    
    /**
     * Reset player to initial state
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 'down';
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.invulnerable = 0;
        this.health = Config.PLAYER_MAX_HEALTH;
        this.rupees = 0;
    }
    
    /**
     * Get sword hitbox based on player position and direction
     */
    getSwordHitbox() {
        // Use Config values
        const swordRange = Config.SWORD_RANGE; 
        const swordWidth = Config.SWORD_WIDTH; 
        let swordX = this.x;
        let swordY = this.y;
        let width = 0;
        let height = 0;
        
        switch (this.direction) {
            case 'up':
                // Center the hitbox halfway along the sword's range in front of the player
                swordY -= this.height / 2 + swordRange / 2; 
                width = swordWidth;
                height = swordRange;
                break;
            case 'down':
                swordY += this.height / 2 + swordRange / 2;
                width = swordWidth;
                height = swordRange;
                break;
            case 'left':
                swordX -= this.width / 2 + swordRange / 2;
                width = swordRange;
                height = swordWidth;
                break;
            case 'right':
                swordX += this.width / 2 + swordRange / 2;
                width = swordRange;
                height = swordWidth;
                break;
        }
        
        return {
            x: swordX,
            y: swordY,
            width: width,
            height: height
        };
    }
}
