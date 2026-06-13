import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle { id: number; left: number; top: number; size: number; delay: number; duration: number; }

export function FloatingParticles({ count = 18 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 8 + Math.random() * 28,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 10,
      })),
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-30, 30, -30], opacity: [0.2, 0.6, 0.2], rotate: [0, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          className="absolute"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, oklch(0.95 0.05 90), oklch(0.25 0.02 250) 70%)",
              boxShadow: "inset -2px -2px 6px oklch(0 0 0 / 0.4)",
              opacity: 0.7,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
