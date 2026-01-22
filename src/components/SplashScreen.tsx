import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import DyaLogo from "../assets/dya.svg?react";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({
  onComplete,
  duration = 2500,
}: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-cyber opacity-30" />

          {/* Animated rings */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full border border-electric/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full border border-electric/10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full border border-electric/5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />

          {/* Logo container */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            {/* Logo with glow effect */}
            <motion.div
              className="relative"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(0, 212, 255, 0.3))",
                  "drop-shadow(0 0 40px rgba(0, 212, 255, 0.5))",
                  "drop-shadow(0 0 20px rgba(0, 212, 255, 0.3))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <DyaLogo className="w-32 h-32 text-white fill-white [&_polygon]:fill-white" />
            </motion.div>

            {/* Brand name */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h1 className="text-4xl font-light tracking-[0.3em] text-white">
                DYA
              </h1>
              <p className="text-sm font-light tracking-[0.2em] text-white/50 uppercase">
                Studio
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="flex gap-1 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-electric"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="absolute bottom-12 text-xs font-light tracking-wider text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Configure your keyboard
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
