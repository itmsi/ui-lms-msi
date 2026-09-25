import type { CSSProperties } from 'react';

interface Particle {
    size: number;
    left: string;
    top: string;
    dx: string;
    dy: string;
    duration: string;
    delay: string;
    opacity: number;
}

const PARTICLES: Particle[] = [
    { size: 6, left: '12%', top: '16%', dx: '22px', dy: '-26px', duration: '13s', delay: '0s', opacity: 0.35 },
    { size: 3, left: '24%', top: '32%', dx: '-16px', dy: '20px', duration: '17s', delay: '1.2s', opacity: 0.45 },
    { size: 9, left: '38%', top: '12%', dx: '14px', dy: '24px', duration: '19s', delay: '0.4s', opacity: 0.2 },
    { size: 4, left: '52%', top: '26%', dx: '-20px', dy: '-18px', duration: '15s', delay: '2.1s', opacity: 0.4 },
    { size: 5, left: '68%', top: '18%', dx: '18px', dy: '22px', duration: '21s', delay: '0.8s', opacity: 0.3 },
    { size: 3, left: '78%', top: '38%', dx: '-14px', dy: '-22px', duration: '16s', delay: '1.6s', opacity: 0.45 },
    { size: 7, left: '88%', top: '22%', dx: '-22px', dy: '18px', duration: '23s', delay: '0.2s', opacity: 0.22 },
    { size: 4, left: '16%', top: '46%', dx: '20px', dy: '16px', duration: '18s', delay: '2.6s', opacity: 0.32 },
    { size: 5, left: '46%', top: '44%', dx: '-18px', dy: '24px', duration: '20s', delay: '1s', opacity: 0.26 },
    { size: 3, left: '62%', top: '52%', dx: '16px', dy: '-20px', duration: '14s', delay: '3s', opacity: 0.4 },
];

export const FloatingParticles = () => (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PARTICLES.map((particle, index) => (
            <span
                key={index}
                className="brand-particle"
                style={
                    {
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: particle.left,
                        top: particle.top,
                        opacity: particle.opacity,
                        '--particle-dx': particle.dx,
                        '--particle-dy': particle.dy,
                        '--particle-duration': particle.duration,
                        '--particle-delay': particle.delay,
                    } as CSSProperties
                }
            />
        ))}
    </div>
);
