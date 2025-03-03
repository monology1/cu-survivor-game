export type PickupType = 'experience' | 'gold' | 'health';

export interface Pickup {
    x: number;
    y: number;
    type: PickupType;
    value: number;
    size: number;
    color: string;
}