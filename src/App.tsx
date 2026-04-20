import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

const FLOWER_TYPES = ['🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🪷'];

interface FlowerData {
  id: string;
  x: number;
  y: number;
  type: string;
  rotation: number;
  scale: number;
  swayDuration: number;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const messages = [
    "Hi Jiya...",
    "I really wish I could be there with you today...",
    "and hand you a beautiful bouquet in person.",
    "But since we are apart right now...",
    "I had to find another way to surprise you.",
    "So, I decided to bring the garden to you.",
    "Touch and drag anywhere on the screen ✨"
  ];

  const handleNextStep = () => {
    if (step < messages.length) {
      setStep(prev => prev + 1);
    }
  };

  const spawnFlower = useCallback((x: number, y: number) => {
    if (step < messages.length) return; // Only spawn in garden mode
    
    // Check distance to avoid clustering too densely
    if (lastPos.current) {
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 40) return; // Need to move at least 40px to spawn another
    }

    const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    const rotation = Math.random() * 360 - 180;
    const scale = 0.8 + Math.random() * 0.7; // 0.8 to 1.5
    const swayDuration = 3 + Math.random() * 3; // 3s to 6s

    const newFlower: FlowerData = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type,
      rotation,
      scale,
      swayDuration
    };

    setFlowers(prev => [...prev, newFlower]);
    lastPos.current = { x, y };

    if (flowers.length + 1 === 40) {
      // Trigger finale when they've planted enough
      setTimeout(() => {
        setStep(100); // Magic step for the final message
      }, 1500);
    }
  }, [step, flowers.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (step < messages.length) return;
    spawnFlower(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    spawnFlower(e.clientX, e.clientY);
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-[#fdfaf6] text-slate-800 overflow-hidden font-sans select-none touch-none"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Garden Layer */}
      {step >= messages.length && (
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
          {flowers.map(flower => (
            <motion.div
              key={flower.id}
              className="absolute pointer-events-none origin-center text-4xl sm:text-5xl md:text-6xl"
              style={{ left: flower.x, top: flower.y, x: '-50%', y: '-50%' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: flower.scale, 
                opacity: 1,
                y: [0, -15, 0],
                rotate: [flower.rotation, flower.rotation + 10, flower.rotation - 10, flower.rotation]
              }}
              transition={{ 
                scale: { type: "spring", damping: 12, stiffness: 100 },
                opacity: { duration: 0.3 },
                y: { duration: flower.swayDuration, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                rotate: { duration: flower.swayDuration * 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
            >
              {flower.type}
            </motion.div>
          ))}
        </div>
      )}

      {/* Intro Modal / Steps */}
      <AnimatePresence mode="wait">
        {step < messages.length && (
          <motion.div
            key={step}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-[#fdfaf6]"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="max-w-md w-full flex flex-col items-center text-center gap-12">
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium leading-relaxed text-slate-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {messages[step]}
              </motion.h2>

              <motion.button
                onClick={handleNextStep}
                className="px-8 py-3 rounded-full bg-rose-400/10 text-rose-600 font-medium tracking-wide hover:bg-rose-400/20 transition-colors active:scale-95 border border-rose-200 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                {step === messages.length - 1 ? "Open your surprise 🎁" : "Next"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finale Message */}
      <AnimatePresence>
        {step === 100 && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{ pointerEvents: 'none' }} // Let them keep drawing underneath if they want!
          >
            <motion.div 
              className="bg-white/90 p-8 sm:p-12 rounded-3xl shadow-2xl border border-white flex flex-col items-center text-center max-w-lg w-full"
              initial={{ y: 30, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', bounce: 0.5 }}
                className="mb-6 p-4 bg-rose-50 rounded-full text-rose-500 relative"
              >
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                <Heart className="w-10 h-10 fill-rose-500" />
              </motion.div>

              <h1 className="font-script text-5xl sm:text-6xl text-rose-600 mb-6 font-bold leading-tight">
                Distance means nothing...
              </h1>
              
              <p className="font-serif text-xl sm:text-2xl text-slate-700 italic mb-8">
                "...when someone means everything. I hope these digital flowers make you smile today. You deserve the real ones, and an entire garden too."
              </p>
              
              <div className="w-16 h-[1px] bg-rose-200 mb-8 rounded-full" />
              
              <p className="font-sans text-lg sm:text-xl text-slate-500 font-medium tracking-wider">
                HAPPY FLOWERS DAY,
              </p>
              <h2 className="font-script text-4xl sm:text-5xl text-rose-500 mt-3 font-bold">
                Jiya
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}