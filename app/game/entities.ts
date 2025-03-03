import { WeaponType, PassiveItemType, EnemyType } from '@/types/game';

// Weapon types
export const weaponTypes: WeaponType[] = [
    {
        id: 'potato_gun',
        name: 'Potato Gun',
        description: 'Basic ranged weapon',
        icon: '🥔',
        damage: 10,
        attackSpeed: 1,
        projectileSpeed: 8,
        projectileSize: 5,
        projectileColor: '#E8BD68',
        autoFire: true,
        piercing: false,
        area: false,
        attackPattern: 'directional',
        range: 300,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, damage: 15, description: '+50% damage' },
            { level: 3, attackSpeed: 1.5, description: '+50% attack speed' },
            { level: 4, projectileSize: 7, piercing: true, description: 'Projectiles pierce enemies' },
            { level: 5, damage: 25, attackSpeed: 2, description: 'Maximum power' }
        ]
    },
    {
        id: 'garlic',
        name: 'Garlic Aura',
        description: 'Damages nearby enemies',
        icon: '🧄',
        damage: 5,
        attackSpeed: 0.5,
        projectileSpeed: 0,
        projectileSize: 80,
        projectileColor: 'rgba(200, 255, 200, 0.5)',
        autoFire: true,
        piercing: true,
        area: true,
        attackPattern: 'aura',
        range: 100,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, damage: 8, description: '+60% damage' },
            { level: 3, range: 120, description: '+20% range' },
            { level: 4, attackSpeed: 0.7, description: '+40% attack speed' },
            { level: 5, damage: 15, range: 150, description: 'Maximum power' }
        ]
    },
    {
        id: 'throwing_knife',
        name: 'Throwing Knife',
        description: 'Fast but weak projectiles',
        icon: '🔪',
        damage: 5,
        attackSpeed: 2,
        projectileSpeed: 12,
        projectileSize: 3,
        projectileColor: '#AAAAAA',
        autoFire: true,
        piercing: false,
        area: false,
        attackPattern: 'directional',
        range: 250,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, attackSpeed: 3, description: '+50% attack speed' },
            { level: 3, damage: 8, description: '+60% damage' },
            { level: 4, attackPattern: 'triple', description: 'Throw 3 knives at once' },
            { level: 5, attackSpeed: 4, piercing: true, description: 'Knives pierce enemies' }
        ]
    },
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'Explosive area damage',
        icon: '🔥',
        damage: 20,
        attackSpeed: 0.5,
        projectileSpeed: 5,
        projectileSize: 10,
        projectileColor: '#FF5722',
        autoFire: true,
        piercing: false,
        area: true,
        attackPattern: 'directional',
        range: 200,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, damage: 30, description: '+50% damage' },
            { level: 3, projectileSize: 15, description: '+50% explosion size' },
            { level: 4, attackSpeed: 0.7, description: '+40% attack speed' },
            { level: 5, piercing: true, damage: 45, description: 'Fireballs pierce and do more damage' }
        ]
    },
    {
        id: 'lightning',
        name: 'Lightning Strike',
        description: 'Chain lightning to nearby enemies',
        icon: '⚡',
        damage: 15,
        attackSpeed: 0.8,
        projectileSpeed: 20,
        projectileSize: 4,
        projectileColor: '#FFF176',
        autoFire: true,
        piercing: true,
        area: false,
        attackPattern: 'chain',
        range: 200,
        chainCount: 2,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, damage: 20, description: '+33% damage' },
            { level: 3, chainCount: 3, description: 'Chain to one more enemy' },
            { level: 4, attackSpeed: 1, description: '+25% attack speed' },
            { level: 5, chainCount: 5, damage: 30, description: 'Chain to 5 enemies with increased damage' }
        ]
    },
    {
        id: 'whip',
        name: 'Vine Whip',
        description: 'Attacks in front of you',
        icon: '🌿',
        damage: 12,
        attackSpeed: 1.2,
        projectileSpeed: 0,
        projectileSize: 70,
        projectileColor: '#4CAF50',
        autoFire: true,
        piercing: true,
        area: true,
        attackPattern: 'whip',
        range: 120,
        level: 1,
        maxLevel: 5,
        upgrades: [
            { level: 2, range: 140, description: '+20% range' },
            { level: 3, damage: 18, description: '+50% damage' },
            { level: 4, attackSpeed: 1.6, description: '+33% attack speed' },
            { level: 5, attackPattern: 'whip360', description: 'Whip attacks in all directions' }
        ]
    }
];

// Passive items
export const passiveItems: PassiveItemType[] = [
    {
        id: 'heart',
        name: 'Heart',
        description: '+20 Max HP',
        icon: '❤️'
    },
    {
        id: 'boots',
        name: 'Boots',
        description: '+15% Movement Speed',
        icon: '👢'
    },
    {
        id: 'glove',
        name: 'Power Glove',
        description: '+20% Damage',
        icon: '🧤'
    },
    {
        id: 'stopwatch',
        name: 'Stopwatch',
        description: '+15% Attack Speed',
        icon: '⏱️'
    },
    {
        id: 'magnet',
        name: 'Magnet',
        description: '+30% Pickup Range',
        icon: '🧲'
    },
    {
        id: 'clover',
        name: 'Lucky Clover',
        description: '+10% XP Gain',
        icon: '🍀'
    }
];

// Enemy types
export const enemyTypes: EnemyType[] = [
    {
        name: 'Zombie',
        health: 30,
        speed: 2,
        damage: 10,
        size: 20,
        color: '#4CAF50',
        experienceValue: 1,
        goldValue: 1
    },
    {
        name: 'Skeleton',
        health: 20,
        speed: 3,
        damage: 5,
        size: 18,
        color: '#BDBDBD',
        experienceValue: 1,
        goldValue: 1
    },
    {
        name: 'Bat',
        health: 10,
        speed: 4,
        damage: 3,
        size: 12,
        color: '#9C27B0',
        experienceValue: 1,
        goldValue: 1
    },
    {
        name: 'Ghost',
        health: 15,
        speed: 2.5,
        damage: 7,
        size: 22,
        color: 'rgba(200, 200, 255, 0.7)',
        experienceValue: 1,
        goldValue: 1
    },
    {
        name: 'Boss',
        health: 500,
        speed: 1.5,
        damage: 20,
        size: 50,
        color: '#F44336',
        experienceValue: 20,
        goldValue: 50
    }
];