import {GameState, GameAction, Enemy, Projectile, Pickup, Particle, Weapon, Player} from '@/types/game';
import {enemyTypes} from './entities';

// Update game state
export function updateGame(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
): void {
    // Update game state with deltaTime
    dispatch({type: 'UPDATE', payload: {deltaTime, canvasWidth, canvasHeight}});

    // Update player position based on key inputs
    updatePlayerPosition(gameState, dispatch, deltaTime, canvasWidth, canvasHeight);

    // Check for wave start/end
    updateWaveState(gameState, dispatch);

    // Update weapons
    updateWeapons(gameState, dispatch, deltaTime);

    // Update enemies
    updateEnemies(gameState, dispatch, deltaTime, canvasWidth, canvasHeight);

    // Update projectiles
    updateProjectiles(gameState, dispatch, deltaTime);

    // Update pickups
    updatePickups(gameState, dispatch, deltaTime);
}

// Update player position based on keyboard input
function updatePlayerPosition(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
): void {
    const {player, keys} = gameState;

    // Calculate movement direction
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

// Apply movement with deltaTime scaling
    const newX = player.x + dx * player.speed * deltaTime * 60;
    const newY = player.y + dy * player.speed * deltaTime * 60;

// Keep player in bounds
    const margin = 20;
    const boundedX = Math.max(margin, Math.min(canvasWidth - margin, newX));
    const boundedY = Math.max(margin, Math.min(canvasHeight - margin, newY));

// Update player position if it changed
    if (boundedX !== player.x || boundedY !== player.y) {
        dispatch({
            type: 'UPDATE_PLAYER_POSITION',
            payload: {x: boundedX, y: boundedY}
        });
    }
}

// Check for wave start/end
function updateWaveState(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>
): void {
    const {wave} = gameState;

    // Start wave if timer is up
    if (!wave.active && wave.timeRemaining <= 0) {
        dispatch({type: 'START_WAVE'});
    }

    // End wave if duration is up
    if (wave.active && wave.timer >= wave.duration) {
        dispatch({type: 'END_WAVE'});
    }
}

// Update weapons
function updateWeapons(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number
): void {
    const { player, wave, enemies } = gameState;

    // Skip if wave is not active
    if (!wave.active) return;

    // Process each weapon
    for (let i = 0; i < player.weapons.length; i++) {
        const weapon = player.weapons[i];

        // Skip if weapon doesn't exist or is not auto-fire
        if (!weapon || !weapon.autoFire) continue;

        // Update weapon cooldown
        const updatedWeapon = {
            ...weapon,
            cooldown: Math.max(0, weapon.cooldown - deltaTime)
        };

        // Check if weapon is ready to fire
        if (updatedWeapon.cooldown <= 0) {
            // Ready to fire - create projectile based on weapon type
            fireWeapon(gameState, dispatch, updatedWeapon, i);

            // Reset cooldown (adjusted by player attack speed)
            updatedWeapon.cooldown = 1 / (updatedWeapon.attackSpeed * player.attackSpeed);
        }

        // Update weapon in player's weapons array
        dispatch({
            type: 'UPDATE_WEAPON_COOLDOWN',
            payload: { index: i, cooldown: updatedWeapon.cooldown }
        });
    }
}

// Add this new function to fire weapons
function fireWeapon(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    weapon: Weapon,
    weaponIndex: number
): void {
    const { player, enemies } = gameState;

    switch (weapon.attackPattern) {
        case 'directional':
            fireDirectionalWeapon(gameState, dispatch, weapon);
            break;

        case 'aura':
            fireAuraWeapon(gameState, dispatch, weapon);
            break;

        case 'whip':
            fireWhipWeapon(gameState, dispatch, weapon);
            break;

        case 'chain':
            fireChainWeapon(gameState, dispatch, weapon);
            break;

        case 'triple':
            fireTripleWeapon(gameState, dispatch, weapon);
            break;

        case 'whip360':
            fireWhip360Weapon(gameState, dispatch, weapon);
            break;

        default:
            fireDirectionalWeapon(gameState, dispatch, weapon);
    }
}

// Helper functions for each weapon type (implement these)
function fireDirectionalWeapon(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    weapon: Weapon
): void {
    const { player, enemies } = gameState;

    // Find closest enemy
    const target = findClosestEnemy(player, enemies);

    if (target) {
        // Calculate direction to enemy
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Create projectile
        dispatch({
            type: 'SPAWN_PROJECTILE',
            payload: {
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
                type: 'projectile',
                lifetime: 2 // 2 seconds lifetime
            }
        });
    }
}

// Find closest enemy helper
function findClosestEnemy(player: Player, enemies: Enemy[]): Enemy | null {
    if (enemies.length === 0) return null;

    let closest: Enemy = enemies[0];
    let closestDist = distance(player.x, player.y, closest.x, closest.y);

    for (let i = 1; i < enemies.length; i++) {
        const dist = distance(player.x, player.y, enemies[i].x, enemies[i].y);
        if (dist < closestDist) {
            closest = enemies[i];
            closestDist = dist;
        }
    }

    return closest;
}

