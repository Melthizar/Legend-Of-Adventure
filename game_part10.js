function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Move projectile
        projectile.x += projectile.dx || 0;
        projectile.y += projectile.dy || 0;
        
        // Check for collision with walls
        if (checkCollisionWithWalls(projectile.x, projectile.y)) {
            // Handle based on projectile type
            if (projectile.type === 'bomb') {
                // Explode bomb if it hits a wall
                explodeBomb(projectile);
            } else {
                // Remove projectile if it hits a wall
                projectiles.splice(i, 1);
                createParticles(projectile.x, projectile.y, 5, '#FFFF00');
            }
            
            continue;
        }
        
        // Check for collision with enemies (only player projectiles)
        if (projectile.type === 'arrow' || projectile.type === 'explosion') {
            const room = rooms[gameState.currentRoom];
            
            for (const enemy of room.enemies) {
                if (enemy.health <= 0) continue;
                
                const size = enemy.type === 'boss' ? 48 : 24;
                
                // Check collision
                if (
                    projectile.x + 5 > enemy.x - size / 2 &&
                    projectile.x - 5 < enemy.x + size / 2 &&
                    projectile.y + 5 > enemy.y - size / 2 &&
                    projectile.y - 5 < enemy.y + size / 2
                ) {
                    // Damage enemy
                    damageEnemy(enemy, projectile.type === 'arrow' ? 1 : 2);
                    
                    // Remove projectile (not for explosions)
                    if (projectile.type !== 'explosion') {
                        projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        
        // Check for collision with player (only enemy projectiles)
        if (projectile.type === 'enemy_projectile' && player.invulnerable <= 0) {
            // Check collision
            if (
                projectile.x + 5 > player.x - player.width / 2 &&
                projectile.x - 5 < player.x + player.width / 2 &&
                projectile.y + 5 > player.y - player.height / 2 &&
                projectile.y - 5 < player.y + player.height / 2
            ) {
                // Damage player
                damagePlayer(1);
                
                // Remove projectile
                projectiles.splice(i, 1);
                continue;
            }
        }
        
        // Special updates for different projectile types
        if (projectile.type === 'bomb') {
            projectile.timeLeft--;
            
            if (projectile.timeLeft <= 0) {
                explodeBomb(projectile);
                projectiles.splice(i, 1);
            }
        } else if (projectile.type === 'explosion') {
            projectile.timeLeft--;
            
            if (projectile.timeLeft <= 0) {
                projectiles.splice(i, 1);
            }
        }
        
        // Check if projectile is out of bounds
        if (
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height
        ) {
            projectiles.splice(i, 1);
        }
    }
}

function explodeBomb(bomb) {
    // Create explosion projectile
    projectiles.push({
        x: bomb.x,
        y: bomb.y,
        type: 'explosion',
        timeLeft: 30
    });
    
    // Create explosion particles
    createParticles(bomb.x, bomb.y, 30, '#FF9900');
    
    // Sound effect (simulated)
    showMessage("BOOM!");
}