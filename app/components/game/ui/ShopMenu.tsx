import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { weaponTypes } from '@/data/weapons';
import { passiveItems } from '@/data/passiveItems';
import Button from '@/components/common/Button';

const ShopMenu = () => {
    const { state, dispatch } = useGameContext();
    const { player, gameState } = state;

    const handleCloseShop = () => {
        dispatch({ type: 'CLOSE_SHOP' });
    };

    const generateShopItems = () => {
        const items = [];

        // Add weapons
        for (let i = 0; i < 2; i++) {
            const weapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
            if (weapon) {
                const price = 20 + state.wave.current * 5;
                items.push({
                    name: weapon.name,
                    description: weapon.description,
                    icon: weapon.icon,
                    price,
                    onClick: () => {
                        if (player.gold >= price) {
                            dispatch({ type: 'UPDATE_PLAYER', payload: { gold: player.gold - price } });
                            dispatch({ type: 'GIVE_WEAPON', payload: weapon });
                        }
                    }
                });
            }
        }

        // Add passive items
        for (let i = 0; i < 2; i++) {
            const item = passiveItems[Math.floor(Math.random() * passiveItems.length)];
            if (item) {
                const price = 15 + state.wave.current * 5;
                items.push({
                    name: item.name,
                    description: item.description,
                    icon: item.icon,
                    price,
                    onClick: () => {
                        if (player.gold >= price) {
                            dispatch({ type: 'UPDATE_PLAYER', payload: { gold: player.gold - price } });
                            dispatch({ type: 'GIVE_PASSIVE_ITEM', payload: item });
                        }
                    }
                });
            }
        }

        // Add health refill
        const healthPrice = 10 + state.wave.current * 2;
        items.push({
            name: 'Health Refill',
            description: 'Restore 30 HP',
            icon: '❤️',
            price: healthPrice,
            onClick: () => {
                if (player.gold >= healthPrice) {
                    dispatch({
                        type: 'UPDATE_PLAYER',
                        payload: {
                            gold: player.gold - healthPrice,
                            health: Math.min(player.health + 30, player.maxHealth)
                        }
                    });
                }
            }
        });

        return items;
    };

    const shopItems = generateShopItems();

    if (gameState !== 'SHOPPING') {
        return null;
    }

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-gray-600 rounded-lg p-5 w-4/5 max-w-3xl max-h-4/5 overflow-y-auto">
            <h2 className="text-xl font-bold text-center text-yellow-400 mb-3">Shop</h2>
            <div>Gold: <span>{player.gold}</span></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                {shopItems.map((item, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border-2 border-gray-600 rounded p-4 cursor-pointer hover:bg-gray-700 hover:border-gray-500 transition-colors text-center"
                        onClick={item.onClick}
                    >
                        <div className="text-3xl my-2">{item.icon}</div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm my-1">{item.description}</p>
                        <p className="text-yellow-400">Price: {item.price} gold</p>
                    </div>
                ))}
            </div>

            <div className="text-center mt-5">
                <Button onClick={handleCloseShop}>Continue to Next Wave</Button>
            </div>
        </div>
    );
};

export default ShopMenu;