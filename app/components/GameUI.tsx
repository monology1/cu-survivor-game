import { useEffect, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import styles from '@/styles/Home.module.css';

const GameUI: React.FC = () => {
    const { gameState } = useGameState();
    const { player, wave, gameTime } = gameState;

    // State for display elements
    const [notifications, setNotifications] = useState<Array<{id: number, text: string, type: string}>>([]);
    const [notificationId, setNotificationId] = useState(0);

    // Format time (minutes:seconds)
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate health percentage
    const healthPercentage = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));

    // Calculate exp percentage
    const expPercentage = Math.max(0, Math.min(100, (player.experience / player.experienceToLevel) * 100));

    // Determine health bar color based on health percentage
    const getHealthBarColor = (): string => {
        if (healthPercentage > 60) return '#4caf50'; // Green
        if (healthPercentage > 30) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    // Show wave notification when wave changes
    useEffect(() => {
        if (wave.active) {
            const newId = notificationId + 1;
            setNotificationId(newId);

            setNotifications(prev => [
                ...prev,
                { id: newId, text: `Wave ${wave.current}`, type: 'wave' }
            ]);

            // Remove notification after animation
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newId));
            }, 3000);
        }
    }, [wave.active, wave.current]);

    // Create weapon slots display
    const renderWeaponSlots = () => {
        const slots = [];

        for (let i = 0; i < player.maxWeapons; i++) {
            const weapon = player.weapons[i];
            slots.push(
                <div
                    key={i}
                    className={`${styles.weaponSlot} ${weapon ? styles.active : ''}`}
                    title={weapon ? `${weapon.name} (Level ${weapon.level})` : 'Empty Slot'}
                >
                    {weapon ? weapon.icon : ''}
                </div>
            );
        }

        return slots;
    };

    // Create passive items display
    const renderPassiveItems = () => {
        return player.passiveItems.map((item, index) => (
            <div
                key={index}
                className={styles.passiveItem}
                title={item.name}
            >
                {item.icon}
            </div>
        ));
    };

    return (
        <div className={styles.gameUI}>
            {/* Stats display */}
            <div className={styles.stats}>
                <div className={styles.healthBar}>
                    <div
                        className={styles.healthFill}
                        style={{
                            width: `${healthPercentage}%`,
                            backgroundColor: getHealthBarColor()
                        }}
                    />
                </div>

                <div className={styles.expBar}>
                    <div
                        className={styles.expFill}
                        style={{ width: `${expPercentage}%` }}
                    />
                </div>

                <div>HP: {Math.floor(player.health)}/{player.maxHealth}</div>
                <div>Level: {player.level}</div>
                <div>Speed: {player.speed.toFixed(1)}</div>
                <div>Damage: {player.damage.toFixed(1)}</div>
                <div>Pickup Range: {player.pickupRange.toFixed(0)}</div>
            </div>

            {/* Wave info */}
            <div className={styles.waveInfo}>
                <div>Wave: {wave.current}</div>
                <div>Time: {formatTime(gameTime)}</div>
                <div>Enemies: {gameState.enemies.length}</div>
                <div>Kills: {player.kills}</div>
            </div>

            {/* Gold display */}
            <div className={styles.goldDisplay}>
                Gold: {player.gold}
            </div>

            {/* Weapons display */}
            <div className={styles.weaponsDisplay}>
                {renderWeaponSlots()}
            </div>

            {/* Passive items display */}
            <div className={styles.passiveItems}>
                {renderPassiveItems()}
            </div>

            {/* Notifications */}
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={
                        notification.type === 'wave'
                            ? styles.waveNotification
                            : styles.levelUpNotification
                    }
                >
                    {notification.text}
                </div>
            ))}
        </div>
    );
};

export default GameUI;