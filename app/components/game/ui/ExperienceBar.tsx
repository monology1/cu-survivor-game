import React from 'react';
import { useGameContext } from '@/context/GameContext';

const ExperienceBar = () => {
    const { state } = useGameContext();
    const { player } = state;

    const expPercentage = (player.experience / player.experienceToLevel) * 100;

    return (
        <div className="h-2.5 w-52 bg-gray-800 rounded-md overflow-hidden mb-2">
            <div
                className="h-full bg-purple-600 transition-all duration-200"
                style={{ width: `${expPercentage}%` }}
            />
        </div>
    );
};

export default ExperienceBar;