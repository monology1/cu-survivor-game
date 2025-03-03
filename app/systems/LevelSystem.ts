import { Player } from '@/models/Player';
import { weaponTypes } from '@/data/weapons';
import { passiveItems as passiveItemsData } from '@/data/passiveItems';
import {Weapon} from "@/models/Weapon";
import {PassiveItem} from "@/models/PassiveItem";

export class LevelSystem {
    /**
     * Check if player should level up
     */
    static checkLevelUp(player: Player): boolean {
        return player.experience >= player.experienceToLevel;
    }

    /**
     * Get available weapons for upgrade menu (weapons player doesn't have yet)
     */
    static getAvailableWeapons(player: Player): Weapon[] {
        return weaponTypes.filter(weapon =>
            !player.weapons.some(w => w.id === weapon.id)
        );
    }

    /**
     * Get upgradable weapons (weapons player has that aren't max level)
     */
    static getUpgradableWeapons(player: Player): Weapon[] {
        return player.weapons.filter(weapon => weapon.level < weapon.maxLevel);
    }

    /**
     * Get random passive items for upgrade menu
     */
    static getRandomPassiveItem(): PassiveItem {
        return passiveItemsData[Math.floor(Math.random() * passiveItemsData.length)];
    }

    /**
     * Apply passive item effect to player
     */
    static applyPassiveItem(player: Player, item: PassiveItem): Player {
        const updatedPlayer = { ...player };
        item.effect(updatedPlayer);
        return updatedPlayer;
    }
}