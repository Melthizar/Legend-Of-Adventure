        
        switch (player.direction) {
            case 'up':
                bombY -= player.height;
                break;
            case 'down':
                bombY += player.height;
                break;
            case 'left':
                bombX -= player.width;
                break;
            case 'right':
                bombX += player.width;
                break;
        }
        
        projectiles.push({
            x: bombX,
            y: bombY,
            dx: 0,
            dy: 0,
            type: 'bomb',
            timeLeft: 90
        });
        
        // Sound effect (simulated)
        createParticles(bombX, bombY, 3, '#555555');
    }
}

function checkSwordHits() {
    const room = rooms[gameState.currentRoom];
    const swordRange = 30;
    
    let swordX = player.x;
    let swordY = player.y;
    
    switch (player.direction) {
        case 'up':
            swordY -= player.height / 2 + swordRange / 2;
            break;
        case 'down':
            swordY += player.height / 2 + swordRange / 2;
            break;
        case 'left':
            swordX -= player.width / 2 + swordRange / 2;
            break;
        case 'right':
            swordX += player.width / 2 + swordRange / 2;
            break;
    }
    
    for (const enemy of room.enemies) {
        if (enemy.health <= 0) continue;
        
        const size = enemy.type === 'boss' ? 48 : 24;
        
        // Check collision with sword
        if (
            swordX + swordRange / 2 > enemy.x - size / 2 &&
            swordX - swordRange / 2 < enemy.x + size / 2 &&
            swordY + swordRange / 2 > enemy.y - size / 2 &&
            swordY - swordRange / 2 < enemy.y + size / 2
        ) {
            damageEnemy(enemy, 1);
        }
    }
}

function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    
    // Create damage particles
    createParticles(enemy.x, enemy.y, 10, '#FF0000');
    
    // Check if enemy is defeated
    if (enemy.health <= 0) {
        // Create death particles
        createParticles(enemy.x, enemy.y, 20, '#FF5555');
        
        // Drop item chance
        if (Math.random() < 0.3) {
            const itemType = Math.random() < 0.7 ? 'rupee' : 'heart';
            
            rooms[gameState.currentRoom].items.push({
                x: enemy.x,
                y: enemy.y,
                type: itemType,
                value: itemType === 'rupee' ? 5 : 1
            });
        }
        
        // Check for boss defeat
        if (enemy.type === 'boss') {
            showVictoryScreen();
        }
        
        // Check for key drop
        if (enemy.type === 'moblin' && !gameState.hasKey && gameState.currentRoom === 'dungeon') {
            rooms[gameState.currentRoom].items.push({
                x: enemy.x,
                y: enemy.y,
                type: 'key',
                value: 1
            });
            
            showMessage("A key appeared!");
        }
    } else {
        // Knockback
        const knockbackDistance = 10;
        
        switch (player.direction) {
            case 'up':
                enemy.y -= knockbackDistance;
                break;
            case 'down':
                enemy.y += knockbackDistance;
                break;
            case 'left':
                enemy.x -= knockbackDistance;
                break;
            case 'right':
                enemy.x += knockbackDistance;
                break;
        }
    }
}