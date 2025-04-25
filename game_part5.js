                case 'D': // Door (open)
                    ctx.fillStyle = '#CCAA66';
                    ctx.fillRect(xPos, yPos, TILE_SIZE, TILE_SIZE);
                    break;
                case 'L': // Locked door
                    ctx.fillStyle = gameState.hasKey ? '#CCAA66' : '#AA6622';
                    ctx.fillRect(xPos, yPos, TILE_SIZE, TILE_SIZE);
                    if (!gameState.hasKey) {
                        ctx.fillStyle = '#FFCC00';
                        ctx.beginPath();
                        ctx.arc(xPos + TILE_SIZE/2, yPos + TILE_SIZE/2, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
            }
        }
    }
}

function drawPlayer() {
    // Skip drawing during invulnerability every few frames for flashing effect
    if (player.invulnerable > 0 && player.invulnerable % 6 < 3) {
        return;
    }
    
    // Draw player body
    ctx.fillStyle = colors.player;
    ctx.fillRect(player.x - player.width/2, player.y - player.height/2, player.width, player.height);
    
    // Draw direction indicator
    ctx.fillStyle = '#FFFFFF';
    switch (player.direction) {
        case 'up':
            ctx.beginPath();
            ctx.moveTo(player.x, player.y - player.height/2 - 5);
            ctx.lineTo(player.x - 5, player.y - player.height/2 + 5);
            ctx.lineTo(player.x + 5, player.y - player.height/2 + 5);
            ctx.fill();
            break;
        case 'down':
            ctx.beginPath();
            ctx.moveTo(player.x, player.y + player.height/2 + 5);
            ctx.lineTo(player.x - 5, player.y + player.height/2 - 5);
            ctx.lineTo(player.x + 5, player.y + player.height/2 - 5);
            ctx.fill();
            break;
        case 'left':
            ctx.beginPath();
            ctx.moveTo(player.x - player.width/2 - 5, player.y);
            ctx.lineTo(player.x - player.width/2 + 5, player.y - 5);
            ctx.lineTo(player.x - player.width/2 + 5, player.y + 5);
            ctx.fill();
            break;
        case 'right':
            ctx.beginPath();
            ctx.moveTo(player.x + player.width/2 + 5, player.y);
            ctx.lineTo(player.x + player.width/2 - 5, player.y - 5);
            ctx.lineTo(player.x + player.width/2 - 5, player.y + 5);
            ctx.fill();
            break;
    }
    
    // Draw weapon if attacking
    if (player.isAttacking) {
        ctx.fillStyle = '#CCCCCC';
        
        if (gameState.currentWeapon === 'sword') {
            switch (player.direction) {
                case 'up':
                    ctx.fillRect(player.x - 3, player.y - player.height/2 - 20, 6, 20);
                    break;
                case 'down':
                    ctx.fillRect(player.x - 3, player.y + player.height/2, 6, 20);
                    break;
                case 'left':
                    ctx.fillRect(player.x - player.width/2 - 20, player.y - 3, 20, 6);
                    break;
                case 'right':
                    ctx.fillRect(player.x + player.width/2, player.y - 3, 20, 6);
                    break;
            }
        }
    }
}