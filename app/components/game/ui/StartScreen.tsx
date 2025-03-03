import React from 'react';
import { useGameContext } from '@/context/GameContext';
import Button from '@/components/common/Button';

const StartScreen = () => {
    const { state, dispatch } = useGameContext();

    const handleStart = () => {
        console.log('Start button clicked');
        dispatch({ type: 'START_GAME' });
        console.log('Game state after dispatch:', state.gameState);
    };

    if (state.gameState !== 'MENU') {
        return null;
    }

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-gray-600 rounded-lg p-5 w-4/5 max-w-xl text-center pointer-events-auto">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Potato Vampire Survivors</h1>
            <p className="mb-2">Survive waves of enemies, collect gold, and upgrade your potato hero!</p>
            <p className="mb-2">Use WASD or arrow keys to move. Your weapons attack automatically.</p>
            <p className="mb-2">Collect experience to level up and choose new weapons or upgrades.</p>
            <p className="mb-2">Survive waves to earn gold and shop for permanent upgrades!</p>
            <Button onClick={handleStart} className="mt-5">Start Game</Button>
        </div>
    );
};

export default StartScreen;