import { Pickup, PickupType } from '@/models/Pickup';
import { Player } from '@/models/Player';
import { distance } from '@/utils/math';

export class PickupSystem {
    /**
     * Spawn a pickup at a specific position
     */
    static spawnPickup(x: number, y: number, type: PickupType, value: number): Pickup {
        let size: number, color: string;

        switch (type) {
            case 'experience':
                size = 10;
                color = '#9C27B0';
                break;
            case 'gold':
                size = 8;
                color = '#FFC107';
                break;
            case 'health':
                size = 12;
                color = '#F44336';
                break;
            default:
                size = 8;
                color = '#FFFFFF';
        }

        return {
            x,
            y,
            type,
            value,
            size,
            color
        };
    }

    /**
     * Handle pickup collection by the player
     */
    static handlePickupCollection(
        player: Player,
        pickups: Pickup[]
    ): {
        player: Player;
        collectedPickups: number[];
    } {
        const updatedPlayer = { ...player };
        const collectedPickups: number[] = [];
        const hasClover = player.passiveItems.some(item => item.id === 'clover');

        for (let i = 0; i < pickups.length; i++) {
            const pickup = pickups[i];
            const dist = distance(player.x, player.y, pickup.x, pickup.y);

            // Check collision with player
            if (dist <= player.size / 2) {
                // Apply pickup effect
                if (pickup.type === 'experience') {
                    let value = pickup.value;

                    // Lucky Clover gives +10% XP
                    if (hasClover) {
                        value *= 1.1;
                    }

                    updatedPlayer.experience += value;
                } else if (pickup.type === 'gold') {
                    updatedPlayer.gold += pickup.value;
                } else if (pickup.type === 'health') {
                    updatedPlayer.health = Math.min(
                        updatedPlayer.health + pickup.value,
                        updatedPlayer.maxHealth
                    );
                }

                // Mark pickup for collection
                collectedPickups.push(i);
            }
        }

        return { player: updatedPlayer, collectedPickups };
    }
}