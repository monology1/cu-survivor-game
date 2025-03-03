import React from 'react';
import { useGameContext } from '@/context/GameContext';

const HealthBar = () => {
    const { state } = useGameContext();
    const { player } = state;

    const healthPercentage = (player.health / player.maxHealth) * 100;

    return (
        <div className="h-5 w-52 bg-gray-800 rounded-full overflow-hidden mb-1">
            <div
                className="h-full bg-green-500 transition-all duration-200"
                style={{ width: `${healthPercentage}%` }}
            />
        </div>
    );
};

export default HealthBar;