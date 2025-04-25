// Basic game setup - will be expanded

console.log("Game script loaded.");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const GRAVITY = 0.5;
const PLAYER_SPEED = 3; // Adjusted speed slightly for sprites
const ANIMATION_SPEED = 4; // Update frame every X game loops (lower is faster)

// --- Asset Loading ---
const animations = {
    idle: { frames: [], frameCount: 18, path: 'game_assets/player/idle/0_Fallen_Angels_Idle_' },
    walking: { frames: [], frameCount: 24, path: 'game_assets/player/walking/0_Fallen_Angels_Walking_' }
    // Add other animations (attacking, jumping, etc.) here later
};
let assetsLoaded = 0;
let totalAssets = 0;

function loadImageSequence(animData) {
    for (let i = 0; i < animData.frameCount; i++) {
        totalAssets++;
        const img = new Image();
        // Format frame number (e.g., 000, 001, ... 017)
        const frameNum = String(i).padStart(3, '0');
        img.src = `${animData.path}${frameNum}.png`;
        img.onload = () => {
            assetsLoaded++;
            if (assetsLoaded === totalAssets) {
                console.log("All assets loaded!");
                startGame(); // Start the game only after loading
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            assetsLoaded++; // Still count as loaded to not block startup
             if (assetsLoaded === totalAssets) startGame();
        };
        animData.frames.push(img);
    }
}

function loadAssets() {
    console.log("Loading assets...");
    loadImageSequence(animations.idle);
    loadImageSequence(animations.walking);
    // Load other animation sequences here
}

// --- Player Object ---
const player = {
    x: 100,
    y: canvas.height - 150, // Start closer to ground
    // Guessing sprite dimensions - ADJUST IF NEEDED!
    width: 100, 
    height: 100, 
    dx: 0,
    dy: 0,
    onGround: false,
    // Animation state
    currentAnim: 'idle',
    frame: 0,
    frameTimer: 0,
    flipH: false // Facing direction (false=right, true=left)
};

// --- Ground Object ---
const ground = {
    x: 0,
    y: canvas.height - 50,
    width: canvas.width,
    height: 50
};

// --- Input State ---
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false // Add jump key later
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
let gameRunning = false;
function gameLoop() {
    if (!gameRunning) return;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// --- Update Function ---
function update() {
    // Apply gravity
    player.dy += GRAVITY;

    // Handle horizontal movement
    player.dx = 0;
    let isMoving = false;
    if (keys.ArrowLeft) {
        player.dx = -PLAYER_SPEED;
        player.flipH = true; // Face left
        isMoving = true;
    }
    if (keys.ArrowRight) {
        player.dx = PLAYER_SPEED;
        player.flipH = false; // Face right
        isMoving = true;
    }

    // Update position
    player.x += player.dx;
    player.y += player.dy;

    // Ground collision
    player.onGround = false;
    if (player.y + player.height > ground.y) {
        player.y = ground.y - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Update Animation State
    if (isMoving && player.onGround) {
        player.currentAnim = 'walking';
    } else if (!isMoving && player.onGround) {
        player.currentAnim = 'idle';
    } // Add jumping/falling animations later
    
    // Update Animation Frame
    player.frameTimer++;
    if (player.frameTimer >= ANIMATION_SPEED) {
        player.frameTimer = 0;
        const currentAnimationData = animations[player.currentAnim];
        player.frame = (player.frame + 1) % currentAnimationData.frameCount;
    }

    // Keep player within bounds (horizontal)
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// --- Render Function ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#228B22'; 
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

    // Draw player sprite
    const currentAnimationData = animations[player.currentAnim];
    const currentFrameImage = currentAnimationData.frames[player.frame];

    if (currentFrameImage) { // Make sure image is loaded
        ctx.save(); // Save context state
        
        let drawX = player.x;
        if (player.flipH) {
            // Flip the context horizontally
            ctx.scale(-1, 1);
            // Adjust draw X position for flipped context
            // Multiply by -1 because the coordinate system is now flipped
            drawX = -(player.x + player.width); 
        }
        
        // Draw the image
        ctx.drawImage(
            currentFrameImage, 
            drawX, // Use adjusted X if flipped
            player.y, 
            player.width, 
            player.height
        );
        
        ctx.restore(); // Restore context state (removes flip)
    } else {
        // Fallback: Draw red rectangle if image not loaded
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// --- Start Game ---
function startGame() {
    console.log("Starting game loop...");
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// Load assets first, then start the game
loadAssets(); 