export interface Enemy {
    x: number;
    y: number;
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