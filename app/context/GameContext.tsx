import {Player} from "@/app/models/Player";
import {Enemy} from "@/app/models/Enemy";
import {Projectile} from "@/app/models/Projectile";
import {Pickup} from "@/app/models/Pickup";
import {Particle} from "@/app/models/Particle";
import {GameState, Wave} from "@/app/models/Game";
import {Weapon} from "@/app/models/Weapon";
import {PassiveItem} from "@/app/models/PassiveItem";
import {createContext, ReactNode, useContext, useEffect, useReducer} from "react";

export interface IGameState {
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    pickups: Pickup[];
    particles: Particle[];
    wave: Wave;
    gameTime: number;
    lastTimestamp: number;
    gameState: GameState;
    gameRunning: boolean;
}

// Define action types
type GameAction =
    | { type: 'INIT_GAME' }
    | { type: 'START_GAME' }
    | { type: 'RESTART_GAME' }
    | { type: 'GAME_OVER' }
    | { type: 'SHOW_SHOP' }
    | { type: 'CLOSE_SHOP' }
    | { type: 'SHOW_UPGRADE_MENU' }
    | { type: 'CLOSE_UPGRADE_MENU' }
    | { type: 'START_WAVE' }
    | { type: 'END_WAVE' }
    | { type: 'UPDATE_PLAYER', payload: Partial<Player> }
    | { type: 'UPDATE_GAME', payload: { deltaTime: number } }
    | { type: 'ADD_ENEMY', payload: Enemy }
    | { type: 'REMOVE_ENEMY', payload: { index: number } }
    | { type: 'ADD_PROJECTILE', payload: Projectile }
    | { type: 'REMOVE_PROJECTILE', payload: { index: number } }
    | { type: 'ADD_PICKUP', payload: Pickup }
    | { type: 'REMOVE_PICKUP', payload: { index: number } }
    | { type: 'ADD_PARTICLE', payload: Particle }
    | { type: 'REMOVE_PARTICLE', payload: { index: number } }
    | { type: 'GIVE_WEAPON', payload: Weapon }
    | { type: 'UPGRADE_WEAPON', payload: { weaponId: string } }
    | { type: 'GIVE_PASSIVE_ITEM', payload: PassiveItem }
    | { type: 'LEVEL_UP' };

// Initial state
const initialState: IGameState = {
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
    lastTimestamp: 0,
    gameState: GameState.MENU,
    gameRunning: false
};

