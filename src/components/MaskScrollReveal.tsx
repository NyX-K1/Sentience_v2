import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MaskScrollRevealProps {
    text?: string;
    videoSrc?: string;
}

export default function MaskScrollReveal({
    text = 'You Made It',
    videoSrc = 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
}: MaskScrollRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!textRef.current || !containerRef.current) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    scrub: 1.5, // Smooth scrubbing
                    pin: true,
                    start: 'top top',
                    end: '+=2500', // Long scroll distance for extra smooth zoom
                },
            });

            // Phase 1: Scale text massively (targets the "M" at 42% horizontal center)
            tl.to(textRef.current, {
                scale: 400,
                transformOrigin: "42% 50%",
                ease: 'power1.inOut',
            }, 0);

            // Phase 2: Fade mask layer in the last 10% to ensure clean video
            tl.to(".mask-layer", {
                opacity: 0,
                duration: 0.1,
                ease: "power2.inOut",
            }, 0.9);

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                height: '100vh',
                width: '100%',
                overflow: 'hidden',
                background: '#000',
                isolation: 'isolate', // Creates a new stacking context strictly for this section
            }}
        >
            {/* 1. Video Layer (Bottom) */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                }}
            >
                <source src={videoSrc} type="video/mp4" />
            </video>

            {/* 2. Mask Layer (Top) */}
            <div
                className="mask-layer"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#fff', // White background
                    mixBlendMode: 'screen', // Screen blend mode: white stays opaque, black becomes transparent
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2,
                }}
            >
                <h2
                    ref={textRef}
                    style={{
                        fontFamily: '"Abril Fatface", "Cormorant Garamond", serif',
                        fontSize: 'clamp(60px, 12vw, 150px)', // Larger initial size
                        color: '#000', // Black text will punch a hole through to the video
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        margin: 0,
                        willChange: 'transform',
                    }}
                >
                    {text}
                </h2>
            </div>
        </div>
    );
}
