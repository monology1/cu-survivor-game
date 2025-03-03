import { Particle } from '@/models/Particle';

export class ParticleSystem {
    /**
     * Update particles for next frame
     */
    static updateParticles(particles: Particle[], deltaTime: number): Particle[] {
        return particles.map(particle => {
            const updatedParticle = { ...particle };

            // Move particle
            updatedParticle.x += updatedParticle.vx * deltaTime * 60;
            updatedParticle.y += updatedParticle.vy * deltaTime * 60;

            // Apply friction
            updatedParticle.vx *= 0.95;
            updatedParticle.vy *= 0.95;

            // Reduce size
            updatedParticle.size *= 0.97;

            // Reduce lifetime
            updatedParticle.lifetime -= deltaTime;

            return updatedParticle;
        }).filter(particle => particle.size >= 0.5 && particle.lifetime > 0);
    }
}