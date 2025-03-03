import { Weapon } from './Weapon';
import { PassiveItem } from './PassiveItem';

export interface Player {
    x: number;
    y: number;
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