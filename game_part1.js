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