// Create context
interface GameContextType {
    state: IGameState;
    dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer function
function gameReducer(state: IGameState, action: GameAction): IGameState {
    switch (action.type) {
        case 'INIT_GAME':
            return {
                ...initialState,
                player: {
                    ...initialState.player,
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                }
            };

        case 'START_GAME':
            console.log('START_GAME action received - fixing game state');
            const newState = {
                ...state,
                gameState: GameState.PLAYING,
                gameRunning: true // Make sure this is set to true
            };
            console.log('Game state should now be:', newState.gameState);
            console.log('Game running should now be:', newState.gameRunning);

            // Return the new state
            return newState;

        case 'RESTART_GAME':
            return {
                ...initialState,
                player: {
                    ...initialState.player,
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                },
                gameState: GameState.PLAYING,
                gameRunning: true
            };

        case 'GAME_OVER':
            return {
                ...state,
                gameState: GameState.GAME_OVER,
                gameRunning: false
            };

        case 'SHOW_SHOP':
            return {
                ...state,
                gameState: GameState.SHOPPING
            };

        case 'CLOSE_SHOP':
            return {
                ...state,
                gameState: GameState.PLAYING
            };

        case 'SHOW_UPGRADE_MENU':
            return {
                ...state,
                gameState: GameState.UPGRADING
            };

        case 'CLOSE_UPGRADE_MENU':
            return {
                ...state,
                gameState: GameState.PLAYING
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
                    active: false,
                    current: state.wave.current + 1,
                    timeRemaining: 5
                }
            };

        case 'UPDATE_PLAYER':
            return {
                ...state,
                player: {
                    ...state.player,
                    ...action.payload
                }
            };

        case 'UPDATE_GAME':
            const { deltaTime } = action.payload;

            // Update game time
            const gameTime = state.gameTime + deltaTime;

            // Update wave timer
            let wave = { ...state.wave };
            if (!wave.active) {
                wave.timeRemaining -= deltaTime;
            } else {
                wave.timer += deltaTime;
            }

            return {
                ...state,
                gameTime,
                wave,
                lastTimestamp: Date.now()
            };

        case 'ADD_ENEMY':
            return {
                ...state,
                enemies: [...state.enemies, action.payload]
            };

        case 'REMOVE_ENEMY':
            const enemiesFiltered = [...state.enemies];
            enemiesFiltered.splice(action.payload.index, 1);
            return {
                ...state,
                enemies: enemiesFiltered,
                wave: {
                    ...state.wave,
                    enemiesKilled: state.wave.enemiesKilled + 1
                }
            };

        case 'ADD_PROJECTILE':
            return {
                ...state,
                projectiles: [...state.projectiles, action.payload]
            };

        case 'REMOVE_PROJECTILE':
            const projectilesFiltered = [...state.projectiles];
            projectilesFiltered.splice(action.payload.index, 1);
            return {
                ...state,
                projectiles: projectilesFiltered
            };

        case 'ADD_PICKUP':
            return {
                ...state,
                pickups: [...state.pickups, action.payload]
            };

        case 'REMOVE_PICKUP':
            const pickupsFiltered = [...state.pickups];
            pickupsFiltered.splice(action.payload.index, 1);
            return {
                ...state,
                pickups: pickupsFiltered
            };

        case 'ADD_PARTICLE':
            return {
                ...state,
                particles: [...state.particles, action.payload]
            };

        case 'REMOVE_PARTICLE':
            const particlesFiltered = [...state.particles];
            particlesFiltered.splice(action.payload.index, 1);
            return {
                ...state,
                particles: particlesFiltered
            };

        case 'GIVE_WEAPON':
            const weaponToAdd = action.payload;
            // Check if player already has this weapon
            const existingWeaponIndex = state.player.weapons.findIndex(w => w.id === weaponToAdd.id);

            if (existingWeaponIndex !== -1) {
                // Upgrade existing weapon (handled in UPGRADE_WEAPON)
                return {
                    ...state,
                    player: {
                        ...state.player,
                        weapons: state.player.weapons.map((weapon, index) =>
                            index === existingWeaponIndex
                                ? { ...weapon, level: weapon.level + 1 }
                                : weapon
                        )
                    }
                };
            } else {
                // Add new weapon if player has space
                if (state.player.weapons.length < state.player.maxWeapons) {
                    return {
                        ...state,
                        player: {
                            ...state.player,
                            weapons: [...state.player.weapons, { ...weaponToAdd, cooldown: 0 }]
                        }
                    };
                }
            }
            return state;

        case 'UPGRADE_WEAPON':
            return {
                ...state,
                player: {
                    ...state.player,
                    weapons: state.player.weapons.map(weapon =>
                        weapon.id === action.payload.weaponId && weapon.level < weapon.maxLevel
                            ? { ...weapon, level: weapon.level + 1 }
                            : weapon
                    )
                }
            };

        case 'GIVE_PASSIVE_ITEM':
            const itemToAdd = action.payload;
            return {
                ...state,
                player: {
                    ...state.player,
                    passiveItems: [...state.player.passiveItems, itemToAdd]
                }
            };

        case 'LEVEL_UP':
            return {
                ...state,
                player: {
                    ...state.player,
                    level: state.player.level + 1,
                    experience: state.player.experience - state.player.experienceToLevel,
                    experienceToLevel: Math.floor(10 + (state.player.level + 1) * 5)
                },
                gameState: GameState.UPGRADING
            };

        default:
            return state;
    }
}

// Context provider component
interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Initialize game when component mounts
    useEffect(() => {
        dispatch({ type: 'INIT_GAME' });
    }, []);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

// Custom hook to use the game context
export const useGameContext = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};