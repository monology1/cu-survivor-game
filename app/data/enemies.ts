import { EnemyType } from '@/models/Enemy';

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