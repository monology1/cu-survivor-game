import React, { useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameState } from '@/models/Game';

// Define notification types
interface Notification {
    id: string;
    text: string;
    type: 'level-up' | 'wave' | 'kill';
    position?: {
        x: number;
        y: number;
    };
    timeout: number;
}

const Notifications: React.FC = () => {
    const { state } = useGameContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [prevLevel, setPrevLevel] = useState(state.player.level);
    const [prevWave, setPrevWave] = useState(state.wave.current);
    const [prevKills, setPrevKills] = useState(state.player.kills);

    // Handle level up notifications
    useEffect(() => {
        if (state.player.level > prevLevel) {
            addNotification({
                id: `level-${state.player.level}`,
                text: `Level Up! Level ${state.player.level}`,
                type: 'level-up',
                timeout: 2000,
            });
            setPrevLevel(state.player.level);
        }
    }, [state.player.level, prevLevel]);

    // Handle wave notifications
    useEffect(() => {
        if (state.wave.current > prevWave) {
            addNotification({
                id: `wave-${state.wave.current}`,
                text: `Wave ${state.wave.current}`,
                type: 'wave',
                timeout: 3000,
            });
            setPrevWave(state.wave.current);
        }
    }, [state.wave.current, prevWave]);

    // Handle kill notifications
    useEffect(() => {
        if (state.player.kills > prevKills && state.gameState === GameState.PLAYING) {
            // Get the last killed enemy position (approximated)
            const enemyX = state.enemies.length > 0
                ? state.enemies[0].x
                : (Math.random() * 500) + 100;
            const enemyY = state.enemies.length > 0
                ? state.enemies[0].y
                : (Math.random() * 300) + 100;

            addNotification({
                id: `kill-${state.player.kills}`,
                text: '+1',
                type: 'kill',
                position: { x: enemyX, y: enemyY },
                timeout: 1000,
            });
            setPrevKills(state.player.kills);
        }
    }, [state.player.kills, prevKills, state.gameState, state.enemies]);

    // Add a new notification
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after timeout
        setTimeout(() => {
            setNotifications(prev =>
                prev.filter(item => item.id !== notification.id)
            );
        }, notification.timeout);
    };

    return (
        <>
            {/* Level up and wave notifications are centered */}
            {notifications.filter(n => n.type === 'level-up').map(notification => (
                <div
                    key={notification.id}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-800/80 border-2 border-purple-400 rounded-lg p-5 text-center level-up-notification pointer-events-none"
                >
                    {notification.text}
                </div>
            ))}

            {notifications.filter(n => n.type === 'wave').map(notification => (
                <div
                    key={notification.id}
                    className="absolute top-1/2 left-0 w-full text-center text-2xl text-yellow-400 text-shadow wave-notification pointer-events-none"
                    style={{ textShadow: '0 0 10px #000' }}
                >
                    {notification.text}
                </div>
            ))}

            {/* Kill notifications appear at enemy positions */}
            {notifications.filter(n => n.type === 'kill').map(notification => (
                notification.position && (
                    <div
                        key={notification.id}
                        className="absolute text-white font-bold kill-text pointer-events-none"
                        style={{
                            left: `${notification.position.x}px`,
                            top: `${notification.position.y}px`
                        }}
                    >
                        {notification.text}
                    </div>
                )
            ))}
        </>
    );
};

export default Notifications;