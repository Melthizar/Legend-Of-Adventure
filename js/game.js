// Basic game setup - will be expanded

console.log("Game script loaded.");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const PLAYER_SPEED = 5;

// Player object (simple version)
const player = {
    x: 100,
    y: 100,
    width: 50,  // Placeholder size
    height: 50, // Placeholder size
    dx: 0, // Velocity x
    dy: 0  // Velocity y
};

// Ground rectangle
const ground = {
    x: 0,
    y: canvas.height - 50, // Position ground 50px from bottom
    width: canvas.width,
    height: 50
};

// Input state
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// --- Game Loop ---
function gameLoop() {
    // 1. Update game state
    update();

    // 2. Render game
    render();

    // 3. Request next frame
    requestAnimationFrame(gameLoop);
}

// --- Update Function ---
function update() {
    // Apply gravity
    player.dy += GRAVITY;

    // Handle horizontal movement input
    player.dx = 0; // Reset horizontal speed each frame
    if (keys.ArrowLeft) {
        player.dx = -PLAYER_SPEED;
    }
    if (keys.ArrowRight) {
        player.dx = PLAYER_SPEED;
    }

    // Update position
    player.x += player.dx;
    player.y += player.dy;

    // Collision detection (simple ground collision)
    // Check if player bottom is below ground top
    if (player.y + player.height > ground.y) {
        player.y = ground.y - player.height; // Place player on top of ground
        player.dy = 0; // Stop vertical movement
    }

    // Optional: Keep player within canvas bounds (horizontal)
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// --- Render Function ---
function render() {
    // Clear canvas (sky color is set in CSS)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

    // Draw player (as a rectangle for now)
    ctx.fillStyle = '#FF0000'; // Red
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// --- Start Game ---
console.log("Starting game loop...");
requestAnimationFrame(gameLoop); 