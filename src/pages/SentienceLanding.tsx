import { useState, useEffect, useRef } from "react";
import Lenis from '@studio-freight/lenis';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { motion } from "framer-motion";
import Prism from "@/components/Prism";
import CardNav from "@/components/CardNav";
import FallingText from "@/components/FallingText";
import ScrollytellingStory from "@/components/ScrollytellingStory";
import PinRotateCards from "@/components/PinRotateCards";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

// Array of unique/rare quotes
const quotes = [
    {
        quote: "The mind is its own place, and in it can make a heaven of hell, a hell of heaven.",
        speaker: "John Milton",
        context: "From Paradise Lost (1667)",
        link: "https://poets.org/poem/paradise-lost-book-i-lines-242-270"
    },
    {
        quote: "Between stimulus and response there is a space. In that space is our power to choose our response.",
        speaker: "Viktor Frankl",
        context: "Austrian psychiatrist & Holocaust survivor",
        link: "https://www.viktorfrankl.org/biography.html"
    },
    {
        quote: "The wound is the place where the Light enters you.",
        speaker: "Rumi",
        context: "13th-century Persian poet",
        link: "https://poets.org/poet/jalal-al-din-rumi"
    },
    {
        quote: "No tree, it is said, can grow to heaven unless its roots reach down to hell.",
        speaker: "Carl Jung",
        context: "Aion: Researches into the Phenomenology of the Self",
        link: "https://carljungdepthpsychologysite.blog/2020/02/09/carl-jung-on-the-tree-of-life-and-the-roots-in-hell/"
    },
    {
        quote: "We don't see things as they are, we see them as we are.",
        speaker: "Anaïs Nin",
        context: "French-Cuban American diarist",
        link: "https://anaisninblog.skybluepress.com/2012/10/we-dont-see-things-as-they-are-we-see-them-as-we-are/"
    }
];

