import React from 'react';
import { useGameContext } from '@/context/GameContext';

const PassiveItems = () => {
    const { state } = useGameContext();
    const { player } = state;

    return (
        <div className="absolute right-3 bottom-16 flex flex-col gap-1">
            {player.passiveItems.map((item, index) => (
                <div
                    key={index}
                    className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-base"
                    title={item.name}
                >
                    {item.icon}
                </div>
            ))}
        </div>
    );
};

export default PassiveItems;