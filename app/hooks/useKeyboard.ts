import { useEffect, useState, useRef } from 'react';

interface KeyState {
    [key: string]: boolean;
}

/**
 * Enhanced keyboard hook with debugging and direct DOM event access
 */
export const useKeyboard = () => {
    const [keys, setKeys] = useState<KeyState>({});
    const keysRef = useRef<KeyState>({});

    useEffect(() => {

        // Use direct DOM event handlers for better reliability
        const handleKeyDown = (e: KeyboardEvent) => {
            // Common key mappings
            const keyMap: Record<string, string> = {
                'arrowup': 'up',
                'arrowdown': 'down',
                'arrowleft': 'left',
                'arrowright': 'right'
            };

            const key = e.key.toLowerCase();

            // Set in both the ref (for immediate game loop access) and state (for re-renders)
            keysRef.current[key] = true;
            if (keyMap[key]) keysRef.current[keyMap[key]] = true;

            setKeys(prev => {
                const newKeys = { ...prev, [key]: true };
                if (keyMap[key]) newKeys[keyMap[key]] = true;
                return newKeys;
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const keyMap: Record<string, string> = {
                'arrowup': 'up',
                'arrowdown': 'down',
                'arrowleft': 'left',
                'arrowright': 'right'
            };

            const key = e.key.toLowerCase();

            // Remove from both ref and state
            delete keysRef.current[key];
            if (keyMap[key]) delete keysRef.current[keyMap[key]];

            setKeys(prev => {
                const newKeys = { ...prev };
                delete newKeys[key];
                if (keyMap[key]) delete newKeys[keyMap[key]];
                return newKeys;
            });
        };

        // Add the event listeners to window, document and body for maximum coverage
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.body.addEventListener('keydown', handleKeyDown);
        document.body.addEventListener('keyup', handleKeyUp);

        // Set tabindex on body so it can receive keyboard events
        document.body.setAttribute('tabindex', '0');
        document.body.focus();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.body.removeEventListener('keydown', handleKeyDown);
            document.body.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return { keys, keysRef };
};