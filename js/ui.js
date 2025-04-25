/**
 * UI class
 * Handles user interface elements like HUD and messages
 */
class UI {
    constructor() {
        // UI elements
        this.messageBox = document.getElementById('message-box');
        this.heartsElement = document.getElementById('hearts');
        this.rupeesElement = document.getElementById('rupees');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');
        this.victoryScreen = document.getElementById('victory');
        
        // Message queue
        this.messages = [];
        this.currentMessage = null;
        this.messageTimeout = null;
    }
    
    /**
     * Update UI state
     */
    update() {
        // Process message queue
        if (this.messages.length > 0 && !this.currentMessage) {
            this.showNextMessage();
        }
    }
    
    /**
     * Show a message on screen
     */
    showMessage(text, duration = 1500) {
        // Add to queue
        this.messages.push({
            text: text,
            duration: duration
        });
    }
    
    /**
     * Display the next message in the queue
     */
    showNextMessage() {
        if (this.messages.length === 0) return;
        
        // Get next message
        this.currentMessage = this.messages.shift();
        
        // Update message box
        this.messageBox.textContent = this.currentMessage.text;
        this.messageBox.style.display = 'block';
        
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Set timeout to hide message
        this.messageTimeout = setTimeout(() => {
            this.hideMessage();
        }, this.currentMessage.duration);
    }
    
    /**
     * Hide the current message
     */
    hideMessage() {
        this.messageBox.style.display = 'none';
        this.currentMessage = null;
        
        // Check if we have more messages to show
        if (this.messages.length > 0) {
            setTimeout(() => {
                this.showNextMessage();
            }, Config.UI_MESSAGE_QUEUE_DELAY); // Use Config 
        }
    }
    
    /**
     * Update player health display
     */
    updateHealth(health) {
        this.heartsElement.textContent = '♥'.repeat(health);
    }
    
    /**
     * Update rupee count display
     */
    updateRupees(rupees) {
        this.rupeesElement.textContent = rupees;
    }
    
    /**
     * Show the start screen
     */
    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.gameOverScreen.style.display = 'none';
        this.victoryScreen.style.display = 'none';
    }
    
    /**
     * Hide all screens
     */
    hideScreens() {
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.victoryScreen.style.display = 'none';
    }
    
    /**
     * Show game over screen
     */
    showGameOverScreen() {
        this.gameOverScreen.style.display = 'flex';
    }
    
    /**
     * Show victory screen
     */
    showVictoryScreen() {
        this.victoryScreen.style.display = 'flex';
    }
    
    /**
     * Clear all messages
     */
    clearMessages() {
        this.messages = [];
        
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        
        this.hideMessage();
    }
}
