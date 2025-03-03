import React, { useEffect, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useCanvas } from '@/hooks/useCanvas';
import { useKeyboard } from '@/hooks/useKeyboard';
import { GameState } from '@/models/Game';
import { drawBackground, drawPlayer, drawEnemy, drawProjectile, drawPickup, drawParticle } from '@/utils/rendering';
import { MovementSystem } from '@/systems/MovementSystem';
import { ProjectileSystem } from '@/systems/ProjectileSystem';
import { PickupSystem } from '@/systems/PickupSystem';
import { ParticleSystem } from '@/systems/ParticleSystem';
import { EnemySystem } from '@/systems/EnemySystem';
import { WaveSystem } from '@/systems/WaveSystem';
import { CombatSystem } from '@/systems/CombatSystem';
import { LevelSystem } from '@/systems/LevelSystem';

const GameCanvas: React.FC = () => {
    const { state, dispatch } = useGameContext();
    const keys = useKeyboard();
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const lastFrameTimeRef = useRef<number>(0);

    // Define the draw function for the canvas
    const draw = (ctx: CanvasRenderingContext2D) => {
        const { width, height } = ctx.canvas;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Only render game entities when playing
        if (state.gameState === GameState.PLAYING ||
            state.gameState === GameState.SHOPPING ||
            state.gameState === GameState.UPGRADING) {
            // Draw background
            drawBackground(ctx, width, height);

            // Draw pickups
            state.pickups.forEach(pickup => drawPickup(ctx, pickup));

            // Draw projectiles
            state.projectiles.forEach(proj => drawProjectile(ctx, proj));

            // Draw enemies
            state.enemies.forEach(enemy => drawEnemy(ctx, enemy));

            // Draw player
            drawPlayer(ctx, state.player, keys);

            // Draw particles
            state.particles.forEach(particle => drawParticle(ctx, particle));
        }
    };

    // Use the canvas hook
    const canvasRef = useCanvas(draw);

    // Update game state on every frame
    useEffect(() => {
        if (!state.gameRunning) return;

        const gameLoop = (timestamp: number) => {
            if (!state.gameRunning) return;

            // Calculate delta time
            if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
            const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Convert to seconds
            lastFrameTimeRef.current = timestamp;

            // Cap delta time to avoid physics issues
            const cappedDeltaTime = Math.min(deltaTime, 0.2);

            // Only update game logic when playing
            if (state.gameState === GameState.PLAYING) {
                // 1. Update wave
                const updatedWave = WaveSystem.updateWaveTimer(state.wave, cappedDeltaTime);

                // 2. Check wave state transitions
                if (WaveSystem.shouldStartWave(updatedWave)) {
                    dispatch({ type: 'START_WAVE' });
                    return;
                }

                if (WaveSystem.shouldEndWave(updatedWave)) {
                    dispatch({ type: 'END_WAVE' });
                    dispatch({ type: 'SHOW_SHOP' });
                    return;
                }

                // 3. Spawn enemies if needed
                if (updatedWave.active && state.enemies.length < 50) {
                    const maxEnemies = WaveSystem.getMaxEnemies(updatedWave.current);
                    const enemiesToSpawn = WaveSystem.calculateEnemiesToSpawn(
                        state.enemies.length,
                        updatedWave.current
                    );

                    for (let i = 0; i < enemiesToSpawn; i++) {
                        if (canvasRef.current) {
                            const { width, height } = canvasRef.current;
                            const newEnemy = EnemySystem.spawnEnemy(width, height, updatedWave.current);
                            dispatch({ type: 'ADD_ENEMY', payload: newEnemy });
                        }
                    }
                }

                // 4. Update player position
                if (canvasRef.current) {
                    const { width, height } = canvasRef.current;
                    const updatedPlayer = MovementSystem.updatePlayerPosition(
                        state.player,
                        keys,
                        cappedDeltaTime,
                        width,
                        height
                    );

                    // 5. Handle player-enemy collisions
                    const { player: collidedPlayer, enemies: collidedEnemies } =
                        EnemySystem.handlePlayerEnemyCollisions(updatedPlayer, state.enemies, cappedDeltaTime);

                    // Check for player death
                    if (collidedPlayer.health <= 0) {
                        dispatch({ type: 'GAME_OVER' });
                        return;
                    }

                    // 6. Update enemies
                    const movedEnemies = MovementSystem.updateEnemyPositions(
                        collidedEnemies,
                        collidedPlayer,
                        cappedDeltaTime
                    );

                    // 7. Fire weapons
                    for (const weapon of collidedPlayer.weapons) {
                        if (!weapon.cooldown || weapon.cooldown <= 0) {
                            const projectile = CombatSystem.fireWeapon(weapon, collidedPlayer, movedEnemies);

                            if (projectile) {
                                if (Array.isArray(projectile)) {
                                    projectile.forEach(p => dispatch({ type: 'ADD_PROJECTILE', payload: p }));
                                } else {
                                    dispatch({ type: 'ADD_PROJECTILE', payload: projectile });
                                }
                            }

                            // Set cooldown
                            dispatch({
                                type: 'UPDATE_PLAYER',
                                payload: {
                                    weapons: collidedPlayer.weapons.map(w =>
                                        w.id === weapon.id
                                            ? { ...w, cooldown: 1 / (w.attackSpeed * collidedPlayer.attackSpeed) }
                                            : w
                                    )
                                }
                            });
                        } else {
                            // Reduce cooldown
                            dispatch({
                                type: 'UPDATE_PLAYER',
                                payload: {
                                    weapons: collidedPlayer.weapons.map(w =>
                                        w.id === weapon.id
                                            ? { ...w, cooldown: Math.max(0, (w.cooldown || 0) - cappedDeltaTime) }
                                            : w
                                    )
                                }
                            });
                        }
                    }

                    // 8. Update projectiles
                    const updatedProjectiles = MovementSystem.updateProjectilePositions(
                        state.projectiles,
                        collidedPlayer,
                        cappedDeltaTime
                    );

                    // 9. Handle projectile-enemy collisions
                    const {
                        projectiles: collidedProjectiles,
                        enemies: hitEnemies,
                        particles: newParticles
                    } = ProjectileSystem.handleProjectileEnemyCollisions(
                        updatedProjectiles,
                        movedEnemies,
                        cappedDeltaTime
                    );

                    // 10. Remove dead enemies and spawn pickups
                    hitEnemies.forEach((enemy, index) => {
                        if (enemy.health <= 0) {
                            // Increment kill counter
                            dispatch({
                                type: 'UPDATE_PLAYER',
                                payload: { kills: collidedPlayer.kills + 1 }
                            });

                            // Spawn experience pickup
                            const expPickup = PickupSystem.spawnPickup(
                                enemy.x,
                                enemy.y,
                                'experience',
                                enemy.experienceValue
                            );
                            dispatch({ type: 'ADD_PICKUP', payload: expPickup });

                            // Chance to spawn gold
                            if (Math.random() < 0.3) {
                                const goldPickup = PickupSystem.spawnPickup(
                                    enemy.x,
                                    enemy.y,
                                    'gold',
                                    enemy.goldValue
                                );
                                dispatch({ type: 'ADD_PICKUP', payload: goldPickup });
                            }

                            // Create explosion particles
                            const explosionParticles = ProjectileSystem.createExplosion(
                                enemy.x,
                                enemy.y,
                                enemy.color
                            );
                            explosionParticles.forEach(particle =>
                                dispatch({ type: 'ADD_PARTICLE', payload: particle })
                            );

                            // Remove enemy
                            dispatch({ type: 'REMOVE_ENEMY', payload: { index } });
                        }
                    });

                    // 11. Remove projectiles that are expired or out of bounds
                    collidedProjectiles.forEach((proj, index) => {
                        if ((proj.lifetime !== undefined && proj.lifetime <= 0) ||
                            MovementSystem.isProjectileOutOfBounds(proj, width, height)) {
                            dispatch({ type: 'REMOVE_PROJECTILE', payload: { index } });
                        }
                    });

                    // 12. Update pickups
                    const updatedPickups = MovementSystem.updatePickupPositions(
                        state.pickups,
                        collidedPlayer,
                        cappedDeltaTime
                    );

                    // 13. Handle pickup collection
                    const { player: playerAfterPickups, collectedPickups } =
                        PickupSystem.handlePickupCollection(collidedPlayer, updatedPickups);

                    // Remove collected pickups
                    collectedPickups.sort((a, b) => b - a).forEach(index => {
                        dispatch({ type: 'REMOVE_PICKUP', payload: { index } });
                    });

                    // 14. Update player with new values
                    dispatch({ type: 'UPDATE_PLAYER', payload: playerAfterPickups });

                    // 15. Check for level up
                    if (LevelSystem.checkLevelUp(playerAfterPickups)) {
                        dispatch({ type: 'LEVEL_UP' });
                    }

                    // 16. Update particles
                    const updatedParticles = ParticleSystem.updateParticles(state.particles, cappedDeltaTime);

                    // Remove expired particles
                    state.particles.forEach((_, index) => {
                        if (index >= updatedParticles.length) {
                            dispatch({ type: 'REMOVE_PARTICLE', payload: { index } });
                        }
                    });

                    // 17. Update wave
                    dispatch({
                        type: 'UPDATE_GAME',
                        payload: { deltaTime: cappedDeltaTime }
                    });
                }
            }

            requestAnimationFrame(gameLoop);
        };

        const animationId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [state, dispatch, keys, canvasRef]);

    return (
        <div ref={canvasContainerRef} className="w-full h-full">
            <canvas
                ref={canvasRef}
                className="bg-gray-900 border-2 border-gray-700 max-w-screen-lg max-h-screen w-full h-full mx-auto"
            />
        </div>
    );
};

export default GameCanvas;