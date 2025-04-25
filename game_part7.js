            case 'heart':
                ctx.fillStyle = colors.heart;
                ctx.beginPath();
                ctx.arc(item.x - 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.arc(item.x + 4, item.y - 4, 6, Math.PI, 0, false);
                ctx.bezierCurveTo(item.x + 10, item.y, item.x + 10, item.y + 4, item.x, item.y + 12);
                ctx.bezierCurveTo(item.x - 10, item.y + 4, item.x - 10, item.y, item.x, item.y + 12);
                ctx.fill();
                break;
            case 'key':
                ctx.fillStyle = colors.key;
                ctx.beginPath();
                ctx.arc(item.x, item.y - 4, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(item.x - 2, item.y, 4, 12);
                ctx.fillRect(item.x, item.y + 8, 6, 4);
                break;
            case 'bow':
                ctx.fillStyle = colors.bow;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 10, 0.25 * Math.PI, 0.75 * Math.PI);
                ctx.stroke();
                ctx.fillRect(item.x - 1, item.y - 10, 2, 20);
                break;
            case 'bomb':
                ctx.fillStyle = colors.bomb;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.fillRect(item.x - 1, item.y - 10, 2, 4);
                break;
        }
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        switch (projectile.type) {
            case 'arrow':
                ctx.fillStyle = colors.projectile;
                ctx.save();
                ctx.translate(projectile.x, projectile.y);
                ctx.rotate(getRotationFromDirection(projectile.direction));
                ctx.fillRect(-10, -1, 20, 2);
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(5, -3);
                ctx.lineTo(5, 3);
                ctx.fill();
                ctx.restore();
                break;
            case 'enemy_projectile':
                ctx.fillStyle = '#FF9900';
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'bomb':
                ctx.fillStyle = colors.bomb;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, projectile.timeLeft > 30 ? 8 : 6 + Math.random() * 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'explosion':
                ctx.fillStyle = `rgba(255, ${100 + Math.floor(Math.random() * 155)}, 0, ${projectile.timeLeft / 30})`;
                ctx.beginPath();
                ctx.arc(projectile.x, projectile.y, 30 - projectile.timeLeft, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
}