export default function SentienceLanding() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showStory, setShowStory] = useState<boolean | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/ambient-drone.mp3'); // Assuming an ambient track exists or will be added
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleAudio = () => {
        if (!audioRef.current) return;

        if (isAudioPlaying) {
            audioRef.current.pause();
        } else {
            // Play might fail if user hasn't interacted with document yet
            audioRef.current.play().catch(e => console.log("Audio autoplay blocked until interaction", e));
        }
        setIsAudioPlaying(!isAudioPlaying);
    };

    // Setup Lenis smooth scrolling
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove((time) => {
                lenis.raf(time * 1000);
            });
        };
    }, []);

    // Select a random quote on component mount
    const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    const handleStoryChoice = (choice: boolean) => {
        setShowStory(choice);
        // Scroll slightly after choice to reveal new content
        setTimeout(() => {
            window.scrollBy({ top: 500, behavior: 'smooth' });
        }, 300);
    };

    const navItems = [
        {
            label: "CBT Studio",
            bgColor: "#2e1065", // Deep Violet
            textColor: "#e9d5ff",
            links: [
                { label: "Mood Tracker", ariaLabel: "View Mood Tracker", href: "/mood-tracker" },
                { label: "Thought Reframer", ariaLabel: "Reframe Negative Thoughts", href: "/thought-reframer" }
            ]
        },
        {
            label: "Smart Journal",
            bgColor: "#1e1b4b", // Deep Indigo
            textColor: "#c7d2fe",
            links: [
                { label: "Write Smart Journal", ariaLabel: "Open Smart Journal", href: "/smart-journalling" },
                { label: "Voice Notes", ariaLabel: "Record Voice Note", href: "/voice-notes" }
            ]
        },
        {
            label: "Mood Trends",
            bgColor: "#0c4a6e", // Deep Cyan
            textColor: "#bae6fd",
            links: [
                { label: "Weekly Report", ariaLabel: "View Weekly Report", href: "/weekly-report" },
                { label: "Emotional Patterns", ariaLabel: "View Emotional Patterns", href: "/emotional-patterns" }
            ]
        }
    ];

    return (
        <div className="min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans">

            {/* Prism Background Shader */}
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
                <Prism
                    animationType="rotate"
                    timeScale={0.5}
                    height={3.5}
                    baseWidth={5.5}
                    scale={3.6}
                    hueShift={0}
                    colorFrequency={1}
                    noise={0}
                    glow={1}
                />
            </div>

            {/* New Card Navigation */}
            <CardNav
                items={navItems}
                menuColor="#050505"
                buttonBgColor="#ffffff"
                buttonTextColor="#000000"
                ease="circ.out"
                isOpen={isMenuOpen}
                onOpenChange={setIsMenuOpen}
            />

            {/* Minimal Modern Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">

                {/* Floating Particles/Dust Overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                opacity: Math.random() * 0.5 + 0.1
                            }}
                            animate={{
                                y: [null, Math.random() * -200 - 100],
                                x: [null, Math.random() * 100 - 50],
                                opacity: [null, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center relative max-w-5xl mx-auto pointer-events-auto flex flex-col items-center gap-12"
                >
                    {/* Super minimal logotype */}
                    <div className="flex flex-col items-center gap-4">
                        <motion.h1
                            initial={{ opacity: 0, letterSpacing: "0.5em" }}
                            animate={{ opacity: 1, letterSpacing: "0.2em" }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                            className="text-5xl md:text-7xl lg:text-[7rem] font-extralight uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-[0.2em] mix-blend-plus-lighter leading-none"
                        >
                            Sentience
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "80px" }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2, delay: 1.5 }}
                            className="text-xs uppercase tracking-[0.4em] text-cyan-400/40 mt-4"
                        >
                            Awaken Your Mind
                        </motion.p>
                    </div>

                    {/* Minimal call to action */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMenuOpen(true)}
                        className="group relative px-10 py-4 rounded-full overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-[0.2em] transition-all hover:border-cyan-400/40"
                    >
                        <span className="relative z-10 text-white/70 group-hover:text-cyan-50 transition-colors duration-300">
                            Begin Journey
                        </span>
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg" />
                    </motion.button>

                </motion.div>

                {/* Scroll Indicator Line */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 pointer-events-none"
                >
                    <div className="w-[1px] h-16 bg-white/10 relative overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            </main>

            {/* Quote Section with Falling Text & Scroll Animations */}
            <div className="relative w-full min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-transparent via-black/80 to-black py-32 border-t border-white/5">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center"
                >

                    <motion.p
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        className="text-3xl md:text-5xl lg:text-6xl font-light text-neutral-200 leading-relaxed mb-16 italic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        "{randomQuote.quote}"
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="h-24 w-[500px] max-w-full relative cursor-pointer" title="Hover me">
                            <FallingText
                                text={randomQuote.speaker}
                                highlightWords={randomQuote.speaker.split(" ")}
                                highlightClass="text-cyan-400 font-bold tracking-widest uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                trigger="hover"
                                backgroundColor="transparent"
                                wireframes={false}
                                gravity={0.5}
                                fontSize="2.5rem"
                                mouseConstraintStiffness={0.9}
                            />
                        </div>

                        <div className="text-neutral-500 text-sm md:text-base tracking-widest uppercase flex flex-col items-center gap-6">
                            <span className="text-neutral-400">{randomQuote.context}</span>
                            <a
                                href={randomQuote.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 border border-cyan-400/20 rounded-full px-6 py-3 hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                            >
                                Read More <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Story Prompt Section */}
            <div className="relative w-full py-32 flex flex-col items-center justify-center bg-black border-t border-white/5 z-10 transition-all duration-1000">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    <h3 className="text-2xl md:text-4xl text-white font-light mb-12 tracking-wide">
                        Wanna know a story?
                    </h3>
                    <div className="flex gap-6 justify-center">
                        <button
                            onClick={() => handleStoryChoice(true)}
                            className={`px-8 py-3 rounded-full border transition-all uppercase tracking-widest text-sm shadow-lg ${showStory === true ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-cyan-500/20' : 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-cyan-400/10'}`}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleStoryChoice(false)}
                            className={`px-8 py-3 rounded-full border transition-all uppercase tracking-widest text-sm shadow-lg ${showStory === false ? 'border-neutral-400 bg-neutral-400/20 text-white shadow-white/10' : 'border-neutral-500/50 text-neutral-400 hover:bg-neutral-500/10 hover:shadow-white/5'}`}
                        >
                            No
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* The Architect and the Shadow Scrollytelling Story */}
            {showStory === true && <ScrollytellingStory />}

            {/* pinned and rotating mental health cards */}
            {showStory !== null && <PinRotateCards />}

            {/* Floating Audio Toggle */}
            <button
                onClick={toggleAudio}
                className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all hover:scale-110 active:scale-95"
            >
                {isAudioPlaying ? <Volume2 size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> : <VolumeX size={24} />}
            </button>
        </div>
    );
}
