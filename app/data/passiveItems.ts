import { PassiveItem } from '@/models/PassiveItem';
import { Player } from '@/models/Player';

export const passiveItems: PassiveItem[] = [
    {
        id: 'heart',
        name: 'Heart',
        description: '+20 Max HP',
        icon: '❤️',
        effect: (player: Player): boolean => {
            player.maxHealth += 20;
            player.health += 20;
            return true;
        }
    },
    {
        id: 'boots',
        name: 'Boots',
        description: '+15% Movement Speed',
        icon: '👢',
        effect: (player: Player): boolean => {
            player.speed *= 1.15;
            return true;
        }
    },
    {
        id: 'glove',
        name: 'Power Glove',
        description: '+20% Damage',
        icon: '🧤',
        effect: (player: Player): boolean => {
            player.damage *= 1.2;
            return true;
        }
    },
    {
        id: 'stopwatch',
        name: 'Stopwatch',
        description: '+15% Attack Speed',
        icon: '⏱️',
        effect: (player: Player): boolean => {
            player.attackSpeed *= 1.15;
            return true;
        }
    },
    {
        id: 'magnet',
        name: 'Magnet',
        description: '+30% Pickup Range',
        icon: '🧲',
        effect: (player: Player): boolean => {
            player.pickupRange *= 1.3;
            return true;
        }
    },
    {
        id: 'clover',
        name: 'Lucky Clover',
        description: '+10% XP Gain',
        icon: '🍀',
        effect: (player: Player): boolean => {
            // This effect is handled when picking up XP
            return true;
        }
    }
];