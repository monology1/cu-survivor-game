import React from 'react';
import { useGameContext } from '@/context/GameContext';
import HealthBar from './HealthBar';
import ExperienceBar from './ExperienceBar';

const StatsDisplay = () => {
    const { state } = useGameContext();
    const { player } = state;

    return (
        <div className="absolute top-3 left-3 bg-black/70 p-3 rounded-md">
            <HealthBar />
            <ExperienceBar />
            <div>HP: <span>{Math.floor(player.health)}/{player.maxHealth}</span></div>
            <div>Level: <span>{player.level}</span></div>
            <div>Speed: <span>{player.speed.toFixed(1)}</span></div>
            <div>Damage: <span>{player.damage.toFixed(1)}</span></div>
            <div>Pickup Range: <span>{player.pickupRange.toFixed(0)}</span></div>
        </div>
    );
};

export default StatsDisplay;
