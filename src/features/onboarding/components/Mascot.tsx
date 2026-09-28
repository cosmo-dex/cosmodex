import { motion } from 'motion/react';
import { Sparkles, Hand } from 'lucide-react';
import { OnboardingStepId, OnboardingData } from '../types/onboarding';
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import mascotBody from '../../mascot/Mascot-Without-Eyes.webp';
import mascotPupil from '../../mascot/Mascot-Pupil.webp';

interface MascotProps {
  step: OnboardingStepId;
  data: OnboardingData;
}

export default function Mascot({ step }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Set initial value safely
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pupil eye tracking towards cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!leftEyeRef.current || !rightEyeRef.current) return;
      const leftRect = leftEyeRef.current.getBoundingClientRect();

      const leftCenterX = leftRect.left + leftRect.width / 2;
      const leftCenterY = leftRect.top + leftRect.height / 2;
      const dx = e.clientX - leftCenterX;
      const dy = e.clientY - leftCenterY;
      const dist = Math.hypot(dx, dy);
      const maxOffset = 3.5;
      const offsetX = (dx / (dist || 1)) * Math.min(dist / 60, maxOffset);
      const offsetY = (dy / (dist || 1)) * Math.min(dist / 60, maxOffset);

      leftEyeRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      rightEyeRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine mascot's position and animation state based on current step
  const getVariants = () => {
    if (isMobile) {
      // Keep it centered but scaled down and above the cards on small screens
      switch (step) {
        case 'START':
          return { x: -120, y: -160, rotate: -10, scale: 0.75 };
        case 'AUTH':
          return { x: 0, y: -270, rotate: 0, scale: 0.65 };
        case 'USERNAME':
        case 'AVATAR':
        case 'INTERESTS':
        case 'PREVIEW':
          return { x: 0, y: -270, rotate: 5, scale: 0.65 };
        case 'COMPLETING':
          return { x: 120, y: -160, rotate: 10, scale: 0.75 };
        default:
          return { x: 0, y: -200, rotate: 0, scale: 0.75 };
      }
    }

    // Desktop: Position to the sides so it never overlaps forms or headers
    switch (step) {
      case 'START':
        return { x: -380, y: -30, rotate: -10, scale: 1.1 };
      case 'AUTH':
        return { x: 280, y: -60, rotate: 8, scale: 0.95 };
      case 'USERNAME':
        return { x: 320, y: -140, rotate: 10, scale: 0.9 };
      case 'AVATAR':
        return { x: -320, y: -140, rotate: -10, scale: 1.05 };
      case 'PREVIEW':
        return { x: -290, y: -40, rotate: -8, scale: 0.95 };
      case 'INTERESTS':
        return { x: 350, y: 120, rotate: 10, scale: 0.95 };
      case 'COMPLETING':
        return { x: 380, y: -30, rotate: 10, scale: 1.1 };
      default:
        return { x: 0, y: 0, rotate: 0, scale: 1 };
    }
  };

  const currentVariant = getVariants();

  const blinkAnimation = {
    scaleY: [1, 1, 0.1, 1, 1],
    transition: { duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: "easeInOut" as const }
  };

  return (
    <div ref={containerRef} className="absolute inset-4 sm:inset-8 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0.08}
        dragMomentum={true}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 25, power: 0.15 }}
        whileHover={{ scale: (currentVariant.scale || 1) * 1.06 }}
        whileDrag={{ scale: (currentVariant.scale || 1) * 1.12, rotate: 8, cursor: "grabbing" }}
        animate={currentVariant}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="relative pointer-events-auto cursor-grab active:cursor-grabbing select-none"
        title="Drag me anywhere!"
      >
        {/* The Float mechanic */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative w-[150px] h-[200px] pointer-events-auto"
        >
          <Image 
            src={mascotBody}
            alt="Mascot Body" 
            draggable={false} 
            className="absolute z-10 w-full h-auto pointer-events-none select-none"
          />
          
          {/* Left Pupil */}
          <div ref={leftEyeRef} className="absolute z-11 w-[20px] top-[52px] left-[52px] pointer-events-none transition-transform duration-75">
            <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
              <Image src={mascotPupil} alt="Left Eye" draggable={false} className="w-full h-auto pointer-events-none select-none" />
            </motion.div>
          </div>

          {/* Right Pupil */}
          <div ref={rightEyeRef} className="absolute z-11 w-[20px] top-[52px] right-[45px] pointer-events-none transition-transform duration-75">
             <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
              <Image src={mascotPupil} alt="Right Eye" draggable={false} className="w-full h-auto pointer-events-none select-none" />
            </motion.div>
          </div>

          {/* Arms / Details (Optional) */}
          {step === 'START' && (
            <motion.div 
              className="absolute -right-6 top-6 text-cyan-400 drop-shadow-[0_0_5px_currentColor] z-20 pointer-events-none"
              animate={{ rotate: [0, 20, 0, 20, 0], scale: [1, 1.1, 1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Hand size={30} />
            </motion.div>
          )}

          {step === 'COMPLETING' && (
            <motion.div 
              className="absolute -left-5 -top-5 text-fuchsia-400 drop-shadow-[0_0_8px_currentColor] z-20 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Sparkles size={24} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
