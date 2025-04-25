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