// Helper for calculating distance
function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Implement the other weapon firing functions
// Simplified versions for now - you can expand these later
function fireAuraWeapon(gameState: GameState, dispatch: React.Dispatch<GameAction>, weapon: Weapon): void {
    dispatch({
        type: 'SPAWN_PROJECTILE',
        payload: {
            x: gameState.player.x,
            y: gameState.player.y,
            size: weapon.range,
            damage: weapon.damage * gameState.player.damage,
            color: weapon.projectileColor,
            type: 'aura',
            lifetime: 0.5
        }
    });
}

function fireWhipWeapon(gameState: GameState, dispatch: React.Dispatch<GameAction>, weapon: Weapon): void {
    // Get direction based on movement or closest enemy
    let direction = 0;
    const { player, enemies, keys } = gameState;

    if (keys['w'] || keys['arrowup'] || keys['s'] || keys['arrowdown'] ||
        keys['a'] || keys['arrowleft'] || keys['d'] || keys['arrowright']) {
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
        const target = findClosestEnemy(player, enemies);
        if (target) {
            direction = Math.atan2(target.y - player.y, target.x - player.x);
        }
    }

    dispatch({
        type: 'SPAWN_PROJECTILE',
        payload: {
            x: player.x,
            y: player.y,
            size: weapon.range,
            damage: weapon.damage * player.damage,
            color: weapon.projectileColor,
            type: 'whip',
            pattern: 'whip',
            direction: direction,
            lifetime: 0.2
        }
    });
}

function fireChainWeapon(gameState: GameState, dispatch: React.Dispatch<GameAction>, weapon: Weapon): void {
    const { player, enemies } = gameState;
    const target = findClosestEnemy(player, enemies);

    if (target) {
        dispatch({
            type: 'SPAWN_PROJECTILE',
            payload: {
                x: player.x,
                y: player.y,
                damage: weapon.damage * player.damage,
                color: weapon.projectileColor,
                type: 'chain',
                chainCount: weapon.chainCount || 2,
                firstTarget: target,
                lifetime: 0.3,
                size: weapon.projectileSize
            }
        });
    }
}

function fireTripleWeapon(gameState: GameState, dispatch: React.Dispatch<GameAction>, weapon: Weapon): void {
    const { player, enemies } = gameState;
    const target = findClosestEnemy(player, enemies);

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
            dispatch({
                type: 'SPAWN_PROJECTILE',
                payload: {
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
                    type: 'projectile',
                    lifetime: 2
                }
            });
        }
    }
}

function fireWhip360Weapon(gameState: GameState, dispatch: React.Dispatch<GameAction>, weapon: Weapon): void {
    const { player } = gameState;

    dispatch({
        type: 'SPAWN_PROJECTILE',
        payload: {
            x: player.x,
            y: player.y,
            size: weapon.range,
            damage: weapon.damage * player.damage,
            color: weapon.projectileColor,
            type: 'whip',
            pattern: 'whip360',
            lifetime: 0.2
        }
    });
}

// Update projectiles function with collision detection and proper movement
function updateProjectiles(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number
): void {
    const { projectiles, enemies, player } = gameState;

    for (let i = 0; i < projectiles.length; i++) {
        const proj = projectiles[i];

        // Update projectile position
        if (proj.type === 'projectile' && proj.dirX !== undefined && proj.dirY !== undefined && proj.speed !== undefined) {
            const newX = proj.x + proj.dirX * proj.speed * deltaTime * 60;
            const newY = proj.y + proj.dirY * proj.speed * deltaTime * 60;

            dispatch({
                type: 'UPDATE_PROJECTILE_POSITION',
                payload: { index: i, x: newX, y: newY }
            });
        }

        // Update projectile lifetime
        if (proj.lifetime !== undefined) {
            const newLifetime = proj.lifetime - deltaTime;

            if (newLifetime <= 0) {
                // Remove projectile if expired
                dispatch({
                    type: 'REMOVE_PROJECTILE',
                    payload: { index: i }
                });
                continue;
            }

            dispatch({
                type: 'UPDATE_PROJECTILE_LIFETIME',
                payload: { index: i, lifetime: newLifetime }
            });
        }

        // Handle different projectile types
        switch (proj.type) {
            case 'projectile':
                // Check collision with enemies
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    const dist = distance(proj.x, proj.y, enemy.x, enemy.y);

                    if (dist <= (proj.size + enemy.size / 2)) {
                        // Deal damage to enemy
                        dispatch({
                            type: 'DAMAGE_ENEMY',
                            payload: { enemyIndex: j, damage: proj.damage }
                        });

                        // Create hit effect
                        // (This would be handled by a particles system)

                        // If not piercing, remove projectile
                        if (!proj.piercing) {
                            dispatch({
                                type: 'REMOVE_PROJECTILE',
                                payload: { index: i }
                            });
                            break;
                        }
                    }
                }
                break;

            case 'aura':
                // Aura damages all enemies in range
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    const dist = distance(proj.x, proj.y, enemy.x, enemy.y);

                    if (dist <= proj.size) {
                        // Deal damage to enemy (scaled by deltaTime for consistent damage)
                        dispatch({
                            type: 'DAMAGE_ENEMY',
                            payload: { enemyIndex: j, damage: proj.damage * deltaTime }
                        });
                    }
                }
                break;

            // Implement other projectile type handling as needed
        }

        // Check if projectile is out of bounds
        if (proj.type === 'projectile') {
            if (proj.x < -100 || proj.x > 2000 || proj.y < -100 || proj.y > 2000) {
                dispatch({
                    type: 'REMOVE_PROJECTILE',
                    payload: { index: i }
                });
            }
        }
    }
}

