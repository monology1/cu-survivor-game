import { useEffect, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { UpgradeOption, WeaponType, PassiveItemType } from '@/types/game';
import { weaponTypes, passiveItems } from '@/game/entities';
import styles from '@/styles/Home.module.css';

const UpgradeMenu: React.FC = () => {
    const { gameState, dispatch } = useGameState();
    const [options, setOptions] = useState<UpgradeOption[]>([]);

    // Generate upgrade options when menu opens
    useEffect(() => {
        generateUpgradeOptions();
    }, []);

    // Generate random upgrade options for player to choose from
    const generateUpgradeOptions = () => {
        const upgradeOptions: UpgradeOption[] = [];
        const maxOptions = 3;

        // Option 1: New weapon (if player has space)
        if (gameState.player.weapons.length < gameState.player.maxWeapons) {
            // Get weapons player doesn't have
            const availableWeapons = weaponTypes.filter(
                weapon => !gameState.player.weapons.some(w => w.id === weapon.id)
            );

            if (availableWeapons.length > 0) {
                // Randomly select one available weapon
                const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];

                upgradeOptions.push({
                    id: `weapon_${randomWeapon.id}`,
                    name: `New: ${randomWeapon.name}`,
                    description: randomWeapon.description,
                    icon: randomWeapon.icon,
                    type: 'weapon',
                    itemId: randomWeapon.id
                });
            }
        }

        // Option 2: Upgrade existing weapon
        const upgradableWeapons = gameState.player.weapons.filter(
            weapon => weapon.level < weapon.maxLevel
        );

        if (upgradableWeapons.length > 0) {
            // Randomly select one upgradable weapon
            const weaponToUpgrade = upgradableWeapons[Math.floor(Math.random() * upgradableWeapons.length)];
            const nextLevelUpgrade = weaponToUpgrade.upgrades.find(u => u.level === weaponToUpgrade.level + 1);

            if (nextLevelUpgrade) {
                upgradeOptions.push({
                    id: `upgrade_${weaponToUpgrade.id}`,
                    name: `Upgrade: ${weaponToUpgrade.name}`,
                    description: nextLevelUpgrade.description,
                    icon: weaponToUpgrade.icon,
                    type: 'weaponUpgrade',
                    weaponId: weaponToUpgrade.id
                });
            }
        }

        // Option 3: Passive item
        // Ensure we have at least one more slot available for options
        while (upgradeOptions.length < maxOptions) {
            // Randomly select passive item
            const randomItem = passiveItems[Math.floor(Math.random() * passiveItems.length)];

            // Check if we already added this item to options
            if (!upgradeOptions.some(opt => opt.type === 'passive' && opt.itemId === randomItem.id)) {
                upgradeOptions.push({
                    id: `passive_${randomItem.id}`,
                    name: randomItem.name,
                    description: randomItem.description,
                    icon: randomItem.icon,
                    type: 'passive',
                    itemId: randomItem.id
                });

                // Break if we have enough options
                if (upgradeOptions.length >= maxOptions) break;
            }
        }

        // Set the options
        setOptions(upgradeOptions);
    };

    // Handle selection of an upgrade option
    const handleSelectUpgrade = (option: UpgradeOption) => {
        switch (option.type) {
            case 'weapon':
                if (option.itemId) {
                    const weapon = weaponTypes.find(w => w.id === option.itemId);
                    if (weapon) {
                        dispatch({
                            type: 'ADD_WEAPON',
                            payload: { weapon }
                        });
                    }
                }
                break;

            case 'weaponUpgrade':
                if (option.weaponId) {
                    dispatch({
                        type: 'UPGRADE_WEAPON',
                        payload: { weaponId: option.weaponId }
                    });
                }
                break;

            case 'passive':
                if (option.itemId) {
                    dispatch({
                        type: 'ADD_PASSIVE_ITEM',
                        payload: { itemId: option.itemId }
                    });
                }
                break;
        }
    };

    return (
        <div className={styles.upgradeMenu}>
            <h2>Level Up!</h2>
            <p>Choose an upgrade:</p>

            <div className={styles.upgradeOptions}>
                {options.map(option => (
                    <div
                        key={option.id}
                        className={styles.upgradeOption}
                        onClick={() => handleSelectUpgrade(option)}
                    >
                        <div className={styles.upgradeIcon}>{option.icon}</div>
                        <h3>{option.name}</h3>
                        <p>{option.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpgradeMenu;