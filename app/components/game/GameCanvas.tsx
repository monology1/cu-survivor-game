import React, { useEffect, useRef, useState } from 'react';
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
    const { keys, keysRef } = useKeyboard();
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const [forceRun, setForceRun] = useState(false); // NEW: State to force the game to run

    // NEW: This effect starts the game loop directly when component mounts
    useEffect(() => {
        setForceRun(true);

        // Force a wave to start and manually spawn an enemy
        if (state.gameState === GameState.PLAYING) {
            dispatch({ type: 'START_WAVE' });

            // Add test enemy
            setTimeout(() => {
                const testEnemy = {
                    x: state.player.x + 100,
                    y: state.player.y - 100,
                    health: 30,
                    maxHealth: 30,
                    speed: 2,
                    damage: 10,
                    size: 20,
                    color: '#4CAF50',
                    experienceValue: 1,
                    goldValue: 1,
                    name: 'Test Enemy'
                };

                dispatch({ type: 'ADD_ENEMY', payload: testEnemy });
                console.log('Added test enemy from GameCanvas mount');
            }, 200);
        }
    }, []);

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

    // CHANGED: Game loop now runs regardless of gameRunning state
    useEffect(() => {

        // NEW: Always run the game loop if forceRun is true, regardless of state.gameRunning
        if (!forceRun && !state.gameRunning) {
            console.log('Game loop skipped due to !gameRunning && !forceRun');
            return;
        }

        const animationFrameRef = { current: 0 };

        const gameLoop = (timestamp: number) => {
            // Calculate delta time
            if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
            const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Convert to seconds
            lastFrameTimeRef.current = timestamp;

            // Cap delta time to avoid physics issues
            const cappedDeltaTime = Math.min(deltaTime, 0.2);

            // CHANGED: Run game logic even if gameState isn't PLAYING, just to keep things moving
            const isGameActive = state.gameState === GameState.PLAYING || forceRun;

            if (isGameActive) {

                // 1. Update wave
                const updatedWave = WaveSystem.updateWaveTimer(state.wave, cappedDeltaTime);

                // 2. Check wave state transitions
                if (WaveSystem.shouldStartWave(updatedWave)) {
                    dispatch({ type: 'START_WAVE' });
                }

                if (WaveSystem.shouldEndWave(updatedWave)) {
                    dispatch({ type: 'END_WAVE' });
                    dispatch({ type: 'SHOW_SHOP' });
                }

                // CHANGED: Always try to spawn enemies if we have none
                const shouldSpawnEnemies = (updatedWave.active || forceRun) && state.enemies.length < 50;

                // 3. Spawn enemies if needed
                if (shouldSpawnEnemies) {
                    // NEW: Special case for first enemies
                    if (state.enemies.length === 0) {
                        console.log('No enemies - forcing enemy spawn');

                        // Spawn 3 test enemies at different positions
                        for (let i = 0; i < 3; i++) {
                            const angle = (i / 3) * Math.PI * 2;
                            const distance = 150;

                            if (canvasRef.current) {
                                const testEnemy = {
                                    x: state.player.x + Math.cos(angle) * distance,
                                    y: state.player.y + Math.sin(angle) * distance,
                                    health: 30,
                                    maxHealth: 30,
                                    speed: 2,
                                    damage: 10,
                                    size: 20,
                                    color: '#FF0000',
                                    experienceValue: 1,
                                    goldValue: 1,
                                    name: 'Test Enemy'
                                };

                                dispatch({ type: 'ADD_ENEMY', payload: testEnemy });
                                console.log('Added forced test enemy at position', i);
                            }
                        }
                    } else {
                        // Normal enemy spawning
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
                                console.log('Added normal enemy through spawner');
                            }
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

            // Continue the game loop regardless of state
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        // Start the game loop
        animationFrameRef.current = requestAnimationFrame(gameLoop);

        // Handle direct keyboard movement
        const inputLoopRef = { current: 0 };

        const handleDirectKeyboard = () => {
            // Process keyboard input on every frame
            const currentKeys = keysRef.current;
            const moveSpeed = 5; // Speed multiplier
            let dx = 0;
            let dy = 0;

            // Process WASD and arrow keys
            if (currentKeys['w'] || currentKeys['arrowup'] || currentKeys['up']) dy -= 1;
            if (currentKeys['s'] || currentKeys['arrowdown'] || currentKeys['down']) dy += 1;
            if (currentKeys['a'] || currentKeys['arrowleft'] || currentKeys['left']) dx -= 1;
            if (currentKeys['d'] || currentKeys['arrowright'] || currentKeys['right']) dx += 1;

            // Only dispatch if there's actual movement
            if (dx !== 0 || dy !== 0) {
                // Normalize diagonal movement
                if (dx !== 0 && dy !== 0) {
                    const length = Math.sqrt(dx * dx + dy * dy);
                    dx /= length;
                    dy /= length;
                }

                // Update player position directly
                dispatch({
                    type: 'UPDATE_PLAYER',
                    payload: {
                        x: state.player.x + dx * moveSpeed,
                        y: state.player.y + dy * moveSpeed
                    }
                });
            }

            inputLoopRef.current = requestAnimationFrame(handleDirectKeyboard);
        };

        // Start the input processing loop (always run this)
        inputLoopRef.current = requestAnimationFrame(handleDirectKeyboard);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (inputLoopRef.current) {
                cancelAnimationFrame(inputLoopRef.current);
            }
        };
    }, [dispatch, state.player, forceRun]); // CHANGED: Simplified dependencies

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