// Update enemies
function updateEnemies(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
): void {
    const {enemies, player, wave} = gameState;

    // Spawn enemies if wave is active
    if (wave.active && enemies.length < 50) {
        const maxEnemies = 10 + Math.floor(wave.current * 1.5);
        const enemiesToSpawn = Math.min(maxEnemies - enemies.length, 3);

        for (let i = 0; i < enemiesToSpawn; i++) {
            // Choose enemy type based on wave
            const possibleTypes = [0, 1]; // Basic enemies

            if (wave.current >= 2) possibleTypes.push(2); // Add more types as waves progress
            if (wave.current >= 3) possibleTypes.push(3);

            // Boss every 5 waves
            if (wave.current % 5 === 0 && enemies.length < 20 && Math.random() < 0.05) {
                possibleTypes.length = 0;
                possibleTypes.push(4); // Boss
            }

            const typeIndex = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
            const enemyType = enemyTypes[typeIndex];

            // Scale difficulty with wave number
            const waveScaling = 1 + (wave.current - 1) * 0.1;

            // Determine spawn position (outside the visible area)
            let x = 0, y = 0;
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
                case 3: // Left
                    x = -buffer;
                    y = Math.random() * canvasHeight;
                    break;
            }

            // Spawn enemy
            dispatch({
                type: 'SPAWN_ENEMY',
                payload: {x, y, enemyType, waveScaling}
            });
        }
    }

    // Update existing enemies
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        // Move enemy towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) { // Prevent jittering when close
            enemy.x += (dx / dist) * enemy.speed * deltaTime * 60;
            enemy.y += (dy / dist) * enemy.speed * deltaTime * 60;
        }

        // Check collision with player
        if (dist < (player.size / 2 + enemy.size / 2)) {
            // Deal damage to player
            dispatch({
                type: 'DAMAGE_PLAYER',
                payload: {damage: enemy.damage * deltaTime}
            });
        }
    }
}

// Update pickups
function updatePickups(
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    deltaTime: number
): void {
    // This would implement pickup movement, collection, etc.
}

// Drawing functions
export function drawGame(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    canvasWidth: number,
    canvasHeight: number
): void {
    // Draw background
    drawBackground(ctx, canvasWidth, canvasHeight);

    // Draw pickups
    drawPickups(ctx, gameState.pickups);

    // Draw projectiles
    drawProjectiles(ctx, gameState.projectiles);

    // Draw enemies
    drawEnemies(ctx, gameState.enemies);

    // Draw player
    drawPlayer(ctx, gameState);

    // Draw particles
    drawParticles(ctx, gameState.particles);
}

// Draw background
function drawBackground(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
): void {
    // Draw grid pattern
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const gridSize = 60;

    // Draw vertical lines
    for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
        ctx.closePath();
    }

    // Draw horizontal lines
    for (let y = 0; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
        ctx.closePath();
    }
}

// Draw player
function drawPlayer(
    ctx: CanvasRenderingContext2D,
    gameState: GameState
): void {
    const {player, keys} = gameState;

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

// Draw enemies
function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
    for (const enemy of enemies) {
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

        // Draw enemy features based on type
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
}

// Draw projectiles
function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
    for (const proj of projectiles) {
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
                ctx.strokeStyle = proj.color;
                ctx.lineWidth = 2;

                let lastX = proj.x;
                let lastY = proj.y;

                for (const target of proj.chainTargets) {
                    // Draw jagged lightning line
                    drawLightning(ctx, lastX, lastY, target.x, target.y, proj.color);

                    lastX = target.x;
                    lastY = target.y;
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
}

// Draw pickups
function drawPickups(ctx: CanvasRenderingContext2D, pickups: Pickup[]): void {
    for (const pickup of pickups) {
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
}

// Draw particles
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.lifetime * 2; // Fade out as lifetime decreases
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
    }
}

// Helper function to draw lightning effect
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

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
    ctx.closePath();

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
}

// Enemy feature drawing functions
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