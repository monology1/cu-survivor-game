import { Player } from '@/models/Player';
import { Enemy } from '@/models/Enemy';
import { Projectile } from '@/models/Projectile';
import { Pickup } from '@/models/Pickup';
import { distance } from './math';

/**
 * Check collision between player and enemy
 */
export function checkPlayerEnemyCollision(player: Player, enemy: Enemy): boolean {
    const dist = distance(player.x, player.y, enemy.x, enemy.y);
    return dist < (player.size / 2 + enemy.size / 2);
}

/**
 * Check collision between projectile and enemy
 */
export function checkProjectileEnemyCollision(projectile: Projectile, enemy: Enemy): boolean {
    const dist = distance(projectile.x, projectile.y, enemy.x, enemy.y);
    return dist <= (projectile.size + enemy.size / 2);
}

/**
 * Check if enemy is in range of aura
 */
export function isEnemyInAuraRange(aura: Projectile, enemy: Enemy): boolean {
    const dist = distance(aura.x, aura.y, enemy.x, enemy.y);
    return dist <= aura.size;
}

/**
 * Check if player is in range to collect pickup
 */
export function canPlayerCollectPickup(player: Player, pickup: Pickup): boolean {
    const dist = distance(player.x, player.y, pickup.x, pickup.y);
    return dist <= player.size / 2;
}

/**
 * Check if pickup is in magnetic range of player
 */
export function isPickupInMagneticRange(player: Player, pickup: Pickup): boolean {
    const dist = distance(player.x, player.y, pickup.x, pickup.y);
    return dist <= player.pickupRange;
}