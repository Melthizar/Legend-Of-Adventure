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

function getRotationFromDirection(direction) {
    switch (direction) {
        case 'up': return -Math.PI / 2;
        case 'down': return Math.PI / 2;
        case 'left': return Math.PI;
        case 'right': return 0;
        default: return 0;
    }
}

function attack() {
    player.isAttacking = true;
    player.attackCooldown = 20;
    
    // Sword attack
    if (gameState.currentWeapon === 'sword') {
        setTimeout(() => {
            player.isAttacking = false;
        }, 200);
        
        // Check enemy hits
        checkSwordHits();
        
        // Add particle effects
        createParticles(player.x, player.y, 5, '#FFFFFF');
    }
    // Bow attack
    else if (gameState.currentWeapon === 'bow' && gameState.hasBow) {
        player.isAttacking = false;
        
        // Create arrow projectile
        let arrowX = player.x;
        let arrowY = player.y;
        let arrowDx = 0;
        let arrowDy = 0;
        
        switch (player.direction) {
            case 'up':
                arrowY -= player.height / 2;
                arrowDy = -ARROW_SPEED;
                break;
            case 'down':
                arrowY += player.height / 2;
                arrowDy = ARROW_SPEED;
                break;
            case 'left':
                arrowX -= player.width / 2;
                arrowDx = -ARROW_SPEED;
                break;
            case 'right':
                arrowX += player.width / 2;
                arrowDx = ARROW_SPEED;
                break;
        }
        
        projectiles.push({
            x: arrowX,
            y: arrowY,
            dx: arrowDx,
            dy: arrowDy,
            type: 'arrow',
            direction: player.direction
        });
        
        // Sound effect (simulated)
        createParticles(arrowX, arrowY, 3, '#FFFF00');
    }
    // Bomb attack
    else if (gameState.currentWeapon === 'bomb' && gameState.hasBomb) {
        player.isAttacking = false;
        
        // Create bomb projectile
        let bombX = player.x;
        let bombY = player.y;