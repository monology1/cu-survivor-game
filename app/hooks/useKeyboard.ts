import {useEffect, useState} from 'react';

interface KeyState {
    [key: string]: boolean;
}

export const useKeyboard = () => {
    const [keys, setKeys] = useState<KeyState>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setKeys(prevKeys => ({...prevKeys, [e.key.toLowerCase()]: true}));
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            setKeys(prevKeys => ({...prevKeys, [e.key.toLowerCase()]: false}));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keys;
};