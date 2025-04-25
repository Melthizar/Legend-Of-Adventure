function drawEnemies() {
    for (const enemy of room.enemies) {
        // Skip if enemy is dead
        if (enemy.health <= 0) continue;
        
        let size = 24;
        if (enemy.type === 'boss') {
            size = 40;
        }
        
        // Draw enemy body
        ctx.fillStyle = enemy.type === 'boss' ? colors.boss : colors.enemy;
        ctx.fillRect(enemy.x - size/2, enemy.y - size/2, size, size);
        
        // Draw enemy health
        const healthBarWidth = size;
        const healthBarHeight = 4;
        const healthPercentage = enemy.type === 'boss' ? enemy.health / 5 : enemy.health / 2;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - size/2 - 10, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - size/2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Draw direction indicator
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
        
        // Add crown for boss
        if (enemy.type === 'boss') {
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
            case 'heart':
                ctx.fillStyle = colors.heart;
                ctx.beginPath();
                ctx.arc(item.x - 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.arc(item.x + 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.bezierCurveTo(item.x + 10, item.y, item.x + 10, item.y + 4, item.x, item.y + 12);
                ctx.bezierCurveTo(item.x - 10, item.y + 4, item.x - 10, item.y, item.x, item.y + 12);
                ctx.fill();
                break;
        }
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        ctx.fillStyle = projectile.type === 'enemy_projectile' ? '#FF9900' : colors.projectile;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawParticles() {
    for (const particle of particles) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function attack() {
    player.isAttacking = true;
    player.attackCooldown = 20;
    
    setTimeout(() => {
        player.isAttacking = false;
    }, 200);
    
    // Check enemy hits
    checkSwordHits();
    
    // Add particle effects
    createParticles(player.x, player.y, 5, '#FFFFFF');
}

function checkSwordHits() {
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
        
        const size = enemy.type === 'boss' ? 40 : 24;
        
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
            
            room.items.push({
                x: enemy.x,
                y: enemy.y,
                type: itemType,
                value: itemType === 'rupee' ? 5 : 1
            });
        }
        
        // Show message
        if (enemy.type === 'boss') {
            showMessage("You defeated the boss!");
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

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Move projectile
        projectile.x += projectile.dx || 0;
        projectile.y += projectile.dy || 0;
        
        // Check for collision with walls
        if (checkCollisionWithWalls(projectile.x, projectile.y)) {
            // Remove projectile if it hits a wall
            projectiles.splice(i, 1);
            createParticles(projectile.x, projectile.y, 5, '#FFFF00');
            continue;
        }
        
        // Check for collision with enemies (only player projectiles)
        if (projectile.type !== 'enemy_projectile') {
            for (const enemy of room.enemies) {
                if (enemy.health <= 0) continue;
                
                const size = enemy.type === 'boss' ? 40 : 24;
                
                // Check collision
                if (
                    projectile.x + 5 > enemy.x - size / 2 &&
                    projectile.x - 5 < enemy.x + size / 2 &&
                    projectile.y + 5 > enemy.y - size / 2 &&
                    projectile.y - 5 < enemy.y + size / 2
                ) {
                    // Damage enemy
                    damageEnemy(enemy, 1);
                    
                    // Remove projectile
                    projectiles.splice(i, 1);
                    break;
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
