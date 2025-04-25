// Game state
const gameState = {
    isPlaying: false,
    playerHealth: 3,
    rupees: 0,
    hasSword: true,
    currentWeapon: 'sword',
    animationFrameId: null
};

// Constants
const TILE_SIZE = 32;
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 1.5;

// Game objects
const player = {
    x: 400,
    y: 300,
    width: 24,
    height: 32,
    direction: 'down',
    isAttacking: false,
    attackCooldown: 0,
    invulnerable: 0
};

// Room layout
const room = {
    layout: [
        "WWWWWWWWWWWWWWWWWWWWWWWW",
        "W......................W",
        "W......................W",
        "W.......TTTT...........W",
        "W.......T..T...........W",
        "W.......T..T...........W",
        "W........TT............W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "W......................W",
        "WWWWWWWWWWWWWWWWWWWWWWWW"
    ],
    enemies: [
        { x: 200, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
        { x: 600, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
        { x: 400, y: 150, type: 'boss', health: 5, direction: 'down', cooldown: 0 }
    ],
    items: [
        { x: 300, y: 300, type: 'rupee', value: 5 },
        { x: 500, y: 300, type: 'heart', value: 1 }
    ]
};

// Game elements
let canvas, ctx;
let keysPressed = {};
let projectiles = [];
let particles = [];
let messages = [];

// Colors (simulating sprites)
const colors = {
    floor: '#338833',
    wall: '#775533',
    player: '#5599FF',
    enemy: '#FF5555',
    boss: '#FF0000',
    projectile: '#FFFF00',
    rupee: '#00FF00',
    heart: '#FF3333'
};

// Initialize game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Event listeners
    document.addEventListener('keydown', e => {
        keysPressed[e.key] = true;
        
        // Attack
        if (e.key === ' ' && !player.isAttacking && player.attackCooldown <= 0) {
            attack();
        }
    });
    
    document.addEventListener('keyup', e => {
        keysPressed[e.key] = false;
    });
    
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('victory-button').addEventListener('click', startGame);
    
    // Initial render
    render();
}

function startGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.playerHealth = 3;
    gameState.rupees = 0;
    
    // Reset player
    player.x = 400;
    player.y = 300;
    player.direction = 'down';
    player.isAttacking = false;
    player.attackCooldown = 0;
    player.invulnerable = 0;
    
    // Reset enemies and items
    room.enemies = [
        { x: 200, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
        { x: 600, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
        { x: 400, y: 150, type: 'boss', health: 5, direction: 'down', cooldown: 0 }
    ];
    
    room.items = [
        { x: 300, y: 300, type: 'rupee', value: 5 },
        { x: 500, y: 300, type: 'heart', value: 1 }
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
    
    // Check for victory
    checkVictory();
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
