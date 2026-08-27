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
 */

/**
 * A pigeon, drawn rather than borrowed. The lucide glyph this replaces is a
 * single static outline, and a bird that does not beat its wings is a paper
 * aeroplane. The wing is a lighter shape over the body so it reads at 36px.
 */
const Pigeon = ({ flap, still }: { flap: number; still: boolean }) => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" aria-hidden>
    <path d="M2.2 11.4 7.4 12.7 7.4 15.9Z" fill="currentColor" />
    <ellipse cx="11.2" cy="13.2" rx="5.3" ry="3.7" fill="currentColor" />
    <circle cx="16.6" cy="9.5" r="2.7" fill="currentColor" />
    <path d="M18.9 8.9 21.9 9.8 18.9 10.7Z" fill="currentColor" />
    <circle cx="17.5" cy="8.8" r="0.55" fill="#fff" opacity="0.8" />
    <motion.path
      d="M8.8 12.5C10.7 8.6 14.2 8.1 15.5 10.7 13.9 13 11.2 14 8.8 12.5Z"
      fill="#fff"
      opacity="0.45"
      style={{ transformOrigin: "9.6px 12.5px" }}
      animate={still ? undefined : { rotate: [-4, -42, -4], scaleY: [1, 0.7, 1] }}
      transition={still ? undefined : { duration: flap, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

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
            initial={{ x: 0, y: 0, opacity: 0, scale: f.scale * 0.6 }}
            // Somebody who has asked for less motion still gets the bird —
            // they just get it sitting there rather than crossing the screen.
            animate={
              still
                ? { opacity: [0, 1, 1, 0], scale: f.scale }
                : {
                    x: f.x,
                    y: f.y,
                    rotate: f.rotate,
                    scaleX: f.scaleX,
                    scale: f.scale,
                    opacity: [0, 1, 1, 0.9, 0],
                  }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: still ? 1.2 : f.duration, ease: "easeOut" }}
            className="pointer-events-none absolute left-6 top-8 z-50 text-score-fair"
          >
            <Pigeon flap={f.flap} still={still} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};
