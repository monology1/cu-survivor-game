'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the GameContainer
// This is necessary because it uses browser APIs like canvas and window
const GameContainer = dynamic(
    () => import('@/components/game/GameContainer'),
    { ssr: false }
);

export default function GamePage() {
    return <GameContainer />;
}