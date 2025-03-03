import React from 'react';
import { useGameContext } from '@/context/GameContext';
import Button from '@/components/common/Button';

const GameOverScreen = () => {
    const { state, dispatch } = useGameContext();
    const { player, wave, gameState } = state;

    const handleRestart = () => {
        dispatch({ type: 'RESTART_GAME' });
    };

    if (gameState !== 'GAME_OVER') {
        return null;
    }

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-gray-600 rounded-lg p-5 w-4/5 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <p>You survived <span className="font-bold">{wave.current}</span> waves</p>
            <p>Level reached: <span className="font-bold">{player.level}</span></p>
            <p>Total kills: <span className="font-bold">{player.kills}</span></p>
            <p>Gold collected: <span className="font-bold text-yellow-400">{player.gold}</span></p>
            <Button onClick={handleRestart} className="mt-5">Play Again</Button>
        </div>
    );
};

export default GameOverScreen;