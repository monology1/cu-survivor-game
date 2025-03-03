import React from 'react';
import { useGameContext } from '@/context/GameContext';

const WeaponsDisplay = () => {
    const { state } = useGameContext();
    const { player } = state;

    return (
        <div className="absolute bottom-3 left-3 bg-black/70 p-3 rounded-md flex gap-2">
            {Array.from({ length: player.maxWeapons }).map((_, index) => {
                const weapon = player.weapons[index];
                return (
                    <div
                        key={index}
                        className={`w-10 h-10 bg-gray-800 border rounded-md flex items-center justify-center text-xl
              ${weapon ? 'border-yellow-400 shadow-sm shadow-yellow-400' : 'border-gray-600'}`}
                        title={weapon ? `${weapon.name} (Level ${weapon.level})` : ''}
                    >
                        {weapon?.icon}
                    </div>
                );
            })}
        </div>
    );
};

export default WeaponsDisplay;