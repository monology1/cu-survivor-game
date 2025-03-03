import React from 'react';
import { GameProvider } from '@/context/GameContext';
import GameCanvas from './GameCanvas';
import StatsDisplay from './ui/StatsDisplay';
import WaveInfo from './ui/WaveInfo';
import WeaponsDisplay from './ui/WeaponsDisplay';
import PassiveItems from './ui/PassiveItems';
import GoldDisplay from './ui/GoldDisplay';
import ShopMenu from './ui/ShopMenu';
import UpgradeMenu from './ui/UpgradeMenu';
import GameOverScreen from './ui/GameOverScreen';
import StartScreen from './ui/StartScreen';
import Notifications from './ui/Notifications';

const GameContainer: React.FC = () => {
    return (
        <GameProvider>
            <div className="relative w-full h-screen bg-black overflow-hidden">
                {/* Game Canvas */}
                <GameCanvas />

                {/* UI Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <StatsDisplay />
                    <WaveInfo />
                    <WeaponsDisplay />
                    <PassiveItems />
                    <GoldDisplay />
                    <ShopMenu />
                    <UpgradeMenu />
                    <GameOverScreen />
                    <StartScreen />
                    <Notifications />
                </div>
            </div>
        </GameProvider>
    );
};

export default GameContainer;