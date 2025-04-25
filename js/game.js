// Basic game setup - will be expanded

console.log("Game script loaded.");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const GRAVITY = 0.5;
const PLAYER_SPEED = 3; // Adjusted speed slightly for sprites
const JUMP_STRENGTH = 10; // How high the player jumps (negative dy)
const AIR_CONTROL_FACTOR = 0.8; // How much control player has in air (0-1)
const ANIMATION_SPEED = 4; // Update frame every X game loops (lower is faster)
let PLAYER_FEET_OFFSET_Y = 25; // Approx. pixels from bottom of sprite box to feet. ADJUST THIS VALUE! (Increased from 15)

// Edit Mode Variables
let isEditMode = false;
let editOffsetY = PLAYER_FEET_OFFSET_Y; // Start edit offset matching the current config

// --- Asset Loading ---
const animations = {
    idle: { frames: [], frameCount: 18, path: 'game_assets/player/idle/0_Fallen_Angels_Idle_' },
    walking: { frames: [], frameCount: 24, path: 'game_assets/player/walking/0_Fallen_Angels_Walking_' },
    running: { frames: [], frameCount: 12, path: 'game_assets/player/running/0_Fallen_Angels_Running_' },
    jumping: { frames: [], frameCount: 6, path: 'game_assets/player/jump_start/0_Fallen_Angels_Jump Start_' },
    jumpLoop: { frames: [], frameCount: 6, path: 'game_assets/player/jump_loop/0_Fallen_Angels_Jump Loop_' },
    falling: { frames: [], frameCount: 6, path: 'game_assets/player/falling_down/0_Fallen_Angels_Falling Down_' },
    dying: { frames: [], frameCount: 15, path: 'game_assets/player/dying/0_Fallen_Angels_Dying_' },
    hurt: { frames: [], frameCount: 12, path: 'game_assets/player/hurt/0_Fallen_Angels_Hurt_' },
    sliding: { frames: [], frameCount: 6, path: 'game_assets/player/sliding/0_Fallen_Angels_Sliding_' },
    throwing: { frames: [], frameCount: 12, path: 'game_assets/player/throwing/0_Fallen_Angels_Throwing_' },
    throwingAir: { frames: [], frameCount: 12, path: 'game_assets/player/throwing_in_the_air/0_Fallen_Angels_Throwing in The Air_' },
    slashing: { frames: [], frameCount: 12, path: 'game_assets/player/slashing/0_Fallen_Angels_Slashing_' },
    slashingAir: { frames: [], frameCount: 12, path: 'game_assets/player/slashing_in_the_air/0_Fallen_Angels_Slashing in The Air_' },
    runSlashing: { frames: [], frameCount: 12, path: 'game_assets/player/run_slashing/0_Fallen_Angels_Run Slashing_' },
    runThrowing: { frames: [], frameCount: 12, path: 'game_assets/player/run_throwing/0_Fallen_Angels_Run Throwing_' },
    kicking: { frames: [], frameCount: 12, path: 'game_assets/player/kicking/0_Fallen_Angels_Kicking_' },
    idleBlinking: { frames: [], frameCount: 18, path: 'game_assets/player/idle_blinking/0_Fallen_Angels_Idle Blinking_' }
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
    isJumping: false, // Track if jump action is initiated
    isAttacking: false, // Track if any attack/action is active
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
    // Z is handled separately for jump physics
    S: { anim: 'sliding', label: 'Slide', groundOnly: true },
    T: { anim: 'throwing', label: 'Throw', groundOnly: true },
    G: { anim: 'throwingAir', label: 'Air Throw', groundOnly: false },
    A: { anim: 'slashing', label: 'Slash', groundOnly: true },
    Q: { anim: 'slashingAir', label: 'Air Slash', groundOnly: false },
    W: { anim: 'runSlashing', label: 'Run Slash', groundOnly: true }, // Assumes running implies ground
    E: { anim: 'runThrowing', label: 'Run Throw', groundOnly: true }, // Assumes running implies ground
    C: { anim: 'kicking', label: 'Kick', groundOnly: true },
    H: { anim: 'hurt', label: 'Hurt', groundOnly: false }, // Can be hurt anytime
    K: { anim: 'dying', label: 'Die', groundOnly: false } // Can die anytime
};
let currentAction = null; // Track the animation key of the current action
let actionFrameCount = 0; // How many frames the current action has played

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    // Handle Jump Separately
    if (key === 'Z' && player.onGround && !player.isJumping && !player.isAttacking) {
        player.dy = -JUMP_STRENGTH;
        player.onGround = false;
        player.isJumping = true; // Mark that jump has started
        player.currentAnim = 'jumping'; // Start jump animation
        player.frame = 0;
        player.frameTimer = 0;
        currentAction = null; // Ensure jump interrupts other potential states if needed
        e.preventDefault();
        return;
    }

    // Handle Other Actions
    if (actionKeys[key] && !player.isAttacking) {
        const action = actionKeys[key];
        // Check if action is allowed (ground vs air)
        if ((action.groundOnly && player.onGround) || !action.groundOnly) {
            player.currentAnim = action.anim;
            player.frame = 0;
            player.frameTimer = 0;
            player.isAttacking = true; // Mark action as started
            currentAction = action.anim; // Store the animation name
            actionFrameCount = 0;
            e.preventDefault();
            return; // Action takes priority for this frame
        }
    }

    if (e.key === 'e' || e.key === 'E') { // Toggle Edit Mode
        isEditMode = !isEditMode;
        if (isEditMode) {
            editOffsetY = PLAYER_FEET_OFFSET_Y; // Reset edit offset when entering mode
            console.log(`Entered Edit Mode. Adjust OffsetY with Up/Down Arrows. Current: ${editOffsetY}`);
        } else {
            console.log("Exited Edit Mode.");
        }
        keys['e'] = true;
        e.preventDefault();
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
    }
});

