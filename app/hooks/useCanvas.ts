import {useRef, useEffect} from 'react';

type DrawFunction = (ctx: CanvasRenderingContext2D, frameCount: number) => void;

export const useCanvas = (draw: DrawFunction, options = {}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameCountRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const resizeCanvas = () => {
            const {width, height} = canvas.getBoundingClientRect();
            if (canvas.width !== width || canvas.height !== height) {
                const {devicePixelRatio: ratio = 1} = window;
                canvas.width = width * ratio;
                canvas.height = height * ratio;
                context.scale(ratio, ratio);
            }
        };

        const render = () => {
            frameCountRef.current++;
            resizeCanvas();
            draw(context, frameCountRef.current);
            animationFrameRef.current = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [draw]);

    return canvasRef;
};