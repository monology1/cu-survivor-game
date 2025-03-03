import {createContext, useContext, useReducer, ReactNode} from 'react';
import {
    GameState,
    GameAction,
    PassiveItemType
} from '@/types/game';
import {weaponTypes, passiveItems} from '@/game/entities';

const initialState: GameState = {
    gameRunning: false,
    currentState: 'MENU',
    player: {
        x: 0,
        y: 0,
        size: 30,
        speed: 5,
        maxHealth: 100,
        health: 100,
        level: 1,
        experience: 0,
        experienceToLevel: 10,
        damage: 1,
        attackSpeed: 1,
        pickupRange: 50,
        gold: 0,
        kills: 0,
        weapons: [],
        passiveItems: [],
        maxWeapons: 6
    },
    enemies: [],
    projectiles: [],
    pickups: [],
    particles: [],
    wave: {
        current: 1,
        enemiesSpawned: 0,
        enemiesKilled: 0,
        active: false,
        timeRemaining: 3,
        duration: 60,
        timer: 0
    },
    gameTime: 0,
    keys: {},
    upgradeOptions: [],
    shopItems: []
};

type GameStateContextType = {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...initialState,
                gameRunning: true,
                currentState: 'PLAYING',
                player: {
                    ...initialState.player,
                    x: action.payload.width / 2,
                    y: action.payload.height / 2,
                    weapons: [{...weaponTypes[0], cooldown: 0}]
                }
            };

        case 'UPDATE_PLAYER_POSITION':
            return {
                ...state,
                player: {
                    ...state.player,
                    x: action.payload.x,
                    y: action.payload.y
                }
            };

        case 'ADD_PASSIVE_ITEM':
            const {itemId} = action.payload;
            let updatedPlayer = {...state.player};

            // Apply effect based on item ID
            switch (itemId) {
                case 'heart':
                    updatedPlayer.maxHealth += 20;
                    updatedPlayer.health += 20;
                    break;
                case 'boots':
                    updatedPlayer.speed *= 1.15;
                    break;
                case 'glove':
                    updatedPlayer.damage *= 1.2;
                    break;
                case 'stopwatch':
                    updatedPlayer.attackSpeed *= 1.15;
                    break;
                case 'magnet':
                    updatedPlayer.pickupRange *= 1.3;
                    break;
                case 'clover':
                    // Handled when picking up XP
                    break;
            }

            // Find the item in passiveItems array to get its details
            const itemTemplate = passiveItems.find(item => item.id === itemId) as PassiveItemType;

            // Add to passive items
            updatedPlayer.passiveItems = [
                ...updatedPlayer.passiveItems,
                {
                    id: itemId,
                    name: itemTemplate.name,
                    description: itemTemplate.description,
                    icon: itemTemplate.icon
                }
            ];

            return {
                ...state,
                player: updatedPlayer,
                currentState: state.currentState === 'UPGRADING' ? 'PLAYING' : state.currentState
            };

        case 'ADD_WEAPON':
            // Check if player already has this weapon
            const existingWeaponIndex = state.player.weapons.findIndex(w => w.id === action.payload.weapon.id);

            if (existingWeaponIndex >= 0) {
                // If player already has this weapon, upgrade it
                return {
                    ...state,
                    currentState: state.currentState === 'UPGRADING' ? 'PLAYING' : state.currentState
                };
            } else {
                // Otherwise add new weapon if there's room
                if (state.player.weapons.length < state.player.maxWeapons) {
                    return {
                        ...state,
                        player: {
                            ...state.player,
                            weapons: [
                                ...state.player.weapons,
                                {...action.payload.weapon, cooldown: 0}
                            ]
                        },
                        currentState: state.currentState === 'UPGRADING' ? 'PLAYING' : state.currentState
                    };
                }
            }
            return state;

        case 'UPGRADE_WEAPON':
            const weaponIndex = state.player.weapons.findIndex(w => w.id === action.payload.weaponId);

            if (weaponIndex >= 0) {
                const weapon = state.player.weapons[weaponIndex];

                if (weapon.level < weapon.maxLevel) {
                    // Find upgrade for next level
                    const upgrade = weapon.upgrades.find(u => u.level === weapon.level + 1);

                    if (upgrade) {
                        // Create upgraded weapon
                        const upgradedWeapon = {
                            ...weapon,
                            level: upgrade.level,
                            damage: upgrade.damage !== undefined ? upgrade.damage : weapon.damage,
                            attackSpeed: upgrade.attackSpeed !== undefined ? upgrade.attackSpeed : weapon.attackSpeed,
                            projectileSize: upgrade.projectileSize !== undefined ? upgrade.projectileSize : weapon.projectileSize,
                            piercing: upgrade.piercing !== undefined ? upgrade.piercing : weapon.piercing,
                            range: upgrade.range !== undefined ? upgrade.range : weapon.range,
                            attackPattern: upgrade.attackPattern || weapon.attackPattern,
                            chainCount: upgrade.chainCount !== undefined ? upgrade.chainCount : weapon.chainCount
                        };

                        // Update weapons array
                        const updatedWeapons = [...state.player.weapons];
                        updatedWeapons[weaponIndex] = upgradedWeapon;

                        return {
                            ...state,
                            player: {
                                ...state.player,
                                weapons: updatedWeapons
                            },
                            currentState: state.currentState === 'UPGRADING' ? 'PLAYING' : state.currentState
                        };
                    }
                }
            }
            return state;

        case 'SPAWN_ENEMY':
            const {x, y, enemyType, waveScaling} = action.payload;

            const enemy = {
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

            return {
                ...state,
                enemies: [...state.enemies, enemy],
                wave: {
                    ...state.wave,
                    enemiesSpawned: state.wave.enemiesSpawned + 1
                }
            };

        case 'DAMAGE_ENEMY':
            return {
                ...state,
                enemies: state.enemies.map((enemy, index) => {
                    if (index === action.payload.enemyIndex) {
                        // Ensure we're SUBTRACTING damage (not adding)
                        return {
                            ...enemy,
                            health: enemy.health - action.payload.damage
                        };
                    }
                    return enemy;
                })
            };

        case 'DAMAGE_PLAYER':
            const newHealth = state.player.health - action.payload.damage;

            if (newHealth <= 0) {
                return {
                    ...state,
                    player: {
                        ...state.player,
                        health: 0
                    },
                    currentState: 'GAME_OVER',
                    gameRunning: false
                };
            }

            return {
                ...state,
                player: {
                    ...state.player,
                    health: newHealth
                }
            };

        case 'LEVEL_UP':
            const newLevel = state.player.level + 1;
            const newExperienceToLevel = Math.floor(10 + newLevel * 5);

            return {
                ...state,
                player: {
                    ...state.player,
                    level: newLevel,
                    experience: 0,
                    experienceToLevel: newExperienceToLevel
                },
                currentState: 'UPGRADING'
            };

        case 'SPEND_GOLD':
            return {
                ...state,
                player: {
                    ...state.player,
                    gold: Math.max(0, state.player.gold - action.payload.amount)
                }
            };

        case 'RESTORE_HEALTH':
            return {
                ...state,
                player: {
                    ...state.player,
                    health: Math.min(state.player.maxHealth, state.player.health + action.payload.amount)
                }
            };

        case 'UPDATE_WEAPON_COOLDOWN':
            const updatedWeapons = [...state.player.weapons];
            if (action.payload.index < updatedWeapons.length) {
                updatedWeapons[action.payload.index] = {
                    ...updatedWeapons[action.payload.index],
                    cooldown: action.payload.cooldown
                };
            }
            return {
                ...state,
                player: {
                    ...state.player,
                    weapons: updatedWeapons
                }
            };

        case 'SPAWN_PROJECTILE':
            return {
                ...state,
                projectiles: [...state.projectiles, action.payload]
            };

        case 'UPDATE_PROJECTILE_POSITION':
            const updatedProjectiles = [...state.projectiles];
            if (action.payload.index < updatedProjectiles.length) {
                updatedProjectiles[action.payload.index] = {
                    ...updatedProjectiles[action.payload.index],
                    x: action.payload.x,
                    y: action.payload.y
                };
            }
            return {
                ...state,
                projectiles: updatedProjectiles
            };

        case 'UPDATE_PROJECTILE_LIFETIME':
            const lifetimeUpdatedProjectiles = [...state.projectiles];
            if (action.payload.index < lifetimeUpdatedProjectiles.length) {
                lifetimeUpdatedProjectiles[action.payload.index] = {
                    ...lifetimeUpdatedProjectiles[action.payload.index],
                    lifetime: action.payload.lifetime
                };
            }
            return {
                ...state,
                projectiles: lifetimeUpdatedProjectiles
            };

        case 'REMOVE_PROJECTILE':
            return {
                ...state,
                projectiles: state.projectiles.filter((_, i) => i !== action.payload.index)
            };

        case 'START_WAVE':
            return {
                ...state,
                wave: {
                    ...state.wave,
                    active: true,
                    timer: 0,
                    enemiesSpawned: 0,
                    enemiesKilled: 0
                }
            };

        case 'END_WAVE':
            return {
                ...state,
                wave: {
                    ...state.wave,
                    current: state.wave.current + 1,
                    active: false,
                    timeRemaining: 5
                },
                currentState: 'SHOPPING'
            };

        case 'KEY_DOWN':
            return {
                ...state,
                keys: {
                    ...state.keys,
                    [action.payload.key]: true
                }
            };

        case 'KEY_UP':
            return {
                ...state,
                keys: {
                    ...state.keys,
                    [action.payload.key]: false
                }
            };

        case 'UPDATE':
            if (state.currentState !== 'PLAYING') return state;

            // Deep game state update - normally would include a lot more logic
            // This is simplified for example purposes
            return {
                ...state,
                gameTime: state.gameTime + action.payload.deltaTime,
                wave: {
                    ...state.wave,
                    timer: state.wave.active ? state.wave.timer + action.payload.deltaTime : state.wave.timer,
                    timeRemaining: !state.wave.active ? Math.max(0, state.wave.timeRemaining - action.payload.deltaTime) : state.wave.timeRemaining
                }
            };

        case 'OPEN_SHOP':
            return {
                ...state,
                currentState: 'SHOPPING'
            };

        case 'CLOSE_SHOP':
            return {
                ...state,
                currentState: 'PLAYING'
            };

        case 'GAME_OVER':
            return {
                ...state,
                currentState: 'GAME_OVER',
                gameRunning: false
            };

        default:
            return state;
    }
}

type GameStateProviderProps = {
    children: ReactNode;
};

export function GameStateProvider({children}: GameStateProviderProps) {
    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameStateContext.Provider value={{gameState, dispatch}}>
            {children}
        </GameStateContext.Provider>
    );
}

export function useGameState(): GameStateContextType {
    const context = useContext(GameStateContext);
    if (context === undefined) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
}