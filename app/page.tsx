"use client"
import {useEffect} from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import {GameStateProvider, useGameState} from '@/context/GameStateContext';
import styles from '@/styles/Home.module.css';

// Use dynamic import with no SSR to avoid canvas issues
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {ssr: false});
const GameUI = dynamic(() => import('@/components/GameUI'), {ssr: false});
const UpgradeMenu = dynamic(() => import('@/components/UpgradeMenu'), {ssr: false});
const ShopMenu = dynamic(() => import('@/components/ShopMenu'), {ssr: false});

const Game: React.FC = () => {
    const {gameState, dispatch} = useGameState();

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            dispatch({type: 'KEY_DOWN', payload: {key: e.key.toLowerCase()}});
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            dispatch({type: 'KEY_UP', payload: {key: e.key.toLowerCase()}});
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [dispatch]);

    return (
        <div className={styles.gameContainer}>
            <GameCanvas/>
            <GameUI/>

            {gameState.currentState === 'UPGRADING' && <UpgradeMenu/>}
            {gameState.currentState === 'SHOPPING' && <ShopMenu/>}

            {gameState.currentState === 'MENU' && (
                <div className={styles.startScreen}>
                    <h1>Potato Vampire Survivors</h1>
                    <p>Survive waves of enemies, collect gold, and upgrade your potato hero!</p>
                    <p>Use WASD or arrow keys to move. Your weapons attack automatically.</p>
                    <button
                        onClick={() => {
                            // Get window dimensions for player starting position
                            if (typeof window !== 'undefined') {
                                const width = Math.min(window.innerWidth, 1200);
                                const height = Math.min(window.innerHeight, 800);
                                dispatch({type: 'START_GAME', payload: {width, height}});
                            }
                        }}
                        className={styles.button}
                    >
                        Start Game
                    </button>
                </div>
            )}

            {gameState.currentState === 'GAME_OVER' && (
                <div className={styles.gameOver}>
                    <h2>GAME OVER</h2>
                    <p>You survived {gameState.wave.current} waves</p>
                    <p>Level reached: {gameState.player.level}</p>
                    <p>Kills: {gameState.player.kills}</p>
                    <p>Gold collected: {gameState.player.gold}</p>
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                const width = Math.min(window.innerWidth, 1200);
                                const height = Math.min(window.innerHeight, 800);
                                dispatch({type: 'START_GAME', payload: {width, height}});
                            }
                        }}
                        className={styles.button}
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

const HomePage: React.FC = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Potato Vampire Survivors</title>
                <meta name="description" content="Survive waves of enemies in this action roguelike game"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <GameStateProvider>
                <Game/>
            </GameStateProvider>
        </div>
    );
};

export default HomePage;