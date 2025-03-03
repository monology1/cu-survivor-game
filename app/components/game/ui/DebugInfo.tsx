import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameState } from '@/models/Game';

const DebugInfo = () => {
    const { state, dispatch } = useGameContext();
    const [showDebug, setShowDebug] = useState(true);

    const toggleDebug = () => {
        setShowDebug(!showDebug);
    };

    const fixGameState = () => {
        // Force reset the game state
        dispatch({
            type: 'RESTART_GAME'
        });

        // Then ensure we're in PLAYING state with gameRunning true
        setTimeout(() => {
            dispatch({
                type: 'START_GAME'
            });
            console.log('Game state forcibly reset');
            console.log('Game state should now be PLAYING');
            console.log('Game running should now be true');
        }, 100);
    };

    const startWave = () => {
        // Force the wave to start if needed
        dispatch({ type: 'START_WAVE' });
        console.log('Manually triggered START_WAVE');
    };

    const spawnEnemy = () => {
        if (!state.gameRunning) {
            console.log('Game not running, fixing state before spawning enemy');
            dispatch({ type: 'START_GAME' });
        }

        setTimeout(() => {
            // Create a test enemy near the player
            const testEnemy = {
                x: state.player.x + 100,
                y: state.player.y - 100,
                health: 30,
                maxHealth: 30,
                speed: 2,
                damage: 10,
                size: 20,
                color: '#4CAF50',
                experienceValue: 1,
                goldValue: 1,
                name: 'Test Enemy'
            };

            dispatch({ type: 'ADD_ENEMY', payload: testEnemy });
            console.log('Manually spawned test enemy at', { x: testEnemy.x, y: testEnemy.y });
        }, 100);
    };

    const spawnMultipleEnemies = () => {
        if (!state.gameRunning) {
            console.log('Game not running, fixing state before spawning enemies');
            dispatch({ type: 'START_GAME' });
        }

        setTimeout(() => {
            // Spawn 5 enemies in different positions around the player
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const distance = 150;
                const x = state.player.x + Math.cos(angle) * distance;
                const y = state.player.y + Math.sin(angle) * distance;

                const testEnemy = {
                    x,
                    y,
                    health: 30,
                    maxHealth: 30,
                    speed: 2,
                    damage: 10,
                    size: 20,
                    color: '#E91E63',
                    experienceValue: 1,
                    goldValue: 1,
                    name: 'Test Enemy'
                };

                dispatch({ type: 'ADD_ENEMY', payload: testEnemy });
            }

            console.log('Spawned 5 enemies around the player');
        }, 100);
    };

    if (!showDebug) {
        return (
            <button
                onClick={toggleDebug}
                className="absolute right-3 top-3 bg-blue-600 text-white p-1 rounded-md z-50"
            >
                Debug
            </button>
        );
    }

    return (
        <div className="absolute right-3 top-3 bg-black/80 p-3 rounded-md z-50 text-white text-sm font-mono max-w-xs overflow-auto max-h-screen">
            <div className="flex justify-between mb-2">
                <h3 className="font-bold">Debug Info</h3>
                <button onClick={toggleDebug} className="text-gray-400 hover:text-white">×</button>
            </div>

            <div className="space-y-1">
                <div>Game State: <span className={state.gameState === 'PLAYING' ? 'text-green-400' : 'text-yellow-400'}>
          {state.gameState}
        </span></div>
                <div>Running: <span className={state.gameRunning ? 'text-green-400' : 'text-red-400'}>
          {state.gameRunning ? 'Yes' : 'No'}
        </span></div>
                <div>FPS: <span className="text-blue-400">27</span></div>
                <div>Player: <span className="text-green-400">
          ({Math.round(state.player.x)}, {Math.round(state.player.y)})
        </span></div>
                <div>Enemies: <span className={state.enemies.length > 0 ? 'text-red-400' : 'text-gray-400'}>
          {state.enemies.length}
        </span></div>
                <div>Wave: <span className="text-purple-400">
          {state.wave.current} {state.wave.active ? '(Active)' : '(Inactive)'}
        </span></div>
                <div>Canvas: <span className="text-blue-400">
          2048×1996
        </span></div>
                <div>Keys pressed: <span className="text-yellow-400">
          Meta, Shift
        </span></div>
            </div>

            <div className="mt-3 space-y-2">
                <button
                    onClick={fixGameState}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md"
                >
                    Fix Game State
                </button>

                <button
                    onClick={startWave}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-md"
                >
                    Start Wave
                </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                    onClick={spawnEnemy}
                    className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md"
                >
                    Spawn Enemy
                </button>

                <button
                    onClick={spawnMultipleEnemies}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md"
                >
                    Spawn 5 Enemies
                </button>
            </div>

            <div className="mt-3">
                <h4 className="font-bold mb-1">Manual Movement</h4>
                <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <button
                        onClick={() => dispatch({ type: 'UPDATE_PLAYER', payload: { y: state.player.y - 30 } })}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                    >
                        ↑
                    </button>
                    <div></div>

                    <button
                        onClick={() => dispatch({ type: 'UPDATE_PLAYER', payload: { x: state.player.x - 30 } })}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                    >
                        ←
                    </button>
                    <div></div>
                    <button
                        onClick={() => dispatch({ type: 'UPDATE_PLAYER', payload: { x: state.player.x + 30 } })}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                    >
                        →
                    </button>

                    <div></div>
                    <button
                        onClick={() => dispatch({ type: 'UPDATE_PLAYER', payload: { y: state.player.y + 30 } })}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                    >
                        ↓
                    </button>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default DebugInfo;