document.addEventListener('keyup', (e) => {
    // No change needed for action key up yet, actions play out fully
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
    if (isEditMode) return; // No updates in edit mode

    // 1. Apply Gravity
    player.dy += GRAVITY;

    // 2. Handle Horizontal Movement Input
    let targetDx = 0;
    let isMoving = false;
    let isRunning = false;
    if (keys.ArrowLeft) {
        targetDx = -PLAYER_SPEED;
        player.flipH = true;
        isMoving = true;
    }
    if (keys.ArrowRight) {
        targetDx = PLAYER_SPEED;
        player.flipH = false;
        isMoving = true;
    }
    if (isMoving && (keys.Shift || keys.shift)) {
        targetDx *= 2;
        isRunning = true;
    }

    // Apply air control factor
    player.dx = player.onGround ? targetDx : targetDx * AIR_CONTROL_FACTOR;

    // 3. Update Position
    player.x += player.dx;
    player.y += player.dy;

    // 4. Ground Collision Check & Resolution
    let landedThisFrame = false;
    const playerFeetY = player.y + player.height - PLAYER_FEET_OFFSET_Y;

    // Check if player feet are at or below ground level
    if (playerFeetY >= ground.y) {
        // Check if the player was previously above ground or is currently moving downwards
        if (!player.onGround || player.dy > 0) {
            // Collision occurred this frame (landing or moving down into ground)
            player.y = ground.y - (player.height - PLAYER_FEET_OFFSET_Y); // Snap to ground
            player.dy = 0; // Stop vertical movement
            if (!player.onGround) landedThisFrame = true; // Mark landing if previously airborne
            player.onGround = true;
            player.isJumping = false;
        } else {
             // Player was already on ground and remains on ground, ensure onGround is true
             player.onGround = true; 
        }
    } else {
        // Player is definitely above ground
        player.onGround = false;
    }

    // 5. Update Action State & Animation Frame
    let nextAnim = player.currentAnim;
    if (player.isAttacking) {
        actionFrameCount++;
        const currentAnimationData = animations[currentAction]; // Use stored action anim
        // Advance frame
        player.frameTimer++;
        if (player.frameTimer >= ANIMATION_SPEED) {
            player.frameTimer = 0;
            player.frame++;
        }
        // Check if animation finished
        if (player.frame >= currentAnimationData.frameCount) {
            player.isAttacking = false;
            currentAction = null;
            player.frame = 0; // Reset frame for next anim
            // Don't set nextAnim here, let physics logic below handle it
        } else {
             nextAnim = currentAction; // Continue playing action
        }
    }

    // 6. Determine Base Animation State (if not attacking)
    if (!player.isAttacking) {
        if (player.onGround) {
            if (landedThisFrame) {
                 // Decide between idle/walking/running upon landing
                 if (isRunning) nextAnim = 'running';
                 else if (isMoving) nextAnim = 'walking';
                 else nextAnim = 'idle';
            } else if (isRunning) {
                nextAnim = 'running';
            } else if (isMoving) {
                nextAnim = 'walking';
            } else {
                // Check if previous was idleBlinking, continue if so, otherwise idle
                if (player.currentAnim === 'idleBlinking') {
                    // Let idleBlinking finish its cycle if it started
                    const animData = animations.idleBlinking;
                     player.frameTimer++;
                     if(player.frameTimer >= ANIMATION_SPEED) {
                         player.frameTimer = 0;
                         player.frame = (player.frame + 1) % animData.frameCount;
                         if (player.frame === 0) { // Finished cycle
                              nextAnim = 'idle'; // Switch back to normal idle
                         } else {
                              nextAnim = 'idleBlinking'; // Continue blinking
                         }
                     } else {
                          nextAnim = 'idleBlinking'; // Continue blinking
                     }
                } else {
                     nextAnim = 'idle';
                     // Add chance to start blinking?
                     if (Math.random() < 0.005) { // Small chance each frame
                          nextAnim = 'idleBlinking';
                          player.frame = 0;
                          player.frameTimer = 0;
                     }
                }
            }
        } else { // In Air
            if (player.currentAnim === 'jumping' && player.dy >= 0) {
                // Finished initial jump anim, now falling
                nextAnim = 'falling';
            } else if (player.dy < 0 && player.currentAnim !== 'jumping') {
                // Still rising after jump or air action
                nextAnim = 'jumpLoop';
            } else if (player.dy > 0) {
                // Is falling
                nextAnim = 'falling';
            }
             // Keep jumpLoop or falling if no other condition met in air
             // Note: Air attacks handled by isAttacking logic
        }

        // 7. Update Animation Frame (if not attacking or handled by idleBlinking)
        if (nextAnim !== 'idleBlinking') {
            if (player.currentAnim !== nextAnim) {
                // Animation changed, reset frame
                player.currentAnim = nextAnim;
                player.frame = 0;
                player.frameTimer = 0;
            } else {
                // Continue current animation
                player.frameTimer++;
                if (player.frameTimer >= ANIMATION_SPEED) {
                    player.frameTimer = 0;
                    const animData = animations[player.currentAnim];
                    player.frame = (player.frame + 1) % animData.frameCount;
                }
            }
        }
    }

    // 8. Keep player within bounds (horizontal)
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