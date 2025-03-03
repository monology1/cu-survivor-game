export enum GameState {
    MENU = 'MENU',
    PLAYING = 'PLAYING',
    SHOPPING = 'SHOPPING',
    UPGRADING = 'UPGRADING',
    GAME_OVER = 'GAME_OVER'
}

export interface Wave {
    current: number;
    enemiesSpawned: number;
    enemiesKilled: number;
    active: boolean;
    timeRemaining: number;
    duration: number;
    timer: number;
}