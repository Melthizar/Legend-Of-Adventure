/**
 * Game class
 * Main game logic and state management
 */
class Game {
    constructor() {
        // Game state
        this.isPlaying = false;
        this.animationFrameId = null;
        
        // Game objects
        this.room = new Room();
        this.player = new Player(Config.PLAYER_START_X, Config.PLAYER_START_Y);
        this.projectiles = [];
        this.particles = [];
        
        // Game systems
        this.canvas = document.getElementById('game-canvas');
        this.input = new Input();
        this.renderer = new Renderer(this.canvas);
        this.collision = new Collision(this.room);
        this.ui = new UI();
        
        // Bind button events
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        document.getElementById('play-again-button').addEventListener('click', () => this.startGame());
        
        // Handle attack key press
        document.addEventListener('keydown', e => {
            if (Config.ATTACK_KEYS.includes(e.key) && 
                this.isPlaying && 
                !this.player.isAttacking && 
                this.player.attackCooldown <= 0) {
                this.handlePlayerAttack();
            }
        });
    }
    
    /**
     * Initialize game
     */
    init() {
        // Show start screen
        this.ui.showStartScreen();
        
        // Initial render
        this.renderer.render(this.room, this.player, this.projectiles, this.particles);
    }
    
    /**
     * Start a new game
     */
    startGame() {
        // Reset game state
        this.isPlaying = true;
        
        // Reset player
        this.player.reset(Config.PLAYER_START_X, Config.PLAYER_START_Y);
        
        // Reset room (enemies/items)
        this.room.reset();
        
        // Clear projectiles and particles
        this.projectiles = [];
        this.particles = [];
        
        // Reset input state
        this.input.reset();
        
        // Update UI
        this.ui.hideScreens();
        this.ui.updateHealth(this.player.health);
        this.ui.updateRupees(this.player.rupees);
        this.ui.clearMessages();
        
        // Show welcome message
        this.ui.showMessage(Config.WELCOME_MESSAGE, Config.WELCOME_MESSAGE_DURATION);
        
        // Start game loop if not already running
        if (!this.animationFrameId) {
            this.gameLoop();
        }
    }
    
    /**
     * Game loop
     */
    gameLoop() {
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state
     */
    update() {
        if (!this.isPlaying) return;
        
        // Update player
        this.player.update(this.input, this.collision);
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            projectile.update();
            
            // Remove inactive projectiles
            if (!projectile.active) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.update();
            
            // Remove inactive particles
            if (!particle.active) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update room (enemies, items)
        this.room.update(this.player, this.collision, this.projectiles, this.particles);
        
        // Check collisions
        this.collision.checkSwordEnemyCollisions(this.player, this.particles, this.room.items);
        this.collision.checkProjectileCollisions(this.projectiles, this.player, this.particles, this.room.items);
        
        // Update UI
        this.ui.update();
        this.ui.updateHealth(this.player.health);
        this.ui.updateRupees(this.player.rupees);
        
        // Check game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        // Check victory
        if (this.room.areAllEnemiesDefeated()) {
            this.victory();
        }
    }
    
    /**
     * Render game
     */
    render() {
        this.renderer.render(this.room, this.player, this.projectiles, this.particles);
    }
    
    /**
     * Handle player attack
     */
    handlePlayerAttack() {
        if (this.player.attack()) {
            // Create particle effect using Config values
            for (let i = 0; i < Config.ATTACK_PARTICLE_COUNT; i++) {
                this.particles.push(new Particle(
                    this.player.x,
                    this.player.y,
                    Utils.randomFloat(Config.ATTACK_PARTICLE_MIN_SPEED, Config.ATTACK_PARTICLE_MAX_SPEED),
                    Utils.randomFloat(Config.ATTACK_PARTICLE_MIN_SPEED, Config.ATTACK_PARTICLE_MAX_SPEED),
                    Utils.randomFloat(Config.ATTACK_PARTICLE_MIN_SIZE, Config.ATTACK_PARTICLE_MAX_SIZE),
                    Config.ATTACK_PARTICLE_COLOR,
                    Utils.randomInt(Config.ATTACK_PARTICLE_MIN_LIFETIME, Config.ATTACK_PARTICLE_MAX_LIFETIME)
                ));
            }
        }
    }
    
    /**
     * Game over
     */
    gameOver() {
        this.isPlaying = false;
        this.ui.showGameOverScreen();
    }
    
    /**
     * Victory
     */
    victory() {
        if (!this.isPlaying) return; // Prevent multiple victories
        
        this.isPlaying = false;
        this.ui.showMessage(Config.VICTORY_MESSAGE, Config.VICTORY_MESSAGE_DURATION);
        
        // Show victory screen after delay using Config value
        setTimeout(() => {
            this.ui.showVictoryScreen();
        }, Config.VICTORY_SCREEN_DELAY);
    }
}
