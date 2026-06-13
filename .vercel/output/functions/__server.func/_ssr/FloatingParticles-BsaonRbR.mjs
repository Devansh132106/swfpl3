import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
function FloatingParticles({ count = 18 }) {
  const [particles, setParticles] = reactExports.useState([]);
  reactExports.useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 8 + Math.random() * 28,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 10
      }))
    );
  }, [count]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { y: 0, opacity: 0 },
      animate: { y: [-30, 30, -30], opacity: [0.2, 0.6, 0.2], rotate: [0, 360] },
      transition: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" },
      className: "absolute",
      style: { left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full w-full rounded-full",
          style: {
            background: "radial-gradient(circle at 30% 30%, oklch(0.95 0.05 90), oklch(0.25 0.02 250) 70%)",
            boxShadow: "inset -2px -2px 6px oklch(0 0 0 / 0.4)",
            opacity: 0.7
          }
        }
      )
    },
    p.id
  )) });
}
export {
  FloatingParticles as F
};
