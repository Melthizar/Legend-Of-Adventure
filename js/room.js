/**
 * Room class
 * Manages the game's room/level layout
 */
class Room {
    constructor() {
        // Define room layout
        this.layout = [
            "WWWWWWWWWWWWWWWWWWWWWWWW",
            "W......................W",
            "W......................W",
            "W.......TTTT...........W",
            "W.......T..T...........W",
            "W.......T..T...........W",
            "W........TT............W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "WWWWWWWWWWWWWWWWWWWWWWWW"
        ];
        
        // Initialize enemies and items
        this.reset();
    }
    
    /**
     * Reset room to initial state
     */
    reset() {
        this.enemies = [
            new Enemy(200, 250, 'octorok'),
            new Enemy(600, 250, 'octorok'),
            new Enemy(400, 150, 'boss')
        ];
        
        this.items = [
            new Item(300, 300, 'rupee', Config.ITEM_RUPEE_VALUE),
            new Item(500, 300, 'heart', Config.ITEM_HEART_VALUE)
        ];
    }
    
    /**
     * Update all entities in the room
     */
    update(player, collision, projectiles, particles) {
        // Update items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            item.update();
            
            // Check collision with player
            if (player.collidesWith(item)) {
                if (item.collect(player, particles)) {
                    // Remove item after collection
                    this.items.splice(i, 1);
                }
            }
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Skip update if enemy is already defeated (might be redundant if enemy.update checks itself)
            if (enemy.health <= 0) {
                // Check if we should remove defeated enemies here
                // For now, areAllEnemiesDefeated() handles the victory condition
                // Let's leave removal for later if performance becomes an issue.
                // We could potentially splice here: this.enemies.splice(i, 1);
                continue; 
            }
            
            enemy.update(player, collision, projectiles, particles);
            
            // Alternative: If update returns a status or if we check health again
            // if (enemy.health <= 0) {
            //     this.enemies.splice(i, 1);
            // }
        }
    }
    
    /**
     * Render room and all entities
     */
    render(ctx) {
        // Draw room layout
        this.drawLayout(ctx);
        
        // Draw items
        for (const item of this.items) {
            item.render(ctx);
        }
        
        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }
    }
    
    /**
     * Draw room layout (walls, trees, etc.)
     */
    drawLayout(ctx) {
        for (let y = 0; y < this.layout.length; y++) {
            const row = this.layout[y];
            
            for (let x = 0; x < row.length; x++) {
                const tile = row[x];
                const xPos = x * Config.TILE_SIZE;
                const yPos = y * Config.TILE_SIZE;
                
                switch (tile) {
                    case 'W': // Wall
                        ctx.fillStyle = Config.COLORS.wall;
                        ctx.fillRect(xPos, yPos, Config.TILE_SIZE, Config.TILE_SIZE);
                        break;
                    case 'T': // Tree
                        ctx.fillStyle = Config.COLORS.tree;
                        ctx.fillRect(xPos, yPos, Config.TILE_SIZE, Config.TILE_SIZE);
                        break;
                }
            }
        }
    }
    
    /**
     * Get tile at specific position
     */
    getTileAt(x, y) {
        const gridX = Math.floor(x / Config.TILE_SIZE);
        const gridY = Math.floor(y / Config.TILE_SIZE);
        
        // Check if coordinates are within bounds
        if (
            gridY < 0 || 
            gridY >= this.layout.length || 
            gridX < 0 || 
            gridX >= this.layout[0].length
        ) {
            return 'W'; // Out of bounds is treated as wall
        }
        
        return this.layout[gridY][gridX];
    }
    
    /**
     * Check if all enemies are defeated
     */
    areAllEnemiesDefeated() {
        return this.enemies.every(enemy => enemy.health <= 0);
    }
}
