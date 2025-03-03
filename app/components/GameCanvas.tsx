"use client"
import {useRef, useEffect, useState, useCallback} from 'react';
import {useGameState} from '@/context/GameStateContext';
import {drawGame, updateGame} from '@/game/engine';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number>(0);
    const {gameState, dispatch} = useGameState();

    // Track FPS for debugging
    const [fps, setFps] = useState<number>(0);
    const fpsCountRef = useRef<number>(0);
    const lastFpsUpdateRef = useRef<number>(0);

    // Handle canvas resizing
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        const maxWidth = 1200;
        const maxHeight = 800;

        const width = Math.min(container.clientWidth, maxWidth);
        const height = Math.min(container.clientHeight, maxHeight);

        // Only resize if dimensions actually changed
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;

            // If player is initialized, ensure they're in bounds after resize
            if (gameState.gameRunning && gameState.player) {
                const margin = 20;
                const x = Math.max(margin, Math.min(width - margin, gameState.player.x));
                const y = Math.max(margin, Math.min(height - margin, gameState.player.y));

                if (x !== gameState.player.x || y !== gameState.player.y) {
                    dispatch({
                        type: 'UPDATE_PLAYER_POSITION',
                        payload: {x, y}
                    });
                }
            }
        }
    }, [gameState.gameRunning, gameState.player, dispatch]);

    // Game loop with fixed time step for more consistent updates
    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current) return;

        // Initialize previousTime on first frame
        if (previousTimeRef.current === 0) {
            previousTimeRef.current = timestamp;
            lastFpsUpdateRef.current = timestamp;
        }

        const deltaTime = (timestamp - previousTimeRef.current) / 1000;
        previousTimeRef.current = timestamp;

        // FPS calculation
        fpsCountRef.current++;
        if (timestamp - lastFpsUpdateRef.current >= 1000) {
            setFps(fpsCountRef.current);
            fpsCountRef.current = 0;
            lastFpsUpdateRef.current = timestamp;
        }

        // Get canvas and context
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Clear the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Cap delta time to avoid physics issues during lag spikes
        const cappedDeltaTime = Math.min(deltaTime, 0.1);

        // Only update game state if playing
        if (gameState.currentState === 'PLAYING') {
            updateGame(gameState, dispatch, cappedDeltaTime, canvas.width, canvas.height);
        }

        // Always render
        drawGame(context, gameState, canvas.width, canvas.height);

        // Schedule next frame
        animationRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, dispatch]);

    // Set up game loop
    useEffect(() => {
        handleResize();

        // Start animation loop if game is running
        if (gameState.gameRunning) {
            // Reset animation refs
            previousTimeRef.current = 0;

            // Start the loop
            animationRef.current = requestAnimationFrame(gameLoop);
        } else if (animationRef.current) {
            // Cancel animation if game is not running
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [gameState.gameRunning, gameLoop, handleResize]);

    // Handle window resize
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    background: '#222',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block'
                }}
            />
            {/* Uncomment for FPS counter during development */}
            <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 5px',
                fontSize: '12px',
                borderRadius: '3px'
            }}>
                FPS: {fps}
            </div>
        </>
    );
};

export default GameCanvas;