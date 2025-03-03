import { Player } from './Player';

export interface PassiveItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    effect: (player: Player) => boolean;
}