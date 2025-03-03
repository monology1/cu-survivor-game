import { Projectile } from '@/models/Projectile';
import { Enemy } from '@/models/Enemy';
import { Particle } from '@/models/Particle';
import { distance } from '@/utils/math';
import { CombatSystem } from './CombatSystem';

export class ProjectileSystem {
    /**
     * Handle collisions between projectiles and enemies
     */
    static handleProjectileEnemyCollisions(
        projectiles: Projectile[],
        enemies: Enemy[],
        deltaTime: number
    ): {
        projectiles: Projectile[];
        enemies: Enemy[];
        particles: Particle[];
        hits: { enemyIndex: number; projectileIndex: number }[];
    } {
        const updatedProjectiles = [...projectiles];
        const updatedEnemies = [...enemies];
        const particles: Particle[] = [];
        const hits: { enemyIndex: number; projectileIndex: number }[] = [];

        // Process each projectile
        for (let i = updatedProjectiles.length - 1; i >= 0; i--) {
            const proj = updatedProjectiles[i];

            // Process aura-type projectiles
            if (proj.type === 'aura') {
                // Check for enemies in range
                for (let j = 0; j < updatedEnemies.length; j++) {
                    const enemy = updatedEnemies[j];
                    const dist = distance(proj.x, proj.y, enemy.x, enemy.y);
                    if (dist <= proj.size) {
                        // Deal damage to enemy
                        updatedEnemies[j] = {
                            ...enemy,
                            health: enemy.health - proj.damage * deltaTime
                        };

                        // Create hit effect
                        if (Math.random() < 0.1) {
                            particles.push(...this.createHitEffect(enemy.x, enemy.y, proj.color));
                        }

                        hits.push({ enemyIndex: j, projectileIndex: i });
                    }
                }
            }
            // Process whip attack
            else if (proj.type === 'whip') {
                // Check enemies in range
                for (let j = 0; j < updatedEnemies.length; j++) {
                    const enemy = updatedEnemies[j];
                    // Check if enemy is in range
                    const dist = distance(proj.x, proj.y, enemy.x, enemy.y);
                    if (dist <= proj.size) {
                        // For whip, check if enemy is in the attack arc
                        if (proj.pattern === 'whip360' || CombatSystem.isInWhipArc(enemy, proj)) {
                            // Deal damage to enemy
                            updatedEnemies[j] = {
                                ...enemy,
                                health: enemy.health - proj.damage
                            };

                            // Create hit effect
                            particles.push(...this.createHitEffect(enemy.x, enemy.y, proj.color));

                            hits.push({ enemyIndex: j, projectileIndex: i });
                        }
                    }
                }
            }
            // Process chain lightning
            else if (proj.type === 'chain') {
                if (!proj.chainTargets) {
                    const chainTargets = CombatSystem.processChainLightning(proj, updatedEnemies);
                    updatedProjectiles[i] = {
                        ...proj,
                        chainTargets
                    };

                    // Create hit effects for each target
                    for (const target of chainTargets) {
                        particles.push(...this.createHitEffect(target.x, target.y, proj.color));
                    }
                }
            }
            // Regular projectile
            else {
                // Check collision with enemies
                for (let j = 0; j < updatedEnemies.length; j++) {
                    const enemy = updatedEnemies[j];
                    const dist = distance(proj.x, proj.y, enemy.x, enemy.y);

                    if (dist <= (proj.size + enemy.size / 2)) {
                        // Deal damage to enemy
                        updatedEnemies[j] = {
                            ...enemy,
                            health: enemy.health - proj.damage
                        };

                        // Create hit effect
                        particles.push(...this.createHitEffect(proj.x, proj.y, proj.color));

                        hits.push({ enemyIndex: j, projectileIndex: i });

                        // If not piercing, mark for removal
                        if (!proj.piercing) {
                            // If it's an area projectile, create explosion
                            if (proj.area) {
                                particles.push(...this.createExplosion(proj.x, proj.y, proj.color));

                                // Damage nearby enemies
                                for (let k = 0; k < updatedEnemies.length; k++) {
                                    const nearbyEnemy = updatedEnemies[k];
                                    const blastDist = distance(proj.x, proj.y, nearbyEnemy.x, nearbyEnemy.y);
                                    if (blastDist <= (proj.size * 2)) {
                                        updatedEnemies[k] = {
                                            ...nearbyEnemy,
                                            health: nearbyEnemy.health - proj.damage * (1 - blastDist / (proj.size * 2))
                                        };
                                    }
                                }
                            }

                            // Mark projectile for removal
                            updatedProjectiles[i] = { ...proj, lifetime: -1 };
                            break;
                        }
                    }
                }
            }
        }

        return { projectiles: updatedProjectiles, enemies: updatedEnemies, particles, hits };
    }

    /**
     * Create explosion particles
     */
    static createExplosion(x: number, y: number, color: string): Particle[] {
        const particles: Particle[] = [];
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const size = 2 + Math.random() * 3;

            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                lifetime: 0.5 + Math.random() * 0.5
            });
        }

        return particles;
    }

    /**
     * Create hit effect particles
     */
    static createHitEffect(x: number, y: number, color: string): Particle[] {
        const particles: Particle[] = [];
        const particleCount = 5;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const size = 1 + Math.random() * 2;

            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                lifetime: 0.2 + Math.random() * 0.3
            });
        }

        return particles;
    }
}