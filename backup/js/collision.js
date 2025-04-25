/**
 * Collision class
 * Handles collision detection in the game
 */
class Collision {
    constructor(room) {
        this.room = room;
    }
    
    /**
     * Check if a rectangle collides with wall/tree tiles.
     * Assumes rectX, rectY are the center of the rectangle.
     */
    checkRectCollisionWithWalls(rectX, rectY, rectWidth, rectHeight) {
        // Calculate the rectangle's boundaries
        const rectLeft = rectX - rectWidth / 2;
        const rectRight = rectX + rectWidth / 2;
        const rectTop = rectY - rectHeight / 2;
        const rectBottom = rectY + rectHeight / 2;

        // Determine the range of grid cells the rectangle overlaps
        const minTileX = Math.floor(rectLeft / Config.TILE_SIZE);
        const maxTileX = Math.floor(rectRight / Config.TILE_SIZE);
        const minTileY = Math.floor(rectTop / Config.TILE_SIZE);
        const maxTileY = Math.floor(rectBottom / Config.TILE_SIZE);

        // Check each overlapping tile
        for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
            for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
                // Get tile type at this grid position
                // Note: getTileAt uses world coordinates, so convert back
                const tile = this.room.getTileAt(tileX * Config.TILE_SIZE + Config.TILE_SIZE / 2, 
                                                 tileY * Config.TILE_SIZE + Config.TILE_SIZE / 2);
                
                if (tile === 'W' || tile === 'T') {
                    // Calculate the tile's boundaries
                    const tileLeft = tileX * Config.TILE_SIZE;
                    const tileRight = tileLeft + Config.TILE_SIZE;
                    const tileTop = tileY * Config.TILE_SIZE;
                    const tileBottom = tileTop + Config.TILE_SIZE;
                    
                    // Perform AABB collision check between the rect and the tile
                    if (rectLeft < tileRight && rectRight > tileLeft &&
                        rectTop < tileBottom && rectBottom > tileTop) {
                        return true; // Collision detected
                    }
                }
            }
        }
        
        return false; // No collision with walls/trees in the checked range
    }
    
    /**
     * Check collisions between player sword and enemies
     */
    checkSwordEnemyCollisions(player, particles, items) {
        if (!player.isAttacking) return false;
        
        const swordHitbox = player.getSwordHitbox();
        let hit = false;
        
        // Check each enemy
        for (const enemy of this.room.enemies) {
            if (enemy.health <= 0) continue;
            
            // Simple hitbox collision - Use enemy width/height
            // const enemySize = enemy.type === 'boss' ? Config.BOSS_SIZE : Config.OCTOROK_SIZE;
            
            if (
                swordHitbox.x + swordHitbox.width/2 > enemy.x - enemy.width/2 && // Use enemy.width
                swordHitbox.x - swordHitbox.width/2 < enemy.x + enemy.width/2 && // Use enemy.width
                swordHitbox.y + swordHitbox.height/2 > enemy.y - enemy.height/2 && // Use enemy.height
                swordHitbox.y - swordHitbox.height/2 < enemy.y + enemy.height/2 // Use enemy.height
            ) {
                // Use Config.SWORD_DAMAGE - Pass collision object (this)
                if (enemy.takeDamage(Config.SWORD_DAMAGE, player.direction, particles, items, this)) { 
                    hit = true;
                }
            }
        }
        
        return hit;
    }
    
    /**
     * Check collisions between projectiles and enemies/player
     */
    checkProjectileCollisions(projectiles, player, particles, items) {
        // Check each projectile
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            
            // Skip inactive projectiles
            if (!projectile.active) continue;
            
            // Check wall collision using the new method
            if (this.checkRectCollisionWithWalls(projectile.x, projectile.y, projectile.width, projectile.height)) {
                projectile.deactivate(particles);
                projectiles.splice(i, 1);
                continue;
            }
            
            // Check player collision (for enemy projectiles)
            if (projectile.type === 'enemy' && player.invulnerable <= 0 && projectile.collidesWith(player)) {
                player.takeDamage(Config.PROJECTILE_DAMAGE); // Use Config
                projectile.deactivate(particles);
                projectiles.splice(i, 1);
                continue;
            }
            
            // Check enemy collision (for player projectiles)
            if (projectile.type === 'player') {
                for (const enemy of this.room.enemies) {
                    if (enemy.health <= 0) continue;
                    
                    if (projectile.collidesWith(enemy)) {
                        // Use Config.PROJECTILE_DAMAGE - Pass collision object (this)
                        enemy.takeDamage(Config.PROJECTILE_DAMAGE, player.direction, particles, items, this); 
                        projectile.deactivate(particles);
                        projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}
