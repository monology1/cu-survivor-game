import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { LevelSystem } from '@/systems/LevelSystem';

const UpgradeMenu = () => {
    const { state, dispatch } = useGameContext();
    const { player, gameState } = state;

    const handleSelectUpgrade = (callback: () => void) => {
        callback();
        dispatch({ type: 'CLOSE_UPGRADE_MENU' });
    };

    const generateUpgradeOptions = () => {
        const options = [];

        // Option 1: New weapon (if player has space)
        if (player.weapons.length < player.maxWeapons) {
            const availableWeapons = LevelSystem.getAvailableWeapons(player);

            if (availableWeapons.length > 0) {
                const weapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
                options.push({
                    name: `New: ${weapon.name}`,
                    description: weapon.description,
                    icon: weapon.icon,
                    onClick: () => {
                        dispatch({ type: 'GIVE_WEAPON', payload: weapon });
                    }
                });
            }
        }

        // Option 2: Upgrade existing weapon
        const upgradableWeapons = LevelSystem.getUpgradableWeapons(player);

        if (upgradableWeapons.length > 0) {
            const weapon = upgradableWeapons[Math.floor(Math.random() * upgradableWeapons.length)];
            const nextLevel = weapon.upgrades.find(u => u.level === weapon.level + 1);

            if (nextLevel) {
                options.push({
                    name: `Upgrade: ${weapon.name}`,
                    description: nextLevel.description,
                    icon: weapon.icon,
                    onClick: () => {
                        dispatch({ type: 'UPGRADE_WEAPON', payload: { weaponId: weapon.id } });
                    }
                });
            }
        }

        // Option 3: Passive item
        const item = LevelSystem.getRandomPassiveItem();
        options.push({
            name: item.name,
            description: item.description,
            icon: item.icon,
            onClick: () => {
                dispatch({ type: 'GIVE_PASSIVE_ITEM', payload: item });
            }
        });

        return options;
    };

    const upgradeOptions = generateUpgradeOptions();

    if (gameState !== 'UPGRADING') {
        return null;
    }

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-gray-600 rounded-lg p-5 w-4/5 max-w-3xl">
            <h2 className="text-xl font-bold text-center text-purple-400 mb-3">Level Up!</h2>
            <p className="text-center mb-4">Choose an upgrade:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {upgradeOptions.map((option, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border-2 border-gray-600 rounded p-4 cursor-pointer hover:bg-gray-700 hover:border-gray-500 transition-colors text-center"
                        onClick={() => handleSelectUpgrade(option.onClick)}
                    >
                        <div className="text-3xl my-2">{option.icon}</div>
                        <h3 className="font-bold">{option.name}</h3>
                        <p className="text-sm my-1">{option.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpgradeMenu;