// components/ShopMenu.tsx
import { useEffect, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { ShopItem, WeaponType } from '@/types/game';
import { weaponTypes, passiveItems } from '@/game/entities';
import styles from '@/styles/Home.module.css';

const ShopMenu: React.FC = () => {
    const { gameState, dispatch } = useGameState();
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);

    // Generate shop items when menu opens
    useEffect(() => {
        generateShopItems();
    }, []);

    // Generate random items to sell in the shop
    const generateShopItems = () => {
        const items: ShopItem[] = [];
        const { wave, player } = gameState;

        // Add weapons (2 random weapons)
        for (let i = 0; i < 2; i++) {
            // Randomly select weapon
            const randomWeapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

            // Calculate price based on wave
            const price = 20 + wave.current * 5;

            items.push({
                id: `weapon_${randomWeapon.id}`,
                name: randomWeapon.name,
                description: randomWeapon.description,
                icon: randomWeapon.icon,
                price,
                type: 'weapon',
                itemId: randomWeapon.id
            });
        }

        // Add passive items (2 random items)
        for (let i = 0; i < 2; i++) {
            const randomItem = passiveItems[Math.floor(Math.random() * passiveItems.length)];

            // Calculate price based on wave
            const price = 15 + wave.current * 5;

            items.push({
                id: `passive_${randomItem.id}`,
                name: randomItem.name,
                description: randomItem.description,
                icon: randomItem.icon,
                price,
                type: 'passive',
                itemId: randomItem.id
            });
        }

        // Add health refill
        const healthPrice = 10 + wave.current * 2;
        items.push({
            id: 'health_refill',
            name: 'Health Refill',
            description: 'Restore 30 HP',
            icon: '❤️',
            price: healthPrice,
            type: 'health'
        });

        // Set shop items
        setShopItems(items);
    };

    // Handle purchase of an item
    const handlePurchase = (item: ShopItem) => {
        const { player } = gameState;

        // Check if player has enough gold
        if (player.gold < item.price) return;

        // Process purchase based on item type
        switch (item.type) {
            case 'weapon':
                if (item.itemId) {
                    const weapon = weaponTypes.find(w => w.id === item.itemId);
                    if (weapon) {
                        // Check if player already has this weapon
                        const existingWeapon = player.weapons.find(w => w.id === weapon.id);

                        if (existingWeapon) {
                            // Upgrade existing weapon if possible
                            if (existingWeapon.level < existingWeapon.maxLevel) {
                                dispatch({
                                    type: 'UPGRADE_WEAPON',
                                    payload: { weaponId: weapon.id }
                                });

                                // Deduct gold
                                dispatch({
                                    type: 'SPEND_GOLD',
                                    payload: { amount: item.price }
                                });
                            }
                        } else if (player.weapons.length < player.maxWeapons) {
                            // Add new weapon if there's room
                            dispatch({
                                type: 'ADD_WEAPON',
                                payload: { weapon }
                            });

                            // Deduct gold
                            dispatch({
                                type: 'SPEND_GOLD',
                                payload: { amount: item.price }
                            });
                        }
                    }
                }
                break;

            case 'passive':
                if (item.itemId) {
                    // Add passive item
                    dispatch({
                        type: 'ADD_PASSIVE_ITEM',
                        payload: { itemId: item.itemId }
                    });

                    // Deduct gold
                    dispatch({
                        type: 'SPEND_GOLD',
                        payload: { amount: item.price }
                    });
                }
                break;

            case 'health':
                // Restore health
                dispatch({
                    type: 'RESTORE_HEALTH',
                    payload: { amount: 30 }
                });

                // Deduct gold
                dispatch({
                    type: 'SPEND_GOLD',
                    payload: { amount: item.price }
                });
                break;
        }

        // Remove the item or replace it with a new one
        setShopItems(prevItems => prevItems.filter(i => i.id !== item.id));
    };

    // Close shop and continue to next wave
    const handleClose = () => {
        dispatch({ type: 'CLOSE_SHOP' });
    };

    return (
        <div className={styles.shopMenu}>
            <h2>Shop</h2>
            <div className={styles.goldDisplay}>Gold: {gameState.player.gold}</div>

            <div className={styles.shopItems}>
                {shopItems.map(item => (
                    <div
                        key={item.id}
                        className={`${styles.shopItem} ${gameState.player.gold < item.price ? styles.disabled : ''}`}
                        onClick={() => gameState.player.gold >= item.price && handlePurchase(item)}
                    >
                        <div className={styles.itemIcon}>{item.icon}</div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Price: {item.price} gold</p>
                    </div>
                ))}
            </div>

            <div className={styles.buttonContainer}>
                <button onClick={handleClose} className={styles.button}>
                    Continue to Next Wave
                </button>
            </div>
        </div>
    );
};

export default ShopMenu;