// Game state
const gameState = {
    isPlaying: false,
    playerHealth: 3,
    rupees: 0,
    hasKey: false,
    hasSword: true,
    hasBow: false,
    hasBomb: false,
    currentRoom: 'start',
    currentWeapon: 'sword',
    animationFrameId: null
};

// Constants
const TILE_SIZE = 32;
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 1.5;
const ARROW_SPEED = 6;

// Game objects
const player = {
    x: 400,
    y: 500,
    width: 24,
    height: 32,
    direction: 'up',
    isAttacking: false,
    attackCooldown: 0,
    invulnerable: 0,
    inventory: []
};

// Maps and rooms
const rooms = {
    start: {
        layout: [
            "WWWWWWWWWWWWWWWWWWWWWWWW",
            "W......................W",
            "W......................W",
            "W.......TTTT...........W",
            "W.......T..T...........W",
            "W.......T..T...........W",
            "W........TT............W",
            "W......................W",
            "W..........P............W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "WWWWWWWWWDWWWWWWWWWWWWWW"
        ],
        enemies: [
            { x: 200, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 },
            { x: 600, y: 250, type: 'octorok', health: 2, direction: 'down', cooldown: 0 }
        ],
        items: [
            { x: 400, y: 300, type: 'rupee', value: 5 }
        ],
        exits: [
            { x: 400, y: 576, width: 32, height: 8, toRoom: 'dungeon', toX: 400, toY: 64 }
        ]
    },
    dungeon: {
        layout: [
            "WWWWWWWWWDWWWWWWWWWWWWWW",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "WWWW......WWWW........W",
            "W.........WWWW........W",
            "W.........WWWW........W",
            "W......................W",
            "W......................W",
            "W...............K......W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "WWWWWWWWWLWWWWWWWWWWWWWW"
        ],
        enemies: [
            { x: 200, y: 200, type: 'moblin', health: 3, direction: 'left', cooldown: 0 },
            { x: 600, y: 400, type: 'moblin', health: 3, direction: 'right', cooldown: 0 }
        ],
        items: [
            { x: 600, y: 390, type: 'heart', value: 1 },
            { x: 600, y: 150, type: 'bow', value: 1 }
        ],
        exits: [
            { x: 400, y: 32, width: 32, height: 8, toRoom: 'start', toX: 400, toY: 544 },
            { x: 400, y: 576, width: 32, height: 8, toRoom: 'boss', toX: 400, toY: 64, requiresKey: true }
        ]
    },
    boss: {
        layout: [
            "WWWWWWWWWDWWWWWWWWWWWWWW",
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
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "W......................W",
            "WWWWWWWWWWWWWWWWWWWWWWWW"
        ],
        enemies: [
            { x: 400, y: 300, type: 'boss', health: 8, direction: 'down', cooldown: 0, phase: 1 }
        ],
        items: [],
        exits: [
            { x: 400, y: 32, width: 32, height: 8, toRoom: 'dungeon', toX: 400, toY: 544 }
        ]
    }
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
    heart: '#FF3333',
    key: '#FFCC00',
    bow: '#BB9955',
    bomb: '#555555'
};

// Initialize game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Event listeners
    document.addEventListener('keydown', e => {
        keysPressed[e.key] = true;
        
        // Weapon switching
        if (e.key === '1' && gameState.hasSword) {
            gameState.currentWeapon = 'sword';
            updateInventoryUI();
        } else if (e.key === '2' && gameState.hasBow) {
            gameState.currentWeapon = 'bow';
            updateInventoryUI();
        } else if (e.key === '3' && gameState.hasBomb) {
            gameState.currentWeapon = 'bomb';
            updateInventoryUI();
        }
        
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
    document.getElementById('play-again-button').addEventListener('click', startGame);
    
    // Initial render
    render();
}

function startGame() {
    // Reset game state
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
            case 'heart':
                ctx.fillStyle = colors.heart;
                ctx.beginPath();
                ctx.arc(item.x - 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.arc(item.x + 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.bezierCurveTo(item.x + 10, item.y, item.x + 10, item.y + 4, item.x, item.y + 12);
                ctx.bezierCurveTo(item.x - 10, item.y + 4, item.x - 10, item.y, item.x, item.y + 12);
                ctx.fill();
                break;
            case 'key':
                ctx.fillStyle = colors.key;
                ctx.beginPath();
                ctx.arc(item.x, item.y - 4, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(item.x - 2, item.y, 4, 12);
                ctx.fillRect(item.x, item.y + 8, 6, 4);
                break;
            case 'bow':
                ctx.fillStyle = colors.bow;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 10, 0.25 * Math.PI, 0.75 * Math.PI);
                ctx.stroke();
                ctx.fillRect(item.x - 1, item.y - 10, 2, 20);
                break;
            case 'bomb':
                ctx.fillStyle = colors.bomb;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.fillRect(item.x - 1, item.y - 10, 2, 4);
                break;
        }
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        switch (projectile.type) {
            case 'arrow':
                ctx.fillStyle = colors.projectile;
                ctx.save();
                ctx.translate(projectile.x, projectile.y);
                ctx.rotate(getRotationFromDirection(projectile.direction));
                ctx.fillRect(-10, -1, 20, 2);
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(5, -3);
                ctx.lineTo(5, 3);
                ctx.fill();
                ctx.restore();
                break;
            case 'enemy_projectile':
                ctx.fillStyle = '#FF9900';
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'bomb':
                ctx.fillStyle = colors.bomb;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, projectile.timeLeft > 30 ? 8 : 6 + Math.random() * 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'explosion':
                ctx.fillStyle = `rgba(255, ${100 + Math.floor(Math.random() * 155)}, 0, ${projectile.timeLeft / 30})`;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 30 - projectile.timeLeft, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
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
        let bombX = player.