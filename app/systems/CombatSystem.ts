import { Weapon, WeaponUpgrade } from '@/models/Weapon';
import { Enemy } from '@/models/Enemy';
import { Projectile } from '@/models/Projectile';
import { Player } from '@/models/Player';
import { distance } from '@/utils/math';

export class CombatSystem {
    /**
     * Fire a weapon based on its attack pattern
     */
    static fireWeapon(
        weapon: Weapon,
        player: Player,
        enemies: Enemy[]
    ): Projectile | Projectile[] | null {
        // Handle different weapon attack patterns
        switch (weapon.attackPattern) {
            case 'directional':
                return this.fireDirectionalWeapon(weapon, player, enemies);
            case 'aura':
                return this.fireAuraWeapon(weapon, player);
            case 'whip':
                return this.fireWhipWeapon(weapon, player, enemies);
            case 'chain':
                return this.fireChainWeapon(weapon, player, enemies);
            case 'triple':
                return this.fireTripleWeapon(weapon, player, enemies);
            case 'whip360':
                return this.fireWhip360Weapon(weapon, player);
            default:
                return this.fireDirectionalWeapon(weapon, player, enemies);
        }
    }

    /**
     * Find the closest enemy to a position
     */
    static findClosestEnemy(x: number, y: number, enemies: Enemy[]): Enemy | null {
        if (enemies.length === 0) return null;

        let closest: Enemy | null = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
            const dist = distance(x, y, enemy.x, enemy.y);
            if (dist < closestDist) {
                closestDist = dist;
                closest = enemy;
            }
        }

