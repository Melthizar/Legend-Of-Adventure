function checkItemCollisions() {
    const room = rooms[gameState.currentRoom];
    
    for (let i = room.items.length - 1; i >= 0; i--) {
        const item = room.items[i];
        
        // Check collision with player
        if (
            player.x + player.width/2 > item.x - 10 &&
            player.x - player.width/2 < item.x + 10 &&
            player.y + player.height/2 > item.y - 10 &&
            player.y - player.height/2 < item.y + 10
        ) {
            // Collect item
            switch (item.type) {
                case 'rupee':
                    gameState.rupees += item.value;
                    showMessage(`Got ${item.value} rupees!`);
                    updateRupeesUI();
                    break;
                case 'heart':
                    if (gameState.playerHealth < 3) {
                        gameState.playerHealth += item.value;
                        showMessage("Health restored!");
                        updateHealthUI();
                    }
                    break;
                case 'key':
                    gameState.hasKey = true;
                    showMessage("You got a key!");
                    break;
                case 'bow':
                    gameState.hasBow = true;
                    showMessage("You got a bow!");
                    updateInventoryUI();
                    break;
                case 'bomb':
                    gameState.hasBomb = true;
                    showMessage("You got bombs!");
                    updateInventoryUI();
                    break;
            }
            
            // Create particles
            createParticles(item.x, item.y, 10, item.type === 'rupee' ? '#00FF00' : item.type === 'heart' ? '#FF3333' : '#FFFFFF');
            
            // Remove item
            room.items.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        // Update life
        particle.life--;
        
        // Remove if dead
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: color,
            life: Math.floor(Math.random() * 20 + 10),
            maxLife: 30
        });
    }
}

function updateMessages() {
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        
        // Update life
        message.life--;
        
        // Remove if dead
        if (message.life <= 0) {
            messages.splice(i, 1);
            hideMessageBox();
        }
    }
}

function showMessage(text) {
    // Add message
    messages.push({
        text: text,
        life: 90  // Show for 1.5 seconds
    });
    
    // Update message box
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = text;
    messageBox.style.display = 'block';
}

function hideMessageBox() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'none';
}