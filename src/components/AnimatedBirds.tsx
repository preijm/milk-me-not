import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bird } from "lucide-react";

interface FlyingBird {
  id: number;
  startY: number;
  duration: number;
}

const AnimatedBirds = () => {
  const [birds, setBirds] = useState<FlyingBird[]>([]);

  useEffect(() => {
    const spawnBird = () => {
      const newBird: FlyingBird = {
        id: Date.now(),
        startY: Math.random() * 60 + 10, // Random Y position between 10% and 70%
        duration: Math.random() * 1.5 + 2, // Duration between 2-3.5 seconds
      };

      setBirds((prev) => [...prev, newBird]);

      // Remove bird after animation completes
      setTimeout(() => {
        setBirds((prev) => prev.filter((bird) => bird.id !== newBird.id));
      }, newBird.duration * 1000);
    };

    // Spawn first bird after 2 seconds
    const firstTimer = setTimeout(spawnBird, 2000);

    // Then spawn birds at random intervals (every 8-15 seconds)
    const interval = setInterval(() => {
      spawnBird();
    }, Math.random() * 7000 + 8000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {birds.map((bird) => (
          <motion.div
            key={bird.id}
            className="absolute text-amber-600/40"
            initial={{ 
              x: "-10%", 
              y: `${bird.startY}%`,
              rotate: 0,
            }}
            animate={{ 
              x: "110%",
              y: `${bird.startY + (Math.random() * 20 - 10)}%`, // Slight wave motion
              rotate: [0, 5, -5, 0], // Wing flap effect
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: bird.duration,
              ease: "linear",
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <Bird size={32} className="drop-shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedBirds;
