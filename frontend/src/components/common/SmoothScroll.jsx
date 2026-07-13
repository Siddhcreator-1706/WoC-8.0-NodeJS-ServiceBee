import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            prevent: (node) => {
                return (
                    node.hasAttribute('data-prevent-lenis') ||
                    node.hasAttribute('data-lenis-prevent') ||
                    node.closest('[data-prevent-lenis]') !== null ||
                    node.closest('[data-lenis-prevent]') !== null
                );
            }
        });

        let animationFrameId;

        const raf = (time) => {
            lenis.raf(time);
            animationFrameId = requestAnimationFrame(raf);
        };

        animationFrameId = requestAnimationFrame(raf);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
