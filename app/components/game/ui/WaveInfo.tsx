import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { formatTime } from '@/utils/rendering';

const WaveInfo = () => {
    const { state } = useGameContext();
    const { wave, enemies, player, gameTime } = state;

    return (
        <div className="absolute top-3 right-3 bg-black/70 p-3 rounded-md text-right">
            <div>Wave: <span>{wave.current}</span></div>
            <div>Time: <span>{formatTime(gameTime)}</span></div>
            <div>Enemies: <span>{enemies.length}</span></div>
            <div>Kills: <span>{player.kills}</span></div>
        </div>
    );
};

export default WaveInfo;