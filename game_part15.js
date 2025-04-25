function damagePlayer(damage) {
    if (player.invulnerable > 0) return;
    
    gameState.playerHealth -= damage;
    player.invulnerable = 60;  // Invulnerable for 1 second
    
    // Update health UI
    updateHealthUI();
    
    // Create damage particles
    createParticles(player.x, player.y, 20, '#FF0000');
    
    // Check game over
    if (gameState.playerHealth <= 0) {
        showGameOverScreen();
    }
}

function updateHealthUI() {
    const heartsElement = document.getElementById('hearts');
    heartsElement.textContent = '♥'.repeat(gameState.playerHealth);
}

function updateRupeesUI() {
    const rupeesElement = document.getElementById('rupees');
    rupeesElement.textContent = gameState.rupees;
}

function updateInventoryUI() {
    const swordElement = document.getElementById('sword');
    const bowElement = document.getElementById('bow');
    const bombElement = document.getElementById('bomb');
    const keyElement = document.getElementById('key');
    
    // Update active state
    swordElement.classList.remove('active');
    bowElement.classList.remove('active');
    bombElement.classList.remove('active');
    
    switch (gameState.currentWeapon) {
        case 'sword':
            swordElement.classList.add('active');
            break;
        case 'bow':
            bowElement.classList.add('active');
            break;
        case 'bomb':
            bombElement.classList.add('active');
            break;
    }
    
    // Update availability
    bowElement.style.opacity = gameState.hasBow ? '1' : '0.3';
    bombElement.style.opacity = gameState.hasBomb ? '1' : '0.3';
    keyElement.style.opacity = gameState.hasKey ? '1' : '0.3';
}

function showGameOverScreen() {
    gameState.isPlaying = false;
    document.getElementById('game-over').style.display = 'flex';
    cancelAnimationFrame(gameState.animationFrameId);
    gameState.animationFrameId = null;
}

function showVictoryScreen() {
    gameState.isPlaying = false;
    document.getElementById('victory').style.display = 'flex';
    cancelAnimationFrame(gameState.animationFrameId);
    gameState.animationFrameId = null;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