        return closest;
    }

    /**
     * Fire a directional weapon towards the closest enemy
     */
    private static fireDirectionalWeapon(
        weapon: Weapon,
        player: Player,
        enemies: Enemy[]
    ): Projectile | null {
        // Find closest enemy
        const target = this.findClosestEnemy(player.x, player.y, enemies);

        if (target) {
            // Calculate direction to enemy
            const dx = target.x - player.x;
            const dy = target.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Create projectile
            return {
                x: player.x,
                y: player.y,
                dirX: dx / dist,
                dirY: dy / dist,
                speed: weapon.projectileSpeed,
                size: weapon.projectileSize,
                damage: weapon.damage * player.damage,
                color: weapon.projectileColor,
                piercing: weapon.piercing,
                area: weapon.area,
                type: 'projectile'
            };
        }

        return null;
    }

    /**
     * Fire an aura weapon around the player
     */
    private static fireAuraWeapon(weapon: Weapon, player: Player): Projectile {
        return {
            x: player.x,
            y: player.y,
            size: weapon.range,
            damage: weapon.damage * player.damage,
            color: weapon.projectileColor,
            type: 'aura',
            lifetime: 0.5
        };
    }

    /**
     * Fire a whip weapon in the direction of movement or closest enemy
     */
    private static fireWhipWeapon(
        weapon: Weapon,
        player: Player,
        enemies: Enemy[],
        keys?: Record<string, boolean>
    ): Projectile {
        // Get direction based on movement or closest enemy
        let direction = 0;

        if (keys && (keys['w'] || keys['arrowup'] || keys['s'] || keys['arrowdown'] ||
            keys['a'] || keys['arrowleft'] || keys['d'] || keys['arrowright'])) {
            let dx = 0;
            let dy = 0;

            if (keys['w'] || keys['arrowup']) dy -= 1;
            if (keys['s'] || keys['arrowdown']) dy += 1;
            if (keys['a'] || keys['arrowleft']) dx -= 1;
            if (keys['d'] || keys['arrowright']) dx += 1;

            if (dx !== 0 || dy !== 0) {
                direction = Math.atan2(dy, dx);
            }
        } else {
            // If not moving, use direction to closest enemy
            const target = this.findClosestEnemy(player.x, player.y, enemies);
            if (target) {
                direction = Math.atan2(target.y - player.y, target.x - player.x);
            }
        }

        return {
            x: player.x,
            y: player.y,
            size: weapon.range,
            damage: weapon.damage * player.damage,
            color: weapon.projectileColor,
            type: 'whip',
            pattern: 'whip',
            direction: direction,
            lifetime: 0.2
        };
    }

    /**
     * Fire a 360 degree whip weapon
     */
    private static fireWhip360Weapon(weapon: Weapon, player: Player): Projectile {
        return {
            x: player.x,
            y: player.y,
            size: weapon.range,
            damage: weapon.damage * player.damage,
            color: weapon.projectileColor,
            type: 'whip',
            pattern: 'whip360',
            lifetime: 0.2
        };
    }

    /**
     * Fire a chain lightning weapon
     */
    private static fireChainWeapon(
        weapon: Weapon,
        player: Player,
        enemies: Enemy[]
    ): Projectile | null {
        // Find closest enemy
        const target = this.findClosestEnemy(player.x, player.y, enemies);

        if (target) {
            return {
                x: player.x,
                y: player.y,
                damage: weapon.damage * player.damage,
                color: weapon.projectileColor,
                type: 'chain',
                chainCount: weapon.chainCount,
                firstTarget: target,
                lifetime: 0.3,
                size: weapon.projectileSize
            };
        }

        return null;
    }

    /**
     * Fire a triple projectile weapon
     */
    private static fireTripleWeapon(
        weapon: Weapon,
        player: Player,
        enemies: Enemy[]
    ): Projectile[] {
        // Find closest enemy
        const target = this.findClosestEnemy(player.x, player.y, enemies);
        const projectiles: Projectile[] = [];

        if (target) {
            // Calculate direction to enemy
            const dx = target.x - player.x;
            const dy = target.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Base angle
            const angle = Math.atan2(dy, dx);
            const angles = [angle - Math.PI/8, angle, angle + Math.PI/8];

            // Create three projectiles
            for (const a of angles) {
                projectiles.push({
                    x: player.x,
                    y: player.y,
                    dirX: Math.cos(a),
                    dirY: Math.sin(a),
                    speed: weapon.projectileSpeed,
                    size: weapon.projectileSize,
                    damage: weapon.damage * player.damage,
                    color: weapon.projectileColor,
                    piercing: weapon.piercing,
                    area: weapon.area,
                    type: 'projectile'
                });
            }
        }

        return projectiles;
    }

    /**
     * Process chain lightning effects
     */
    static processChainLightning(
        proj: Projectile,
        enemies: Enemy[]
    ): Enemy[] {
        if (!proj.firstTarget || !proj.chainCount) return [];

        let currentTarget = proj.firstTarget;
        let chainCount = proj.chainCount;
        const hitTargets: Enemy[] = [currentTarget];

        // Deal damage to first target
        currentTarget.health -= proj.damage;

        // Chain to additional targets
        while (chainCount > 1 && currentTarget) {
            // Find next closest enemy that hasn't been hit
            let nextTarget: Enemy | null = null;
            let closestDist = Infinity;

            for (const enemy of enemies) {
                if (!hitTargets.includes(enemy)) {
                    const dist = distance(currentTarget.x, currentTarget.y, enemy.x, enemy.y);
                    if (dist < closestDist && dist < 150) {
                        closestDist = dist;
                        nextTarget = enemy;
                    }
                }
            }

            if (nextTarget) {
                // Deal damage to next target
                nextTarget.health -= (proj.damage ?? 0) * 0.8; // Reduced damage for chain targets

                // Add to hit list and continue chain
                hitTargets.push(nextTarget);
                currentTarget = nextTarget;
                chainCount--;
            } else {
                break; // No more targets in range
            }
        }

        return hitTargets;
    }

    /**
     * Check if an enemy is in the whip attack arc
     */
    static isInWhipArc(enemy: Enemy, proj: Projectile): boolean {
        if (proj.direction === undefined) return false;

        // Calculate angle to enemy
        const dx = enemy.x - proj.x;
        const dy = enemy.y - proj.y;
        const angleToEnemy = Math.atan2(dy, dx);

        // Calculate difference from whip direction
        let angleDiff = angleToEnemy - proj.direction;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Check if enemy is within arc (± PI/4 radians)
        return Math.abs(angleDiff) <= Math.PI / 4;
    }

    /**
     * Apply a weapon upgrade
     */
    static applyWeaponUpgrade(weapon: Weapon, upgrade: WeaponUpgrade): Weapon {
        const updatedWeapon = { ...weapon, level: upgrade.level };

        // Apply stats from upgrade
        for (const [key, value] of Object.entries(upgrade)) {
            if (key !== 'level' && key !== 'description') {
                // @ts-ignore - Dynamic property assignment
                updatedWeapon[key] = value;
            }
        }

        return updatedWeapon;
    }
}