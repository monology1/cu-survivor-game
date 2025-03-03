import React from 'react';
import { useGameContext } from '@/context/GameContext';

const GoldDisplay = () => {
    const { state } = useGameContext();
    const { player } = state;

    return (
        <div className="absolute bottom-3 right-3 bg-black/70 p-2 rounded-md text-yellow-400">
            Gold: <span>{player.gold}</span>
        </div>
    );
};

export default GoldDisplay;