export interface WeaponUpgrade {
    level: number;
    damage?: number;
    attackSpeed?: number;
    projectileSpeed?: number;
    projectileSize?: number;
    range?: number;
    piercing?: boolean;
    area?: boolean;
    attackPattern?: string;
    chainCount?: number;
    description: string;
}

export interface Weapon {
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
    attackPattern: string;
    range: number;
    level: number;
    maxLevel: number;
    cooldown?: number;
    chainCount?: number;
    upgrades: WeaponUpgrade[];
}