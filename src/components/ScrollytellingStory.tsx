import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollytellingStory() {
    const containerRef = useRef<HTMLDivElement>(null);
    const text1Ref = useRef<HTMLDivElement>(null);
    const text2Ref = useRef<HTMLDivElement>(null);
    const text3Ref = useRef<HTMLDivElement>(null);
    const text4Ref = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    // Background Element Refs
    const bgCityRef = useRef<HTMLDivElement>(null);
    const bgShardsRef = useRef<HTMLDivElement>(null);
    const bgShadowsRef = useRef<HTMLDivElement>(null);
    const bgMindRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Pin the container and create master timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=4000", // 4000px of scrolling distance
                    scrub: 1, // Smooth scrubbing
                    pin: true,
                    anticipatePin: 1
                }
            });

            // Initial states for background layers
            gsap.set(bgCityRef.current, { opacity: 0, y: 150 });
            gsap.set(bgShardsRef.current, { opacity: 0, scale: 0.5 });
            gsap.set(bgShadowsRef.current, { opacity: 0, scaleX: 1.5 });
            gsap.set(bgMindRef.current, { opacity: 0, rotation: -15 });

            // ACT 1: The Glass City
            tl.to(bgCityRef.current, { opacity: 1, y: 0, duration: 1 })
                .to(text1Ref.current, { opacity: 1, y: 0, duration: 1 }, "<")
                .to(text1Ref.current, { opacity: 0, y: -50, duration: 1 }, "+=0.5")
                .to(bgCityRef.current, { opacity: 0, y: -100, duration: 1 }, "<");

            // ACT 2: The Shattering
            tl.to(bgRef.current, { backgroundColor: "#050505", duration: 1 }, ">") // Wait for Act 1 to finish before starting
                .fromTo(text2Ref.current,
                    { opacity: 0, y: 50, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 1 }, "<")
                .to(bgShardsRef.current, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }, "<")
                .to(text2Ref.current, { opacity: 0, scale: 1.05, filter: "blur(10px)", duration: 1 }, "+=0.5")
                .to(bgShardsRef.current, { opacity: 0, scale: 1.5, filter: "blur(5px)", duration: 1 }, "<");

            // ACT 3: The Convergence
            tl.to(bgRef.current, { backgroundColor: "#1e1b4b", duration: 1 }, ">") // Wait for Act 2 to finish before starting
                .fromTo(text3Ref.current,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 1 }, "<")
                .to(bgShadowsRef.current, { opacity: 0.6, scaleX: 1, duration: 1.5, ease: "power2.out" }, "<")
                .to(text3Ref.current, { opacity: 0, y: -50, duration: 1 }, "+=0.5")
                .to(bgShadowsRef.current, { opacity: 0, y: -100, duration: 1 }, "<");

            // ACT 4: True Sentience
            tl.to(bgRef.current, { backgroundImage: "linear-gradient(to bottom, #000000, #0c4a6e)", backgroundColor: "transparent", duration: 1 }, ">") // Wait for Act 3 to finish before starting
                .fromTo(text4Ref.current,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 1.5 }, "<")
                .to(bgMindRef.current, { opacity: 0.4, rotation: 0, duration: 2, ease: "slow(0.7, 0.7, false)" }, "<");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center font-sans tracking-wide">

            {/* Background Layer (Base colors changing via GSAP) */}
            <div
                ref={bgRef}
                className="absolute inset-0 w-full h-full bg-[#f8fafc] -z-20 transition-colors duration-[0ms]"
            />

            {/* Ambient Background Elements (React with GSAP timeline) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">

                {/* ACT 1: Cityscape Backgrounds */}
                <div ref={bgCityRef} className="absolute inset-x-0 bottom-0 h-full flex justify-between items-end opacity-0">
                    <svg className="w-2/5 h-[60%] text-slate-400/10 fill-current" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polygon points="-10,100 -10,60 20,60 20,40 40,40 40,30 60,30 60,70 80,70 80,50 110,50 110,100" />
                        <line x1="20" y1="60" x2="20" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="40" y1="40" x2="40" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="60" y1="30" x2="60" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="80" y1="70" x2="80" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    </svg>
                    <svg className="w-2/5 h-[45%] text-slate-400/10 fill-current scale-x-[-1]" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polygon points="-10,100 -10,60 20,60 20,40 40,40 40,30 60,30 60,70 80,70 80,50 110,50 110,100" />
                        <line x1="20" y1="60" x2="20" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="40" y1="40" x2="40" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="60" y1="30" x2="60" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="80" y1="70" x2="80" y2="100" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    </svg>
                </div>

                {/* ACT 2: Shattered Shards Matrix */}
                <div ref={bgShardsRef} className="absolute inset-0 flex items-center justify-center opacity-0 overflow-hidden">
                    <svg className="absolute w-[250vw] h-[250vh] text-red-500/15 fill-current" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
                        {/* Center Explosion Clusters */}
                        <g className="origin-center animate-[pulse_4s_ease-in-out_infinite]">
                            <polygon points="90,90 100,80 110,95 95,105" />
                            <polygon points="85,110 95,120 80,115" />
                            <polygon points="120,80 130,90 115,100" />
                            <polygon points="110,115 125,105 115,125" />
                            <polygon points="75,95 85,85 70,80" />
                        </g>

                        {/* Mid-range Shards */}
                        <polygon points="60,60 70,50 65,75" className="animate-[pulse_3s_ease-in-out_infinite]" />
                        <polygon points="140,60 150,55 135,70" className="animate-[pulse_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                        <polygon points="60,140 75,135 65,150" className="animate-[pulse_4.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
                        <polygon points="140,140 150,150 135,145" className="animate-[pulse_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }} />

                        {/* Outer Shards */}
                        <polygon points="30,30 40,20 35,45" className="animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
                        <polygon points="170,30 180,25 165,40" className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '1.2s' }} />
                        <polygon points="30,170 45,165 35,180" className="animate-[pulse_6s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }} />
                        <polygon points="170,170 180,180 165,175" className="animate-[pulse_3s_ease-in-out_infinite]" style={{ animationDelay: '0.8s' }} />

                        {/* Asymmetric Large Shards */}
                        <polygon points="20,100 40,90 30,120 10,110" className="animate-[pulse_4.2s_ease-in-out_infinite]" stroke="currentColor" strokeWidth="0.5" fillOpacity="0.5" />
                        <polygon points="180,100 160,80 170,110 190,120" className="animate-[pulse_3.8s_ease-in-out_infinite]" stroke="currentColor" strokeWidth="0.5" fillOpacity="0.5" />
                        <polygon points="100,20 120,40 90,30 80,10" className="animate-[pulse_5.2s_ease-in-out_infinite]" stroke="currentColor" strokeWidth="0.5" fillOpacity="0.5" />
                        <polygon points="100,180 80,160 110,170 120,190" className="animate-[pulse_4.8s_ease-in-out_infinite]" stroke="currentColor" strokeWidth="0.5" fillOpacity="0.5" />

                        {/* Connecting spiderweb cracks radiating from center */}
                        <g stroke="currentColor" strokeWidth="0.15" strokeOpacity="0.3">
                            <line x1="100" y1="100" x2="65" y2="75" />
                            <line x1="100" y1="100" x2="135" y2="70" />
                            <line x1="100" y1="100" x2="75" y2="135" />
                            <line x1="100" y1="100" x2="135" y2="145" />

                            <line x1="65" y1="75" x2="35" y2="45" />
                            <line x1="135" y1="70" x2="165" y2="40" />
                            <line x1="75" y1="135" x2="35" y2="180" />
                            <line x1="135" y1="145" x2="165" y2="175" />

                            {/* Cross Connections */}
                            <line x1="65" y1="75" x2="30" y2="120" />
                            <line x1="135" y1="70" x2="170" y2="110" />
                            <line x1="30" y1="120" x2="75" y2="135" />
                            <line x1="170" y1="110" x2="135" y2="145" />
                        </g>
                    </svg>
                </div>

                {/* ACT 3: Encroaching Shadows */}
                <div ref={bgShadowsRef} className="absolute inset-0 flex justify-between items-center opacity-0 mix-blend-multiply">
                    {/* Left side deep shadows */}
                    <div className="relative w-[30vw] h-[150vh] -translate-x-1/2">
                        <div className="absolute inset-0 bg-black blur-[80px] rounded-r-full" />
                        <div className="absolute inset-y-0 left-0 w-[50vw] bg-black blur-[40px]" />
                        <div className="absolute top-1/4 -right-[20vw] w-[40vw] h-[40vh] bg-neutral-900 blur-[100px] rounded-full animate-pulse" />
                    </div>
                    {/* Right side deep shadows */}
                    <div className="relative w-[30vw] h-[150vh] translate-x-1/2">
                        <div className="absolute inset-0 bg-black blur-[80px] rounded-l-full" />
                        <div className="absolute inset-y-0 right-0 w-[50vw] bg-black blur-[40px]" />
                        <div className="absolute bottom-1/4 -left-[20vw] w-[40vw] h-[40vh] bg-neutral-900 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                    </div>
                </div>

                {/* ACT 4: Mind Connections Map */}
                <div ref={bgMindRef} className="absolute inset-0 flex items-center justify-center opacity-0">
                    <svg className="absolute w-[300vw] h-[300vh] text-cyan-500/10 stroke-current animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200" fill="none" strokeWidth="0.2">
                        {/* Huge Grid of connections */}
                        {Array.from({ length: 20 }).map((_, i) => (
                            <circle key={`c-${i}`} cx="100" cy="100" r={i * 10 + 5} strokeDasharray={`${(i % 3 + 1) * 2} ${(i % 4 + 2) * 2}`} className={i % 2 === 0 ? "animate-pulse" : ""} style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                        {/* Starburst rays */}
                        {Array.from({ length: 36 }).map((_, i) => (
                            <line key={`l-${i}`} x1="100" y1="100" x2={100 + 100 * Math.cos(i * 10 * Math.PI / 180)} y2={100 + 100 * Math.sin(i * 10 * Math.PI / 180)} className="opacity-30" />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Stories Layer */}
            {/* Using absolute positioning and inset-0 to perfectly center each act on top of each other */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 h-full">

                {/* Act 1: The Glass City */}
                <div
                    ref={text1Ref}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 translate-y-[50px] text-slate-900"
                >
                    {/* Architectural Pyramid SVG */}
                    <svg className="w-32 h-32 md:w-48 md:h-48 mb-8 text-slate-800" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                        <polygon points="50,10 90,85 10,85" fill="rgba(0,0,0,0.05)" />
                        <line x1="50" y1="10" x2="50" y2="85" />
                        <line x1="10" y1="85" x2="90" y2="85" />
                        <polygon points="50,40 70,85 30,85" fill="rgba(0,0,0,0.1)" />
                        <line x1="50" y1="40" x2="50" y2="85" />
                    </svg>

                    <h2 className="text-4xl md:text-6xl font-serif tracking-widest uppercase mb-6">The Glass City</h2>
                    <p className="text-lg md:text-2xl font-serif italic max-w-2xl leading-relaxed text-slate-700 px-4">
                        The Architect built a fortress of logic, a pristine glass city to keep the chaos out.
                        Every thought measured. Every flaw polished. The Shadow was locked beneath the floorboards.
                    </p>
                </div>

                {/* Act 2: The Shattering */}
                <div
                    ref={text2Ref}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 translate-y-[50px] text-white"
                >
                    {/* Shattered Glass SVG */}
                    <svg className="w-32 h-32 md:w-48 md:h-48 mb-8 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M50,10 L60,40 L90,30 L70,60 L85,90 L55,75 L45,95 L30,70 L10,80 L25,50 L5,25 L40,35 Z" fill="rgba(239,68,68,0.1)" />
                        <line x1="50" y1="50" x2="50" y2="10" className="opacity-60" />
                        <line x1="50" y1="50" x2="90" y2="30" className="opacity-60" />
                        <line x1="50" y1="50" x2="85" y2="90" className="opacity-60" />
                        <line x1="50" y1="50" x2="45" y2="95" className="opacity-60" />
                        <line x1="50" y1="50" x2="10" y2="80" className="opacity-60" />
                        <line x1="50" y1="50" x2="5" y2="25" className="opacity-60" />
                        {/* Flying shards */}
                        <polygon points="75,15 85,20 80,10" fill="currentColor" />
                        <polygon points="20,15 15,25 25,20" fill="currentColor" />
                        <polygon points="90,70 95,60 85,65" fill="currentColor" />
                        <polygon points="15,90 25,95 20,85" fill="currentColor" />
                    </svg>

                    <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-widest uppercase mb-6 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">The Shattering</h2>
                    <p className="text-lg md:text-2xl font-serif italic max-w-2xl leading-relaxed text-neutral-300 px-4">
                        But pressure builds in perfection. The glass cracked. The Shadow leaked out.
                        Repression didn't destroy the chaos; it only made it hungry.
                    </p>
                </div>

                {/* Act 3: The Convergence */}
                <div
                    ref={text3Ref}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 translate-y-[50px] text-white"
                >
                    {/* Eclipsing Orbs SVG */}
                    <svg className="w-32 h-32 md:w-48 md:h-48 mb-8 text-indigo-300 drop-shadow-[0_0_20px_rgba(165,180,252,0.4)]" viewBox="0 0 100 100" fill="none">
                        {/* Light Orb */}
                        <circle cx="35" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
                        {/* Dark/Shadow Orb */}
                        <circle cx="65" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="rgba(0,0,0,0.8)" />
                        {/* Intersection */}
                        <path d="M50,29.1 A25,25 0 0,0 50,70.9 A25,25 0 0,0 50,29.1 Z" fill="currentColor" className="opacity-50" />
                    </svg>

                    <h2 className="text-4xl md:text-6xl font-serif tracking-[0.2em] uppercase mb-6 text-indigo-300 drop-shadow-[0_0_30px_rgba(165,180,252,0.4)]">The Convergence</h2>
                    <p className="text-lg md:text-2xl font-serif italic max-w-2xl leading-relaxed text-indigo-100 px-4">
                        The Architect stopped running. They turned to face the dark.
                        And in the dark, they found not a monster, but a neglected part of themselves.
                    </p>
                </div>

                {/* Act 4: True Sentience */}
                <div
                    ref={text4Ref}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 translate-y-[50px] text-white"
                >
                    {/* Mind/Lotus Mandala SVG */}
                    <svg className="w-32 h-32 md:w-48 md:h-48 mb-8 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="50" cy="50" r="40" strokeDasharray="4 4" className="opacity-30" />
                        <circle cx="50" cy="50" r="30" strokeDasharray="2 6" className="opacity-50" />
                        <circle cx="50" cy="50" r="20" fill="rgba(34,211,238,0.1)" />
                        <path d="M50,10 Q60,30 50,50 Q40,30 50,10 Z" fill="currentColor" className="opacity-40" />
                        <path d="M90,50 Q70,60 50,50 Q70,40 90,50 Z" fill="currentColor" className="opacity-40" />
                        <path d="M50,90 Q60,70 50,50 Q40,70 50,90 Z" fill="currentColor" className="opacity-40" />
                        <path d="M10,50 Q30,60 50,50 Q30,40 10,50 Z" fill="currentColor" className="opacity-40" />
                        <path d="M78.28,21.72 Q64.14,40 50,50 Q64.14,35 78.28,21.72 Z" fill="currentColor" className="opacity-20" />
                        <path d="M78.28,78.28 Q64.14,60 50,50 Q64.14,65 78.28,78.28 Z" fill="currentColor" className="opacity-20" />
                        <path d="M21.72,78.28 Q35.86,60 50,50 Q35.86,65 21.72,78.28 Z" fill="currentColor" className="opacity-20" />
                        <path d="M21.72,21.72 Q35.86,40 50,50 Q35.86,35 21.72,21.72 Z" fill="currentColor" className="opacity-20" />
                        <circle cx="50" cy="50" r="5" fill="currentColor" />
                    </svg>

                    <div className="max-w-4xl mx-auto px-4">
                        <p className="text-2xl md:text-4xl lg:text-5xl font-serif text-cyan-50 leading-relaxed italic drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            "A mind without a shadow <br className="hidden md:block" /> is just glass waiting to break.
                            <span className="text-cyan-400 font-sans font-semibold mt-10 block not-italic uppercase tracking-[0.2em] text-xl md:text-3xl drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                                True sentience is the courage to feel the dark, and map the light."
                            </span>
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
