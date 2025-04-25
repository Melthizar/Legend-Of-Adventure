    if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const normalize = Math.sqrt(2) / 2;
            dx *= normalize;
            dy *= normalize;
        }
        
        // Move player
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // Collision detection with walls
        if (!checkCollisionWithWalls(newX, player.y)) {
            player.x = newX;
        }
        
        if (!checkCollisionWithWalls(player.x, newY)) {
            player.y = newY;
        }
        
        // Check room exits
        checkRoomExits();
    }
    
    // Update attack cooldown
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    
    // Update invulnerability
    if (player.invulnerable > 0) {
        player.invulnerable--;
    }
    
    // Update projectiles
    updateProjectiles();
    
    // Update enemies
    updateEnemies();
    
    // Check collisions with items
    checkItemCollisions();
    
    // Update particles
    updateParticles();
    
    // Update messages
    updateMessages();
}

function render() {
    // Clear canvas
    ctx.fillStyle = colors.floor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw room
    drawRoom();
    
    // Draw items
    drawItems();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw enemies
    drawEnemies();
    
    // Draw player
    drawPlayer();
    
    // Draw particles
    drawParticles();
}

function drawRoom() {
    const room = rooms[gameState.currentRoom];
    const layout = room.layout;
    
    for (let y = 0; y < layout.length; y++) {
        const row = layout[y];
        for (let x = 0; x < row.length; x++) {
            const tile = row[x];
            const xPos = x * TILE_SIZE;
            const yPos = y * TILE_SIZE;
            
            switch (tile) {
                case 'W': // Wall
                    ctx.fillStyle = colors.wall;
                    ctx.fillRect(xPos, yPos, TILE_SIZE, TILE_SIZE);
                    break;
                case 'T': // Tree
                    ctx.fillStyle = '#006600';
                    ctx.fillRect(xPos, yPos, TILE_SIZE, TILE_SIZE);
                    break;