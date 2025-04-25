// Basic game setup - will be expanded

console.log("Game script loaded.");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const GRAVITY = 0.5;
const PLAYER_SPEED = 3; // Adjusted speed slightly for sprites
const ANIMATION_SPEED = 4; // Update frame every X game loops (lower is faster)
let PLAYER_FEET_OFFSET_Y = 25; // Approx. pixels from bottom of sprite box to feet. ADJUST THIS VALUE! (Increased from 15)

// Edit Mode Variables
let isEditMode = false;
let editOffsetY = PLAYER_FEET_OFFSET_Y; // Start edit offset matching the current config

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
    // Keep initial Y calculation using the *original* constant
    y: canvas.height - 150 - PLAYER_FEET_OFFSET_Y, 
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
    ArrowUp: false,
    ArrowDown: false, // Add Down Arrow for edit mode
    e: false // Add E key for toggling edit mode
};

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') { // Toggle Edit Mode
        isEditMode = !isEditMode;
        if (isEditMode) {
            editOffsetY = PLAYER_FEET_OFFSET_Y; // Reset edit offset when entering mode
            console.log(`Entered Edit Mode. Adjust OffsetY with Up/Down Arrows. Current: ${editOffsetY}`);
        } else {
            console.log("Exited Edit Mode.");
            // Optional: Update the constant in the code if you want?
            // For now, user manually copies value from console.
            // PLAYER_FEET_OFFSET_Y = editOffsetY;
        }
        keys['e'] = true; // Track key state if needed
        e.preventDefault(); // Prevent default browser action for 'e'
    } else if (isEditMode) { // Handle edit mode input
        if (e.key === 'ArrowUp') {
            editOffsetY++;
            console.log(`Edit OffsetY: ${editOffsetY}`);
            keys['ArrowUp'] = true;
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            editOffsetY--;
            console.log(`Edit OffsetY: ${editOffsetY}`);
            keys['ArrowDown'] = true;
            e.preventDefault();
        }
    } else if (keys.hasOwnProperty(e.key)) { // Handle regular game input
        keys[e.key] = true;
        // Optional: Prevent default for arrow keys during gameplay if needed
        // if (e.key.startsWith('Arrow')) e.preventDefault(); 
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
    // Only run game logic if not in edit mode
    if (!isEditMode) { 
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

        // Ground collision - Uses the *original* PLAYER_FEET_OFFSET_Y
        player.onGround = false;
        if (player.y + player.height - PLAYER_FEET_OFFSET_Y > ground.y) { 
            player.y = ground.y - (player.height - PLAYER_FEET_OFFSET_Y);
            player.dy = 0;
            player.onGround = true;
        }

        // Update Animation State
        if (isMoving && player.onGround) {
            player.currentAnim = 'walking';
        } else if (!isMoving && player.onGround) {
            player.currentAnim = 'idle';
        } 
        
        // Update Animation Frame
        player.frameTimer++;
        if (player.frameTimer >= ANIMATION_SPEED) {
            player.frameTimer = 0;
            const currentAnimationData = animations[player.currentAnim];
            // Ensure frame index is valid after potential anim switch
            if (player.frame >= currentAnimationData.frameCount) {
                player.frame = 0; 
            }
            player.frame = (player.frame + 1) % currentAnimationData.frameCount;
        }

        // Keep player within bounds (horizontal)
        if (player.x < 0) {
            player.x = 0;
        }
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
    } // End of if(!isEditMode)
}

// --- Render Function ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#228B22'; 
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

    // --- Player Drawing --- 
    const currentAnimationData = animations[player.currentAnim];
    let currentFrameImage = null;
    
    // Determine the Y position for drawing based on mode
    // In edit mode, we adjust the visual position based on editOffsetY
    // The actual collision box remains determined by PLAYER_FEET_OFFSET_Y
    const visualFeetY = player.y + player.height - (isEditMode ? editOffsetY : PLAYER_FEET_OFFSET_Y);
    const drawPlayerY = visualFeetY - player.height;

    // Get the current frame image
    if (currentAnimationData && currentAnimationData.frames && currentAnimationData.frames.length > player.frame) {
        currentFrameImage = currentAnimationData.frames[player.frame];
    }

    // Draw the sprite if valid
    if (currentFrameImage && currentFrameImage.complete && currentFrameImage.naturalHeight !== 0) { 
        ctx.save();
        let drawX = player.x;
        if (player.flipH) {
            ctx.scale(-1, 1);
            drawX = -(player.x + player.width);
        }
        ctx.drawImage(currentFrameImage, drawX, drawPlayerY, player.width, player.height);
        ctx.restore();
    } else {
        // Fallback rectangle drawing if needed
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(player.x, drawPlayerY, player.width, player.height);
    }

    // --- Edit Mode Overlay --- 
    if (isEditMode) {
        // Draw player collision box (using actual player x/y)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
        ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);

        // Draw Edit Mode text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`EDIT MODE (Press E to Exit)`, 10, 20);
        ctx.fillText(`Feet Offset Y: ${editOffsetY} (Use Up/Down Arrows)`, 10, 40);
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