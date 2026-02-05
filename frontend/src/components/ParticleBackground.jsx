import { useEffect, useRef } from 'react';

// Interactive Particle System Component with smooth flowing animation
const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: null, y: null });
    const particlesRef = useRef([]);
    const animationRef = useRef(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            const oldWidth = width;
            const oldHeight = height;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Scale existing particle positions proportionally
            if (particlesRef.current.length > 0 && oldWidth > 0 && oldHeight > 0) {
                particlesRef.current.forEach(p => {
                    p.x = (p.x / oldWidth) * width;
                    p.y = (p.y / oldHeight) * height;
                    p.baseX = (p.baseX / oldWidth) * width;
                    p.baseY = (p.baseY / oldHeight) * height;
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        // Create more particles with unique wave properties for dense effect
        const particleCount = Math.min(300, Math.floor((width * height) / 4000));
        particlesRef.current = [];

        for (let i = 0; i < particleCount; i++) {
            const isOrange = Math.random() > 0.5;
            const baseOpacity = Math.random() * 0.6 + 0.2;
            const x = Math.random() * width;
            const y = Math.random() * height;
            particlesRef.current.push({
                x,
                y,
                baseX: x,
                baseY: y,
                radius: Math.random() * 3 + 1,
                isOrange,
                baseOpacity,
                // Wave properties for more turbulent movement
                waveAmplitude: Math.random() * 50 + 25,
                waveFrequency: Math.random() * 0.004 + 0.002,
                wavePhase: Math.random() * Math.PI * 2,
                wavePhase2: Math.random() * Math.PI * 2,
                // Secondary wave for more chaos
                waveAmplitude2: Math.random() * 20 + 10,
                waveFrequency2: Math.random() * 0.006 + 0.003,
                // Faster drift
                driftSpeed: Math.random() * 0.5 + 0.2,
                driftAngle: Math.random() * Math.PI * 2,
                // Turbulence factor
                turbulence: Math.random() * 0.5 + 0.5,
            });
        }

        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = null;
            mouseRef.current.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            timeRef.current += 1;
            const time = timeRef.current;

            const mouse = mouseRef.current;

            particlesRef.current.forEach((p, index) => {
                // Calculate distance to mouse for glow effect
                let distToMouse = Infinity;
                let glowIntensity = 0;
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    distToMouse = Math.sqrt(dx * dx + dy * dy);
                    const glowRadius = 200;
                    if (distToMouse < glowRadius) {
                        glowIntensity = Math.pow(1 - distToMouse / glowRadius, 1.5);
                    }
                }

                // Calculate multi-layer wave-based movement for more turbulence
                const waveX = Math.sin(time * p.waveFrequency + p.wavePhase) * p.waveAmplitude
                    + Math.sin(time * p.waveFrequency2 + p.wavePhase2) * p.waveAmplitude2 * p.turbulence;
                const waveY = Math.cos(time * p.waveFrequency * 0.7 + p.wavePhase2) * p.waveAmplitude * 0.6
                    + Math.cos(time * p.waveFrequency2 * 1.3 + p.wavePhase) * p.waveAmplitude2 * p.turbulence;

                // Add random jitter for more disturbance
                const jitterX = (Math.random() - 0.5) * 2 * p.turbulence;
                const jitterY = (Math.random() - 0.5) * 2 * p.turbulence;

                // Target position with wave and jitter
                let targetX = p.baseX + waveX + jitterX;
                let targetY = p.baseY + waveY + jitterY;

                // Mouse interaction - stronger disturbance with swirl effect
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const repelRadius = 180;

                    if (dist < repelRadius) {
                        // Stronger repulsion with swirl
                        const force = Math.pow(1 - dist / repelRadius, 2) * 100;
                        const angle = Math.atan2(dy, dx);

                        // Add swirl effect based on time
                        const swirlAngle = angle + (1 - dist / repelRadius) * Math.sin(time * 0.05) * 1.5;
                        targetX += Math.cos(swirlAngle) * force;
                        targetY += Math.sin(swirlAngle) * force;

                        // Extra turbulence near cursor
                        targetX += Math.sin(time * 0.1 + index) * 5 * (1 - dist / repelRadius);
                        targetY += Math.cos(time * 0.1 + index) * 5 * (1 - dist / repelRadius);
                    }
                }

                // Faster interpolation for snappier movement
                p.x += (targetX - p.x) * 0.12;
                p.y += (targetY - p.y) * 0.08;

                // Slowly drift the base position
                p.baseX += Math.cos(p.driftAngle) * p.driftSpeed * 0.1;
                p.baseY += Math.sin(p.driftAngle) * p.driftSpeed * 0.1;

                // Wrap around screen edges
                if (p.baseX < -50) p.baseX = width + 50;
                if (p.baseX > width + 50) p.baseX = -50;
                if (p.baseY < -50) p.baseY = height + 50;
                if (p.baseY > height + 50) p.baseY = -50;

                // Base pulsing opacity
                const basePulse = p.baseOpacity + Math.sin(time * 0.02 + p.wavePhase) * 0.15;
                // Subtle enhanced opacity and size when near cursor
                const pulseOpacity = basePulse + glowIntensity * 0.4;
                const pulseRadius = p.radius + Math.sin(time * 0.015 + p.wavePhase2) * 0.5 + glowIntensity * 1.5;

                // Draw outer glow - much more subtle enhancement
                const glowSize = pulseRadius * (4 + glowIntensity * 1.5);
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                if (p.isOrange) {
                    gradient.addColorStop(0, `rgba(251, 146, 60, ${(pulseOpacity * 0.3 + glowIntensity * 0.2)})`);
                    gradient.addColorStop(0.5, `rgba(251, 146, 60, ${(pulseOpacity * 0.1 + glowIntensity * 0.1)})`);
                    gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
                } else {
                    gradient.addColorStop(0, `rgba(168, 85, 247, ${(pulseOpacity * 0.3 + glowIntensity * 0.2)})`);
                    gradient.addColorStop(0.5, `rgba(168, 85, 247, ${(pulseOpacity * 0.1 + glowIntensity * 0.1)})`);
                    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
                }
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw main particle - softer brightness shift
                ctx.beginPath();
                ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
                if (p.isOrange) {
                    // Subtle brighten to lighter orange
                    const r = Math.min(255, 251 + glowIntensity * 20);
                    const g = Math.min(255, 146 + glowIntensity * 60);
                    const b = Math.min(255, 60 + glowIntensity * 60);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, pulseOpacity + glowIntensity * 0.3)})`;
                } else {
                    // Subtle brighten to lighter purple
                    const r = Math.min(255, 168 + glowIntensity * 40);
                    const g = Math.min(255, 85 + glowIntensity * 40);
                    const b = Math.min(255, 247 + glowIntensity * 8);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, pulseOpacity + glowIntensity * 0.3)})`;
                }
                ctx.fill();
            });

            // Draw connections between nearby particles
            particlesRef.current.forEach((p, i) => {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const p2 = particlesRef.current[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.2;
                        ctx.beginPath();
                        // Gradient line for connection
                        const lineGradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                        if (p.isOrange && p2.isOrange) {
                            lineGradient.addColorStop(0, `rgba(251, 146, 60, ${alpha})`);
                            lineGradient.addColorStop(1, `rgba(251, 146, 60, ${alpha})`);
                        } else if (!p.isOrange && !p2.isOrange) {
                            lineGradient.addColorStop(0, `rgba(168, 85, 247, ${alpha})`);
                            lineGradient.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
                        } else {
                            lineGradient.addColorStop(0, `rgba(251, 146, 60, ${alpha})`);
                            lineGradient.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
                        }
                        ctx.strokeStyle = lineGradient;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0"
            style={{ pointerEvents: 'none' }}
        />
    );
};

export default ParticleBackground;
