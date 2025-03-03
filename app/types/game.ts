export type GameStateType = 'MENU' | 'PLAYING' | 'SHOPPING' | 'UPGRADING' | 'GAME_OVER';

export interface Vector2D {
    x: number;
    y: number;
}

export interface Player extends Vector2D {
    size: number;
    speed: number;
    maxHealth: number;
    health: number;
    level: number;
    experience: number;
    experienceToLevel: number;
    damage: number;
    attackSpeed: number;
    pickupRange: number;
    gold: number;
    kills: number;
    weapons: Weapon[];
    passiveItems: PassiveItem[];
    maxWeapons: number;
}

export type AttackPattern = 'directional' | 'aura' | 'whip' | 'chain' | 'triple' | 'whip360';

export interface WeaponUpgrade {
    level: number;
    damage?: number;
    attackSpeed?: number;
    projectileSize?: number;
    piercing?: boolean;
    range?: number;
    description: string;
    chainCount?: number;
    attackPattern?: AttackPattern;
}

export interface WeaponType {
    id: string;
    name: string;
    description: string;
    icon: string;
    damage: number;
    attackSpeed: number;
    projectileSpeed: number;
    projectileSize: number;
    projectileColor: string;
    autoFire: boolean;
    piercing: boolean;
    area: boolean;
    attackPattern: AttackPattern;
    range: number;
    level: number;
    maxLevel: number;
    chainCount?: number;
    upgrades: WeaponUpgrade[];
}

export interface Weapon extends WeaponType {
    cooldown: number;
}

export interface PassiveItemType {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface PassiveItem {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface Enemy extends Vector2D {
    health: number;
    maxHealth: number;
    speed: number;
    damage: number;
    size: number;
    color: string;
    experienceValue: number;
    goldValue: number;
    name: string;
}

export interface EnemyType {
    name: string;
    health: number;
    speed: number;
    damage: number;
    size: number;
    color: string;
    experienceValue: number;
    goldValue: number;
}

export interface Projectile extends Vector2D {
    dirX?: number;
    dirY?: number;
    speed?: number;
    size: number;
    damage: number;
    color: string;
    piercing?: boolean;
    area?: boolean;
    type: 'projectile' | 'aura' | 'whip' | 'chain';
    pattern?: string;
    direction?: number;
    lifetime?: number;
    chainCount?: number;
    firstTarget?: Enemy;
    chainTargets?: Enemy[];
}

export interface Pickup extends Vector2D {
    type: 'experience' | 'gold' | 'health';
    value: number;
    size: number;
    color: string;
}

export interface Particle extends Vector2D {
    vx: number;
    vy: number;
    size: number;
    color: string;
    lifetime: number;
}

export interface Wave {
    current: number;
    enemiesSpawned: number;
    enemiesKilled: number;
    active: boolean;
    timeRemaining: number;
    duration: number;
    timer: number;
}

export interface GameState {
    gameRunning: boolean;
    currentState: GameStateType;
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    pickups: Pickup[];
    particles: Particle[];
    wave: Wave;
    gameTime: number;
    keys: Record<string, boolean>;
    upgradeOptions: any[];
    shopItems: any[];
}

export type GameAction =
    | { type: 'START_GAME'; payload: { width: number; height: number } }
    | { type: 'UPDATE_PLAYER_POSITION'; payload: { x: number; y: number } }
    | { type: 'ADD_PASSIVE_ITEM'; payload: { itemId: string } }
    | { type: 'ADD_WEAPON'; payload: { weapon: WeaponType } }
    | { type: 'UPGRADE_WEAPON'; payload: { weaponId: string } }
    | { type: 'SPAWN_ENEMY'; payload: { x: number; y: number; enemyType: EnemyType; waveScaling: number } }
    | { type: 'DAMAGE_ENEMY'; payload: { enemyIndex: number; damage: number } }
    | { type: 'DAMAGE_PLAYER'; payload: { damage: number } }
    | { type: 'COLLECT_PICKUP'; payload: { pickupIndex: number } }
    | { type: 'SPAWN_PROJECTILE'; payload: Projectile }
    | { type: 'LEVEL_UP' }
    | { type: 'START_WAVE' }
    | { type: 'END_WAVE' }
    | { type: 'OPEN_SHOP' }
    | { type: 'CLOSE_SHOP' }
    | { type: 'KEY_DOWN'; payload: { key: string } }
    | { type: 'KEY_UP'; payload: { key: string } }
    | { type: 'GAME_OVER' }
    | { type: 'UPDATE'; payload: { deltaTime: number; canvasWidth: number; canvasHeight: number } }
    | { type: 'SPEND_GOLD'; payload: { amount: number } }
    | { type: 'RESTORE_HEALTH'; payload: { amount: number } }
    | { type: 'UPDATE_WEAPON_COOLDOWN'; payload: { index: number; cooldown: number } }
    | { type: 'UPDATE_PROJECTILE_POSITION'; payload: { index: number; x: number; y: number } }
    | { type: 'UPDATE_PROJECTILE_LIFETIME'; payload: { index: number; lifetime: number } }
    | { type: 'REMOVE_PROJECTILE'; payload: { index: number } };

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
    type: 'weapon' | 'passive' | 'health';
    itemId?: string;
}

export interface UpgradeOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'weapon' | 'weaponUpgrade' | 'passive';
    itemId?: string;
    weaponId?: string;
}