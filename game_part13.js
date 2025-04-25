                
                // Check for collision with player
                const size = 48;
                if (
                    enemy.x + size/2 > player.x - player.width/2 &&
                    enemy.x - size/2 < player.x + player.width/2 &&
                    enemy.y + size/2 > player.y - player.height/2 &&
                    enemy.y - size/2 < player.y + player.height/2 &&
                    player.invulnerable <= 0
                ) {
                    damagePlayer(2);
                    
                    // Knockback player
                    const knockbackDistance = 30;
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
        }
        
        // Update enemy cooldown
        if (enemy.cooldown > 0) {
            enemy.cooldown--;
        }
    }
}

function checkCollisionWithWalls(x, y) {
    const room = rooms[gameState.currentRoom];
    const layout = room.layout;
    
    // Calculate grid position
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    
    // Check surrounding tiles
    for (let tileY = gridY - 1; tileY <= gridY + 1; tileY++) {
        for (let tileX = gridX - 1; tileX <= gridX + 1; tileX++) {
            // Skip out of bounds
            if (tileY < 0 || tileY >= layout.length || tileX < 0 || tileX >= layout[0].length) {
                continue;
            }
            
            const tile = layout[tileY][tileX];
            
            if (tile === 'W' || tile === 'T') {
                // Check collision with this wall
                const tileLeft = tileX * TILE_SIZE;
                const tileRight = tileLeft + TILE_SIZE;
                const tileTop = tileY * TILE_SIZE;
                const tileBottom = tileTop + TILE_SIZE;
                
                const radius = 12; // Collision radius
                
                if (
                    x + radius > tileLeft &&
                    x - radius < tileRight &&
                    y + radius > tileTop &&
                    y - radius < tileBottom
                ) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function checkRoomExits() {
    const room = rooms[gameState.currentRoom];
    
    for (const exit of room.exits) {
        if (
            player.x + player.width/2 > exit.x - exit.width/2 &&
            player.x - player.width/2 < exit.x + exit.width/2 &&
            player.y + player.height/2 > exit.y - exit.height/2 &&
            player.y - player.height/2 < exit.y + exit.height/2
        ) {
            // Check if this exit requires a key
            if (exit.requiresKey && !gameState.hasKey) {
                showMessage("You need a key to enter this door!");
                
                // Push player back
                if (exit.y < 100) { // Top exit
                    player.y += 10;
                } else { // Bottom exit
                    player.y -= 10;
                }
                
                return;
            }
            
            // Change room
            gameState.currentRoom = exit.toRoom;
            player.x = exit.toX;
            player.y = exit.toY;
            
            // Clear projectiles
            projectiles = [];
            
            return;
        }
    }
}