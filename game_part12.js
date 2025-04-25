        else if (enemy.type === 'boss') {
            // Boss behavior depends on phase
            if (enemy.phase === 1) {
                // Phase 1: Move around and shoot projectiles
                
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
                        dy -= ENEMY_SPEED / 3;
                        break;
                    case 'down':
                        dy += ENEMY_SPEED / 3;
                        break;
                    case 'left':
                        dx -= ENEMY_SPEED / 3;
                        break;
                    case 'right':
                        dx += ENEMY_SPEED / 3;
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
                if (enemy.cooldown <= 0 && Math.random() < 0.02) {
                    // Shoot in multiple directions
                    const directions = [
                        { dx: 1, dy: 0 },
                        { dx: -1, dy: 0 },
                        { dx: 0, dy: 1 },
                        { dx: 0, dy: -1 }
                    ];
                    
                    for (const dir of directions) {
                        projectiles.push({
                            x: enemy.x,
                            y: enemy.y,
                            dx: dir.dx * 2,
                            dy: dir.dy * 2,
                            type: 'enemy_projectile'
                        });
                    }
                    
                    enemy.cooldown = 90;
                }
                
                // Switch to phase 2 when health is low
                if (enemy.health <= 4) {
                    enemy.phase = 2;
                    showMessage("The boss is angry!");
                    createParticles(enemy.x, enemy.y, 30, '#FF0000');
                }
            } else if (enemy.phase === 2) {
                // Phase 2: Charge at player and shoot more projectiles
                
                // Chase player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Update direction based on player position
                if (Math.abs(dx) > Math.abs(dy)) {
                    enemy.direction = dx > 0 ? 'right' : 'left';
                } else {
                    enemy.direction = dy > 0 ? 'down' : 'up';
                }
                
                // Move towards player
                const moveSpeed = ENEMY_SPEED;
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
                
                // Shoot at player frequently
                if (enemy.cooldown <= 0 && Math.random() < 0.05) {
                    // Calculate direction to player
                    const normalizedDx = dx / distance;
                    const normalizedDy = dy / distance;
                    
                    // Create projectiles in a spread pattern
                    for (let i = -1; i <= 1; i++) {
                        const angle = i * 0.3;
                        const rotatedDx = normalizedDx * Math.cos(angle) - normalizedDy * Math.sin(angle);
                        const rotatedDy = normalizedDx * Math.sin(angle) + normalizedDy * Math.cos(angle);
                        
                        projectiles.push({
                            x: enemy.x,
                            y: enemy.y,
                            dx: rotatedDx * 4,
                            dy: rotatedDy * 4,
                            type: 'enemy_projectile'
                        });
                    }
                    
                    enemy.cooldown = 45;
                }