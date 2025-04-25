function drawEnemies() {
    const room = rooms[gameState.currentRoom];
    
    for (const enemy of room.enemies) {
        // Skip if enemy is dead
        if (enemy.health <= 0) continue;
        
        let size = 24;
        if (enemy.type === 'boss') {
            size = 48;
        }
        
        // Draw enemy body
        ctx.fillStyle = enemy.type === 'boss' ? colors.boss : colors.enemy;
        ctx.fillRect(enemy.x - size/2, enemy.y - size/2, size, size);
        
        // Draw enemy health
        const healthBarWidth = size;
        const healthBarHeight = 4;
        const healthPercentage = enemy.type === 'boss' ? enemy.health / 8 : enemy.health / (enemy.type === 'moblin' ? 3 : 2);
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - size/2 - 10, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - size/2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Draw direction indicator
        if (enemy.type !== 'boss') {
            ctx.fillStyle = '#FFFFFF';
            switch (enemy.direction) {
                case 'up':
                    ctx.beginPath();
                    ctx.moveTo(enemy.x, enemy.y - size/2 - 5);
                    ctx.lineTo(enemy.x - 5, enemy.y - size/2 + 5);
                    ctx.lineTo(enemy.x + 5, enemy.y - size/2 + 5);
                    ctx.fill();
                    break;
                case 'down':
                    ctx.beginPath();
                    ctx.moveTo(enemy.x, enemy.y + size/2 + 5);
                    ctx.lineTo(enemy.x - 5, enemy.y + size/2 - 5);
                    ctx.lineTo(enemy.x + 5, enemy.y + size/2 - 5);
                    ctx.fill();
                    break;
                case 'left':
                    ctx.beginPath();
                    ctx.moveTo(enemy.x - size/2 - 5, enemy.y);
                    ctx.lineTo(enemy.x - size/2 + 5, enemy.y - 5);
                    ctx.lineTo(enemy.x - size/2 + 5, enemy.y + 5);
                    ctx.fill();
                    break;
                case 'right':
                    ctx.beginPath();
                    ctx.moveTo(enemy.x + size/2 + 5, enemy.y);
                    ctx.lineTo(enemy.x + size/2 - 5, enemy.y - 5);
                    ctx.lineTo(enemy.x + size/2 - 5, enemy.y + 5);
                    ctx.fill();
                    break;
            }
        } else {
            // Add crown for boss
            ctx.fillStyle = '#FFCC00';
            ctx.beginPath();
            ctx.moveTo(enemy.x - 15, enemy.y - size/2 - 5);
            ctx.lineTo(enemy.x + 15, enemy.y - size/2 - 5);
            ctx.lineTo(enemy.x + 20, enemy.y - size/2 + 5);
            ctx.lineTo(enemy.x + 10, enemy.y - size/2);
            ctx.lineTo(enemy.x, enemy.y - size/2 + 5);
            ctx.lineTo(enemy.x - 10, enemy.y - size/2);
            ctx.lineTo(enemy.x - 20, enemy.y - size/2 + 5);
            ctx.fill();
        }
    }
}

function drawItems() {
    const room = rooms[gameState.currentRoom];
    
    for (const item of room.items) {
        switch (item.type) {
            case 'rupee':
                ctx.fillStyle = colors.rupee;
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - 8);
                ctx.lineTo(item.x + 8, item.y);
                ctx.lineTo(item.x, item.y + 8);
                ctx.lineTo(item.x - 8, item.y);
                ctx.closePath();
                ctx.fill();
                break;