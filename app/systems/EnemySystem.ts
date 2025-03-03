import { Enemy, EnemyType } from '@/models/Enemy';
import { enemyTypes } from '@/data/enemies';
import {Player} from "@/models/Player";
import {distance} from "@/utils/math";

export class EnemySystem {
    /**
     * Spawn a new enemy outside the visible area
     */
    static spawnEnemy(
        canvasWidth: number,
        canvasHeight: number,
        waveNumber: number
    ): Enemy {
        // Determine spawn position (outside the visible area)
        let x: number, y: number;
        const buffer = 100; // Distance outside canvas
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

        switch (side) {
            case 0: // Top
                x = Math.random() * canvasWidth;
                y = -buffer;
                break;
            case 1: // Right
                x = canvasWidth + buffer;
                y = Math.random() * canvasHeight;
                break;
            case 2: // Bottom
                x = Math.random() * canvasWidth;
                y = canvasHeight + buffer;
                break;
            default: // Left
                x = -buffer;
                y = Math.random() * canvasHeight;
                break;
        }

        // Determine enemy type based on wave
        let possibleTypes: number[] = [0, 1]; // Basic enemies

        if (waveNumber >= 2) possibleTypes.push(2); // Add more types as waves progress
        if (waveNumber >= 3) possibleTypes.push(3);

        // Boss every 5 waves
        if (waveNumber % 5 === 0 && Math.random() < 0.05) {
            possibleTypes = [4]; // Boss
        }

        const typeIndex = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
        const enemyType = enemyTypes[typeIndex];

        // Scale enemy stats based on wave
        const waveScaling = 1 + (waveNumber - 1) * 0.1;

        return {
            x,
            y,
            health: enemyType.health * waveScaling,
            maxHealth: enemyType.health * waveScaling,
            speed: enemyType.speed,
            damage: enemyType.damage * waveScaling,
            size: enemyType.size,
            color: enemyType.color,
            experienceValue: enemyType.experienceValue,
            goldValue: enemyType.goldValue,
            name: enemyType.name
        };
    }

    /**
     * Check and handle collisions between player and enemies
     */
    static handlePlayerEnemyCollisions(
        player: Player,
        enemies: Enemy[],
        deltaTime: number
    ): { player: Player; enemies: Enemy[] } {
        let updatedPlayer = { ...player };
        const updatedEnemies = [...enemies];

        for (let i = 0; i < updatedEnemies.length; i++) {
            const enemy = updatedEnemies[i];
            const dist = distance(player.x, player.y, enemy.x, enemy.y);

            // Check collision with player
            if (dist < (player.size / 2 + enemy.size / 2)) {
                // Deal damage to player
                updatedPlayer.health -= enemy.damage * deltaTime;

                // Apply knockback to enemy
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const knockbackDist = Math.sqrt(dx * dx + dy * dy);

                updatedEnemies[i] = {
                    ...enemy,
                    x: enemy.x - (dx / knockbackDist) * 10,
                    y: enemy.y - (dy / knockbackDist) * 10
                };
            }
        }

        return { player: updatedPlayer, enemies: updatedEnemies };
    }
}