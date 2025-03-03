import { Player } from '@/models/Player';
import { Enemy } from '@/models/Enemy';
import { Projectile } from '@/models/Projectile';
import { Pickup } from '@/models/Pickup';
import { distance } from '@/utils/math';

export class MovementSystem {
    /**
     * Update player position based on keyboard input
     */
    static updatePlayerPosition(
        player: Player,
        keys: Record<string, boolean>,
        deltaTime: number,
        canvasWidth: number,
        canvasHeight: number
    ): Player {
        // Handle movement
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Apply movement
        const updatedPlayer = { ...player };
        updatedPlayer.x += dx * player.speed * deltaTime * 60; // Scale by delta time and frame rate
        updatedPlayer.y += dy * player.speed * deltaTime * 60;

        // Keep player in bounds
        const margin = 20; // Keep player slightly inside the canvas
        updatedPlayer.x = Math.max(margin, Math.min(canvasWidth - margin, updatedPlayer.x));
        updatedPlayer.y = Math.max(margin, Math.min(canvasHeight - margin, updatedPlayer.y));

        return updatedPlayer;
    }

    /**
     * Update enemy positions, moving them towards the player with debug logging
     */
    static updateEnemyPositions(
        enemies: Enemy[],
        player: Player,
        deltaTime: number
    ): Enemy[] {
        if (enemies.length === 0) {
            console.log('No enemies to update positions for');
            return [];
        }

        console.log(`Updating positions for ${enemies.length} enemies, deltaTime: ${deltaTime}`);
        console.log('Player position:', { x: player.x, y: player.y });

        // Debug first enemy
        if (enemies.length > 0) {
            const firstEnemy = enemies[0];
            console.log('First enemy before update:', {
                x: firstEnemy.x,
                y: firstEnemy.y,
                speed: firstEnemy.speed
            });

            // Calculate movement that should happen
            const dx = player.x - firstEnemy.x;
            const dy = player.y - firstEnemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const moveX = (dx / dist) * firstEnemy.speed * deltaTime * 60;
                const moveY = (dy / dist) * firstEnemy.speed * deltaTime * 60;

                console.log('First enemy should move:', {
                    dx: moveX,
                    dy: moveY,
                    calculations: {
                        dx,
                        dy,
                        dist,
                        speed: firstEnemy.speed,
                        deltaTime,
                        speedFactor: firstEnemy.speed * deltaTime * 60
                    }
                });
            }
        }

        // Update all enemies with MUCH higher movement speed for testing
        return enemies.map(enemy => {
            const updatedEnemy = { ...enemy };

            // CRITICAL FIX: Increase speed by 5x for testing to make movement more visible
            const speedMultiplier = 5;

            // Move enemy towards player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) { // Prevent jittering when close
                // Force larger movement for debugging
                updatedEnemy.x += (dx / dist) * enemy.speed * speedMultiplier * deltaTime * 60;
                updatedEnemy.y += (dy / dist) * enemy.speed * speedMultiplier * deltaTime * 60;
            }

            return updatedEnemy;
        });
    }

    /**
     * Update projectile positions
     */
    static updateProjectilePositions(
        projectiles: Projectile[],
        player: Player,
        deltaTime: number
    ): Projectile[] {
        return projectiles.map(proj => {
            const updatedProj = { ...proj };

            // Move projectile
            if (updatedProj.dirX !== undefined && updatedProj.dirY !== undefined && updatedProj.speed !== undefined) {
                updatedProj.x += updatedProj.dirX * updatedProj.speed * deltaTime * 60;
                updatedProj.y += updatedProj.dirY * updatedProj.speed * deltaTime * 60;
            }

            // Process aura-type projectiles
            if (updatedProj.type === 'aura') {
                // Auras are centered on the player
                updatedProj.x = player.x;
                updatedProj.y = player.y;
            }

            // Update lifetime
            if (updatedProj.lifetime !== undefined) {
                updatedProj.lifetime -= deltaTime;
            }

            return updatedProj;
        });
    }

    /**
     * Update pickup positions, moving them towards the player if in range
     */
    static updatePickupPositions(
        pickups: Pickup[],
        player: Player,
        deltaTime: number
    ): Pickup[] {
        return pickups.map(pickup => {
            const updatedPickup = { ...pickup };

            // Check proximity to player for magnetic effect
            const dx = player.x - pickup.x;
            const dy = player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Move pickup towards player if in range
            if (dist <= player.pickupRange) {
                const speed = 100 * (1 - dist / player.pickupRange) + 50;
                updatedPickup.x += (dx / dist) * speed * deltaTime;
                updatedPickup.y += (dy / dist) * speed * deltaTime;
            }

            return updatedPickup;
        });
    }

    /**
     * Check if a projectile is out of bounds
     */
    static isProjectileOutOfBounds(
        proj: Projectile,
        canvasWidth: number,
        canvasHeight: number
    ): boolean {
        // Auras, whips, and chains are never out of bounds
        if (proj.type === 'aura' || proj.type === 'whip' || proj.type === 'chain') {
            return false;
        }

        const margin = 50;
        return (
            proj.x < -margin ||
            proj.x > canvasWidth + margin ||
            proj.y < -margin ||
            proj.y > canvasHeight + margin
        );
    }
}