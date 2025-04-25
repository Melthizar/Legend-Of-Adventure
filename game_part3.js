    gameState.isPlaying = true;
    gameState.playerHealth = 3;
    gameState.rupees = 0;
    gameState.hasKey = false;
    gameState.hasSword = true;
    gameState.hasBow = false;
    gameState.hasBomb = false;
    gameState.currentRoom = 'start';
    gameState.currentWeapon = 'sword';
    
    // Reset player
    player.x = 400;
    player.y = 500;
    player.direction = 'up';
    player.isAttacking = false;
    player.attackCooldown = 0;
    player.invulnerable = 0;
    
    // Reset rooms (deep copy to restore enemies and items)
    rooms.start.enemies = [
        { x: 200, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
        { x: 600, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 }
    ];
    rooms.dungeon.enemies = [
        { x: 200, y: 200, type: 'moblin', health: 3, direction: 'left', cooldown: 0 },
        { x: 600, y: 400, type: 'moblin', health: 3, direction: 'right', cooldown: 0 }
    ];
    rooms.boss.enemies = [
        { x: 400, y: 300, type: 'boss', health: 8, direction: 'down', cooldown: 0, phase: 1 }
    ];
    
    rooms.start.items = [
        { x: 400, y: 300, type: 'rupee', value: 5 }
    ];
    rooms.dungeon.items = [
        { x: 600, y: 390, type: 'heart', value: 1 },
        { x: 600, y: 150, type: 'bow', value: 1 }
    ];
    
    // Clear arrays
    projectiles = [];
    particles = [];
    messages = [];
    
    // Hide UI screens
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    
    // Update UI
    updateHealthUI();
    updateRupeesUI();
    updateInventoryUI();
    
    // Start game loop
    if (!gameState.animationFrameId) {
        gameLoop();
    }
}

function gameLoop() {
    update();
    render();
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function update() {
    if (!gameState.isPlaying) return;
    
    // Player movement
    let dx = 0;
    let dy = 0;
    
    if (keysPressed.ArrowUp || keysPressed.w) {
        dy -= PLAYER_SPEED;
        player.direction = 'up';
    }
    if (keysPressed.ArrowDown || keysPressed.s) {
        dy += PLAYER_SPEED;
        player.direction = 'down';
    }
    if (keysPressed.ArrowLeft || keysPressed.a) {
        dx -= PLAYER_SPEED;
        player.direction = 'left';
    }
    if (keysPressed.ArrowRight || keysPressed.d) {
        dx += PLAYER_SPEED;
        player.direction = 'right';
    }
    
    // Apply movement