import { Enemy } from '@/models/Enemy';
import { Player } from '@/models/Player';
import { Projectile } from '@/models/Projectile';
import { Pickup } from '@/models/Pickup';
import { Particle } from '@/models/Particle';

/**
 * Draw the background grid
 */
export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Draw grid pattern
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const gridSize = 60;

    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/**
 * Draw the player
 */
export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, keys: Record<string, boolean>): void {
    // Draw player body (potato)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#cd853f"; // Potato brown
    ctx.fill();
    ctx.closePath();

    // Add eyes
    const eyeOffset = player.size / 5;
    const eyeSize = player.size / 8;

    // Determine facing direction based on movement
    let facingX = 1;
    let facingY = 0;

    if (keys['w'] || keys['arrowup']) facingY -= 1;
    if (keys['s'] || keys['arrowdown']) facingY += 1;
    if (keys['a'] || keys['arrowleft']) facingX -= 1;
    if (keys['d'] || keys['arrowright']) facingX += 1;

    // Normalize
    if (facingX !== 0 || facingY !== 0) {
        const length = Math.sqrt(facingX * facingX + facingY * facingY);
        facingX /= length;
        facingY /= length;
    }

    // Draw eyes
    ctx.beginPath();
    ctx.arc(
        player.x + eyeOffset * facingX - eyeOffset * facingY,
        player.y + eyeOffset * facingY + eyeOffset * facingX,
        eyeSize, 0, Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(
        player.x + eyeOffset * facingX + eyeOffset * facingY,
        player.y + eyeOffset * facingY - eyeOffset * facingX,
        eyeSize, 0, Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw pupils (facing direction)
    const pupilSize = eyeSize * 0.6;

    ctx.beginPath();
    ctx.arc(
        player.x + eyeOffset * facingX - eyeOffset * facingY + facingX * pupilSize * 0.5,
        player.y + eyeOffset * facingY + eyeOffset * facingX + facingY * pupilSize * 0.5,
        pupilSize, 0, Math.PI * 2
    );
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(
        player.x + eyeOffset * facingX + eyeOffset * facingY + facingX * pupilSize * 0.5,
        player.y + eyeOffset * facingY - eyeOffset * facingX + facingY * pupilSize * 0.5,
        pupilSize, 0, Math.PI * 2
    );
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

/**
 * Draw an enemy
 */
export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    // Draw enemy body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.closePath();

    // Draw health bar
    const barWidth = enemy.size * 0.8;
    const barHeight = 4;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.size / 2 - 8;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const healthWidth = (enemy.health / enemy.maxHealth) * barWidth;
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(barX, barY, healthWidth, barHeight);

    // Draw enemy type indicator (eyes or shape)
    switch (enemy.name) {
        case 'Zombie':
            drawZombieFeatures(ctx, enemy);
            break;
        case 'Skeleton':
            drawSkeletonFeatures(ctx, enemy);
            break;
        case 'Bat':
            drawBatFeatures(ctx, enemy);
            break;
        case 'Ghost':
            drawGhostFeatures(ctx, enemy);
            break;
        case 'Boss':
            drawBossFeatures(ctx, enemy);
            break;
    }
}

/**
 * Draw zombie features
 */
function drawZombieFeatures(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const eyeSize = enemy.size * 0.15;
    const eyeOffset = enemy.size * 0.15;

    // Draw eyes
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(enemy.x - eyeOffset, enemy.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + eyeOffset, enemy.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

/**
 * Draw skeleton features
 */
function drawSkeletonFeatures(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const eyeSize = enemy.size * 0.1;
    const eyeOffset = enemy.size * 0.15;

    // Draw eyes
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(enemy.x - eyeOffset, enemy.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + eyeOffset, enemy.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Draw "ribs"
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const y = enemy.y + (i * 4) - 4;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.size / 4, y);
        ctx.lineTo(enemy.x + enemy.size / 4, y);
        ctx.stroke();
        ctx.closePath();
    }
}

/**
 * Draw bat features
 */
function drawBatFeatures(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const wingSize = enemy.size * 0.7;

    // Draw wings
    ctx.fillStyle = enemy.color;

    // Left wing
    ctx.beginPath();
    ctx.ellipse(
        enemy.x - enemy.size / 2,
        enemy.y,
        wingSize / 2,
        wingSize / 3,
        Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // Right wing
    ctx.beginPath();
    ctx.ellipse(
        enemy.x + enemy.size / 2,
        enemy.y,
        wingSize / 2,
        wingSize / 3,
        -Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.size / 6, enemy.y - enemy.size / 6, enemy.size / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + enemy.size / 6, enemy.y - enemy.size / 6, enemy.size / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

/**
 * Draw ghost features
 */
function drawGhostFeatures(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    // Draw wavy bottom
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI);
    ctx.fill();
    ctx.closePath();

    // Eyes
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.size / 6, enemy.y - enemy.size / 8, enemy.size / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + enemy.size / 6, enemy.y - enemy.size / 8, enemy.size / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

/**
 * Draw boss features
 */
function drawBossFeatures(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    // Crown
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.size / 3, enemy.y - enemy.size / 2);
    ctx.lineTo(enemy.x + enemy.size / 3, enemy.y - enemy.size / 2);
    ctx.lineTo(enemy.x + enemy.size / 4, enemy.y - enemy.size / 2 - 10);
    ctx.lineTo(enemy.x, enemy.y - enemy.size / 2 - 15);
    ctx.lineTo(enemy.x - enemy.size / 4, enemy.y - enemy.size / 2 - 10);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.size / 4, enemy.y - enemy.size / 6, enemy.size / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + enemy.size / 4, enemy.y - enemy.size / 6, enemy.size / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.size / 4, enemy.y - enemy.size / 6, enemy.size / 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(enemy.x + enemy.size / 4, enemy.y - enemy.size / 6, enemy.size / 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Mouth
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y + enemy.size / 6, enemy.size / 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.closePath();
}

/**
 * Draw projectiles
 */
export function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile): void {
    if (proj.type === 'aura') {
        // Draw aura
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fillStyle = proj.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.closePath();
    } else if (proj.type === 'whip') {
        // Draw whip attack
        if (proj.pattern === 'whip360') {
            // 360 degree whip
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.strokeStyle = proj.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.closePath();
        } else if (proj.direction !== undefined) {
            // Directional whip
            const arcStart = proj.direction - Math.PI / 4;
            const arcEnd = proj.direction + Math.PI / 4;

            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, arcStart, arcEnd);
            ctx.lineTo(proj.x, proj.y);
            ctx.fillStyle = proj.color;
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.closePath();
        }
    } else if (proj.type === 'chain') {
        // Draw chain lightning
        if (proj.chainTargets && proj.chainTargets.length > 0) {
            drawLightning(ctx, proj.x, proj.y, proj.chainTargets[0].x, proj.chainTargets[0].y, proj.color);

            for (let i = 0; i < proj.chainTargets.length - 1; i++) {
                const current = proj.chainTargets[i];
                const next = proj.chainTargets[i + 1];
                drawLightning(ctx, current.x, current.y, next.x, next.y, proj.color);
            }
        }
    } else {
        // Draw regular projectile
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fillStyle = proj.color;
        ctx.fill();
        ctx.closePath();
    }
}

/**
 * Draw lightning between two points
 */
function drawLightning(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
): void {
    const points = [];
    points.push({x: x1, y: y1});

    const segs = 5;
    const deltaX = (x2 - x1) / segs;
    const deltaY = (y2 - y1) / segs;

    for (let i = 1; i < segs; i++) {
        const x = x1 + deltaX * i;
        const y = y1 + deltaY * i;
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        points.push({x: x + offsetX, y: y + offsetY});
    }

    points.push({x: x2, y: y2});

    // Add glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
    ctx.closePath();

    // Draw main lightning
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
    ctx.closePath();
}

/**
 * Draw pickups
 */
export function drawPickup(ctx: CanvasRenderingContext2D, pickup: Pickup): void {
    if (pickup.type === 'experience') {
        // Draw experience orb
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
        ctx.fillStyle = '#9C27B0';
        ctx.fill();
        ctx.closePath();

        // Inner glow
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#E1BEE7';
        ctx.fill();
        ctx.closePath();
    } else if (pickup.type === 'gold') {
        // Draw gold coin
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FFC107';
        ctx.fill();
        ctx.closePath();

        // Inner detail
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD54F';
        ctx.fill();
        ctx.closePath();
    } else if (pickup.type === 'health') {
        // Draw health pickup
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
        ctx.fillStyle = '#F44336';
        ctx.fill();
        ctx.closePath();

        // Draw cross
        ctx.beginPath();
        ctx.rect(pickup.x - pickup.size * 0.2, pickup.y - pickup.size * 0.6, pickup.size * 0.4, pickup.size * 1.2);
        ctx.rect(pickup.x - pickup.size * 0.6, pickup.y - pickup.size * 0.2, pickup.size * 1.2, pickup.size * 0.4);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

/**
 * Draw particles
 */
export function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.lifetime * 2; // Fade out as lifetime decreases
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}