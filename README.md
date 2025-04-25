# Legend of Adventure

A simple 2D top-down adventure game created with HTML5 Canvas and JavaScript.

## How to Play

*   **Goal:** Defeat all the enemies in the room!
*   **Movement:** Use the **Arrow Keys** or **WASD** keys to move your character.
*   **Attack:** Press the **Spacebar**, **Z**, or **J** key to swing your sword.
*   **Collectibles:** Pick up hearts dropped by enemies to restore health and rupees for points.

## How to Run

Simply open the `legend.html` file in a modern web browser that supports HTML5 Canvas and JavaScript.

## Code Structure

The main code is organized within the `js/` directory:

*   `index.html`: The main HTML file that sets up the canvas and loads the scripts.
*   `styles.css`: Basic styling for the HTML elements.
*   `js/main.js`: The entry point for the JavaScript code. It initializes the `Game` object when the page loads.
*   `js/game.js`: Contains the main `Game` class, orchestrating the game loop, state management, and interactions between different systems.
*   `js/config.js`: Holds various constants and configuration values for the game (speeds, sizes, colors, timings, etc.).
*   `js/utils.js`: Contains general utility functions (random numbers, distance, etc.).
*   `js/room.js`: Defines the layout of the game area (walls, trees) and manages the enemies and items within it.
*   `js/renderer.js`: Handles all drawing operations onto the canvas.
*   `js/collision.js`: Manages collision detection between different game objects (player, enemies, projectiles, walls).
*   `js/input.js`: Handles keyboard input for player controls.
*   `js/ui.js`: Manages the Heads-Up Display (HUD), on-screen messages, and game state screens (start, game over, victory).
*   `js/entities/`: This subdirectory contains the classes for all game objects:
    *   `entity.js`: The base class for all entities.
    *   `player.js`: Defines the player character.
    *   `enemy.js`: Defines the enemy characters (Octorok, Boss).
    *   `item.js`: Defines collectible items (Rupee, Heart).
    *   `projectile.js`: Defines projectiles fired by the player or enemies.
    *   `particle.js`: Defines visual effect particles. 