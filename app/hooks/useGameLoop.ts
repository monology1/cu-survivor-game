import {useGameContext} from "@/context/GameStateContext";
import {useEffect, useRef} from "react";
import {GameState} from "@/models/Game";

export const useGameLoop = () => {
    const { state, dispatch } = useGameContext();
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        const gameLoop = (timestamp: number) => {
            // Skip if game is not running
            if (!state.gameRunning) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
                return;
            }

            // Calculate delta time
            if (!lastTimeRef.current) {
                lastTimeRef.current = timestamp;
            }
            const deltaTime = (timestamp - lastTimeRef.current) / 1000; // convert to seconds
            lastTimeRef.current = timestamp;

            // Limit delta time to avoid physics issues on slow frames
            const cappedDeltaTime = Math.min(deltaTime, 0.2);

            // Update game state
            if (state.gameState === GameState.PLAYING) {
                dispatch({ type: 'UPDATE_GAME', payload: { deltaTime: cappedDeltaTime } });
            }

            // Continue loop
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        // Start game loop
        animationFrameRef.current = requestAnimationFrame(gameLoop);

        // Cleanup function
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [state.gameRunning, state.gameState, dispatch]);
};