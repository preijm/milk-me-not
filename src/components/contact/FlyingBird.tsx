import { Bird } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyingBirdProps {
  birdIds: number[];
}

export const FlyingBird = ({ birdIds }: FlyingBirdProps) => {
  return (
    <AnimatePresence>
      {birdIds.map((birdId) => (
        <motion.div
          key={birdId}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: [0, 100, 300, 600],
            y: [0, -50, -150, -300],
            opacity: [1, 1, 0.5, 0],
            rotate: [0, 15, 30, 45],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-4 left-4 pointer-events-none z-50"
        >
          <Bird className="w-6 h-6 sm:w-8 sm:h-8 text-score-fair" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
