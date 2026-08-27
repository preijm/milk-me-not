import { Bird } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { planFlight } from "./birdFlight";

interface FlyingBirdProps {
  birdIds: number[];
}

/**
 * The Postduif easter egg.
 *
 * Every bird used to fly the identical path — `x: [0, 100, 300, 600]`,
 * `y: [0, -50, -150, -300]`, the same rotation, the same two seconds — so five
 * clicks produced five copies of one bird strung along one diagonal. It read
 * as a sprite repeated rather than as birds, which is what it was.
 *
 * Now each bird gets its own flight, and the joke is in the motion. The card
 * says these pigeons are "learning the difference between your address and a
 * bread crumb trail", so roughly one in five sets off confidently, thinks
 * better of it, and comes back the other way.
 *
 * The bird itself is lucide's outline, which is what it always was. It was
 * briefly a drawn pigeon with a beating wing, and the wing was the only thing
 * the drawing bought — at this size and this speed a thin silhouette reads
 * better than a solid one, and it is the shape this page has always had.
 */

export const FlyingBird = ({ birdIds }: FlyingBirdProps) => {
  const still = useReducedMotion() ?? false;
  const viewport = typeof window === "undefined" ? 1024 : window.innerWidth;

  return (
    <AnimatePresence>
      {birdIds.map((birdId) => {
        const f = planFlight(birdId, viewport);
        return (
          <motion.div
            key={birdId}
            initial={{ x: 0, y: 0, opacity: 0 }}
            // Somebody who has asked for less motion still gets the bird —
            // they just get it sitting there rather than crossing the screen.
            animate={
              still
                ? { opacity: [0, 1, 1, 0] }
                : { x: f.x, y: f.y, rotate: f.rotate, opacity: f.opacity }
            }
            exit={{ opacity: 0 }}
            // Linear, deliberately. The curve and its easing are both in the
            // sample positions; an easing here would be applied to every pair
            // of them in turn, which is what made the old five-waypoint
            // version stutter its way across the screen.
            transition={{ duration: still ? 1.2 : f.duration, ease: "linear" }}
            className="pointer-events-none absolute left-6 top-8 z-50 text-score-fair"
          >
            {/* Facing lives on its own element. scaleX and scale compose into
                one transform, and a bird that turns round — the lost one in
                five — animates scaleX from 1 to -1, which squashed it flat
                through zero on the way past. Here it is only ever mirroring
                a fixed-size child. */}
            <motion.div
              style={{ transformOrigin: "center" }}
              initial={{ scaleX: f.scaleX[0], scale: f.scale }}
              animate={still ? { scale: f.scale } : { scaleX: f.scaleX, scale: f.scale }}
              transition={{ duration: still ? 1.2 : f.duration, ease: "linear" }}
            >
              <Bird className="h-9 w-9" aria-hidden />
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};
