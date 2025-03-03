import { Wave } from '@/models/Game';

export class WaveSystem {
    /**
     * Start a new wave
     */
    static startWave(wave: Wave): Wave {
        return {
            ...wave,
            active: true,
            timer: 0,
            enemiesSpawned: 0,
            enemiesKilled: 0
        };
    }

    /**
     * End current wave
     */
    static endWave(wave: Wave): Wave {
        return {
            ...wave,
            active: false,
            current: wave.current + 1,
            timeRemaining: 5 // 5 seconds until next wave
        };
    }

    /**
     * Update wave timer
     */
    static updateWaveTimer(wave: Wave, deltaTime: number): Wave {
        if (wave.active) {
            return {
                ...wave,
                timer: wave.timer + deltaTime
            };
        } else {
            return {
                ...wave,
                timeRemaining: wave.timeRemaining - deltaTime
            };
        }
    }

    /**
     * Check if wave should end
     */
    static shouldEndWave(wave: Wave): boolean {
        return wave.active && wave.timer >= wave.duration;
    }

    /**
     * Check if next wave should start
     */
    static shouldStartWave(wave: Wave): boolean {
        return !wave.active && wave.timeRemaining <= 0;
    }

    /**
     * Get maximum enemies for current wave
     */
    static getMaxEnemies(waveNumber: number): number {
        return 10 + Math.floor(waveNumber * 1.5);
    }

    /**
     * Calculate number of enemies to spawn this frame
     */
    static calculateEnemiesToSpawn(
        currentEnemies: number,
        waveNumber: number,
        maxSpawnPerFrame: number = 3
    ): number {
        const maxEnemies = this.getMaxEnemies(waveNumber);
        return Math.min(maxEnemies - currentEnemies, maxSpawnPerFrame);
    }
}