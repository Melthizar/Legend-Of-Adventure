function updateEnemies() {
    const room = rooms[gameState.currentRoom];
    
    for (const enemy of room.enemies) {
        if (enemy.health <= 0) continue;
        
        // Update enemy cooldown
        if (enemy.cooldown > 0) {
            enemy.cooldown--;
        }
        
        // Enemy AI based on type
        if (enemy.type === 'octorok') {
            // Random movement
            if (Math.random() < 0.01) {
                const directions = ['up', 'down', 'left', 'right'];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }
            
            // Move in current direction
            let dx = 0;
            let dy = 0;
            
            switch (enemy.direction) {
                case 'up':
                    dy -= ENEMY_SPEED / 2;
                    break;
                case 'down':
                    dy += ENEMY_SPEED / 2;
                    break;
                case 'left':
                    dx -= ENEMY_SPEED / 2;
                    break;
                case 'right':
                    dx += ENEMY_SPEED / 2;
                    break;
            }
            
            // Apply movement if no wall collision
            const newX = enemy.x + dx;
            const newY = enemy.y + dy;
            
            if (!checkCollisionWithWalls(newX, enemy.y)) {
                enemy.x = newX;
            } else {
                // Change direction if hit wall
                enemy.direction = enemy.direction === 'left' ? 'right' : enemy.direction === 'right' ? 'left' : enemy.direction;
            }
            
            if (!checkCollisionWithWalls(enemy.x, newY)) {
                enemy.y = newY;
            } else {
                // Change direction if hit wall
                enemy.direction = enemy.direction === 'up' ? 'down' : enemy.direction === 'down' ? 'up' : enemy.direction;
            }
            
            // Shoot at player occasionally
            if (enemy.cooldown <= 0 && Math.random() < 0.005) {
                // Calculate direction to player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only shoot if player is in line of sight
                if (distance < 200) {
                    const normalizedDx = dx / distance;
                    const normalizedDy = dy / distance;
                    
                    // Create projectile
                    projectiles.push({
                        x: enemy.x,
                        y: enemy.y,
                        dx: normalizedDx * 3,
                        dy: normalizedDy * 3,
                        type: 'enemy_projectile'
                    });
                    
                    enemy.cooldown = 60;
                }
            }
        } else if (enemy.type === 'moblin') {
            // Chase player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                // Update direction based on player position
                if (Math.abs(dx) > Math.abs(dy)) {
                    enemy.direction = dx > 0 ? 'right' : 'left';
                } else {
                    enemy.direction = dy > 0 ? 'down' : 'up';
                }
                
                // Move towards player
                const moveSpeed = ENEMY_SPEED * 0.75;
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                const newX = enemy.x + normalizedDx * moveSpeed;
                const newY = enemy.y + normalizedDy * moveSpeed;
                
                if (!checkCollisionWithWalls(newX, enemy.y)) {
                    enemy.x = newX;
                }
                
                if (!checkCollisionWithWalls(enemy.x, newY)) {
                    enemy.y = newY;
                }
            }
            
            // Check for collision with player
            const size = 24;
            if (
                enemy.x + size/2 > player.x - player.width/2 &&
                enemy.x - size/2 < player.x + player.width/2 &&
                enemy.y + size/2 > player.y - player.height/2 &&
                enemy.y - size/2 < player.y + player.height/2 &&
                player.invulnerable <= 0
            ) {
                damagePlayer(1);
                
                // Knockback player
                const knockbackDistance = 20;
                switch (enemy.direction) {
                    case 'up':
                        player.y -= knockbackDistance;
                        break;
                    case 'down':
                        player.y += knockbackDistance;
                        break;
                    case 'left':
                        player.x -= knockbackDistance;
                        break;
                    case 'right':
                        player.x += knockbackDistance;
                        break;
                }
            }
        }