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
    idle: { frames: [], frameCount: 18, path: 'game_assets/player/Idle/0_Fallen_Angels_Idle_' },
    walking: { frames: [], frameCount: 24, path: 'game_assets/player/Walking/0_Fallen_Angels_Walking_' },
    running: { frames: [], frameCount: 12, path: 'game_assets/player/Running/0_Fallen_Angels_Running_' },
    jumping: { frames: [], frameCount: 6, path: 'game_assets/player/Jump Start/0_Fallen_Angels_Jump Start_' },
    jumpLoop: { frames: [], frameCount: 6, path: 'game_assets/player/Jump Loop/0_Fallen_Angels_Jump Loop_' },
    falling: { frames: [], frameCount: 6, path: 'game_assets/player/Falling Down/0_Fallen_Angels_Falling Down_' },
    dying: { frames: [], frameCount: 15, path: 'game_assets/player/Dying/0_Fallen_Angels_Dying_' },
    hurt: { frames: [], frameCount: 12, path: 'game_assets/player/Hurt/0_Fallen_Angels_Hurt_' },
    sliding: { frames: [], frameCount: 6, path: 'game_assets/player/Sliding/0_Fallen_Angels_Sliding_' },
    throwing: { frames: [], frameCount: 12, path: 'game_assets/player/Throwing/0_Fallen_Angels_Throwing_' },
    throwingAir: { frames: [], frameCount: 12, path: 'game_assets/player/Throwing in The Air/0_Fallen_Angels_Throwing in The Air_' },
    slashing: { frames: [], frameCount: 12, path: 'game_assets/player/Slashing/0_Fallen_Angels_Slashing_' },
    slashingAir: { frames: [], frameCount: 12, path: 'game_assets/player/Slashing in The Air/0_Fallen_Angels_Slashing in The Air_' },
    runSlashing: { frames: [], frameCount: 12, path: 'game_assets/player/Run Slashing/0_Fallen_Angels_Run Slashing_' },
    runThrowing: { frames: [], frameCount: 12, path: 'game_assets/player/Run Throwing/0_Fallen_Angels_Run Throwing_' },
    kicking: { frames: [], frameCount: 12, path: 'game_assets/player/Kicking/0_Fallen_Angels_Kicking_' },
    idleBlinking: { frames: [], frameCount: 18, path: 'game_assets/player/Idle Blinking/0_Fallen_Angels_Idle Blinking_' }
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
    for (const key in animations) {
        loadImageSequence(animations[key]);
    }
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
    e: false, // Add E key for toggling edit mode
    Shift: false,
    shift: false
};

// --- Action Key Bindings ---
const actionKeys = {
    Z: { anim: 'jumping', label: 'Jump' },
    S: { anim: 'sliding', label: 'Slide' },
    T: { anim: 'throwing', label: 'Throw' },
    G: { anim: 'throwingAir', label: 'Air Throw' },
    A: { anim: 'slashing', label: 'Slash' },
    Q: { anim: 'slashingAir', label: 'Air Slash' },
    W: { anim: 'runSlashing', label: 'Run Slash' },
    E: { anim: 'runThrowing', label: 'Run Throw' },
    C: { anim: 'kicking', label: 'Kick' },
    H: { anim: 'hurt', label: 'Hurt' },
    K: { anim: 'dying', label: 'Die' }
};
let actionKeyActive = null; // Track which action is currently active

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (actionKeys[key]) {
        // Interrupt any current action with the new one
        player.currentAnim = actionKeys[key].anim;
        player.frame = 0;
        player.frameTimer = 0;
        actionKeyActive = key;
        e.preventDefault();
        return;
    }
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
    const key = e.key.toUpperCase();
    if (actionKeys[key] && actionKeyActive === key) {
        actionKeyActive = null;
    }
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
        // If an action key is active, play its animation and allow interruption
        if (actionKeyActive) {
            // Advance animation frame
            player.frameTimer++;
            const currentAnimationData = animations[player.currentAnim];
            if (player.frameTimer >= ANIMATION_SPEED) {
                player.frameTimer = 0;
                player.frame = (player.frame + 1) % currentAnimationData.frameCount;
            }
            // Do not update movement or switch to idle/walking/running while action is active
            return;
        }
        // Apply gravity
        player.dy += GRAVITY;

        // Handle horizontal movement
        player.dx = 0;
        let isMoving = false;
        let isRunning = false;
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
        if ((keys.ArrowLeft || keys.ArrowRight) && (keys.Shift || keys.shift)) {
            // Running if Shift is held
            player.dx *= 2;
            isRunning = true;
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
        if (isRunning && player.onGround) {
            player.currentAnim = 'running';
        } else if (isMoving && player.onGround) {
            player.currentAnim = 'walking';
        } else if (!player.onGround && player.dy < 0) {
            player.currentAnim = 'jumpLoop';
        } else if (!player.onGround && player.dy > 0) {
            player.currentAnim = 'falling';
        } else if (!isMoving && player.onGround) {
            player.currentAnim = 'idle';
        } 
        
        // Update Animation Frame
        player.frameTimer++;
        const currentAnimationData = animations[player.currentAnim];
        if (player.frameTimer >= ANIMATION_SPEED) {
            player.frameTimer = 0;
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
    // Draw the sprite if valid and loaded
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
        // Fallback rectangle drawing if initial frame not ready or invalid
        if (player.currentAnim === 'idle' && player.frame === 0) {
             // Don't draw red box if it's just the initial idle frame loading
        } else {
             ctx.fillStyle = '#FF0000';
             ctx.fillRect(player.x, drawPlayerY, player.width, player.height); 
        }
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
    // --- REMOVED Action Controls Overlay from canvas ---
}

// --- Start Game ---
function startGame() {
    console.log("Starting game loop...");
    populateControlsPanel(); // Populate the HTML controls panel
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// --- Populate Controls Panel (New Function) ---
function populateControlsPanel() {
    const controlsList = document.getElementById('controls-list');
    if (!controlsList) return;

    // Clear existing items
    controlsList.innerHTML = '';

    // Add basic movement info
    const moveLi = document.createElement('li');
    moveLi.textContent = `←/→: Move`;
    controlsList.appendChild(moveLi);
    const runLi = document.createElement('li');
    runLi.textContent = `Shift + ←/→: Run`;
    controlsList.appendChild(runLi);
    const jumpLi = document.createElement('li');
    jumpLi.textContent = `Z: Jump`;
    controlsList.appendChild(jumpLi);

    // Add separator
    const sepLi = document.createElement('li');
    sepLi.innerHTML = `<hr style="border-color: #666;">`;
    controlsList.appendChild(sepLi);

    // Add action keys
    for (const key in actionKeys) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${actionKeys[key].label}`;
        controlsList.appendChild(li);
    }
}

// Load assets first, then start the game
loadAssets(); 