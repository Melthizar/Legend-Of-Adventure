/**
 * Item class
 * Represents collectible items in the game
 */
class Item extends Entity {
    constructor(x, y, type, value) {
        super(x, y, Config.ITEM_WIDTH, Config.ITEM_HEIGHT);
        this.type = type;
        this.value = value;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
        this.collected = false;
    }
    
    /**
     * Update item state
     */
    update() {
        // Simple floating animation
        this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * 3;
    }
    
    /**
     * Render item on canvas
     */
    render(ctx) {
        if (this.collected) return;
        
        const renderY = this.y + this.floatOffset;
        
        switch (this.type) {
            case 'rupee':
                ctx.fillStyle = Config.COLORS.rupee;
                ctx.beginPath();
                ctx.moveTo(this.x, renderY - this.height/2);
                ctx.lineTo(this.x + this.width/2, renderY);
                ctx.lineTo(this.x, renderY + this.height/2);
                ctx.lineTo(this.x - this.width/2, renderY);
                ctx.closePath();
                ctx.fill();
                break;
            case 'heart':
                ctx.fillStyle = Config.COLORS.heart;
                const heartRadius = this.width * 0.375;
                const heartOffsetX = this.width * 0.25;
                const heartOffsetY = this.height * 0.25;
                const heartBottomY = renderY + this.height * 0.75;

                ctx.beginPath();
                ctx.arc(this.x - heartOffsetX, renderY - heartOffsetY, heartRadius, Math.PI, 0, false);
                ctx.arc(this.x + heartOffsetX, renderY - heartOffsetY, heartRadius, Math.PI, 0, false);
                ctx.bezierCurveTo(this.x + this.width*0.625, renderY, this.x + this.width*0.625, renderY + this.height*0.25, this.x, heartBottomY);
                ctx.bezierCurveTo(this.x - this.width*0.625, renderY + this.height*0.25, this.x - this.width*0.625, renderY, this.x, heartBottomY);
                ctx.fill();
                break;
        }
    }
    
    /**
     * Collect this item and apply its effect to the player
     */
    collect(player, particles) {
        if (this.collected) return false;
        
        this.collected = true;
        
        // Apply item effect
        switch (this.type) {
            case 'rupee':
                player.addRupees(this.value);
                break;
            case 'heart':
                player.heal(this.value);
                break;
        }
        
        // Create collection particle effect
        const color = this.type === 'rupee' ? Config.COLORS.rupee : Config.COLORS.heart;
        
        for (let i = 0; i < Config.ITEM_COLLECT_PARTICLE_COUNT; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                Utils.randomFloat(Config.ITEM_COLLECT_PARTICLE_MIN_SPEED, Config.ITEM_COLLECT_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.ITEM_COLLECT_PARTICLE_MIN_SPEED, Config.ITEM_COLLECT_PARTICLE_MAX_SPEED),
                Utils.randomFloat(Config.ITEM_COLLECT_PARTICLE_MIN_SIZE, Config.ITEM_COLLECT_PARTICLE_MAX_SIZE),
                color,
                Utils.randomInt(Config.ITEM_COLLECT_PARTICLE_MIN_LIFETIME, Config.ITEM_COLLECT_PARTICLE_MAX_LIFETIME)
            ));
        }
        
        return true;
    }
}
