import {Enemy} from "@/app/models/Enemy";

export interface Projectile {
    x: number;
    y: number;
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
    chainTargets?: Enemy[];
    chainCount?: number;
    firstTarget?: Enemy;
}
