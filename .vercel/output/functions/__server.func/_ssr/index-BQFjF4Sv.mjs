import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as FloatingParticles } from "./FloatingParticles-BsaonRbR.mjs";
import { A as AUCTION_META } from "./router-J1jmO_o-.mjs";
import "../_libs/seroval.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./server-DAqtlgs9.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/zod.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const cards = [{
  type: "open",
  tagline: "Main league draft for every athlete in the open category."
}, {
  type: "veteran",
  tagline: "Legends and seasoned pros battle for the squad."
}, {
  type: "female",
  tagline: "Women's championship draft — the next icons."
}];
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen overflow-hidden stadium-bg animate-gradient-pan", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingParticles, { count: 22 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-full glass", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl", children: "⚽" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-bold tracking-widest", children: "SWFPL 6.0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground -mt-0.5", children: "AUCTION SYSTEM" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden text-xs uppercase tracking-[0.3em] text-muted-foreground md:block", children: "SWFPL 6.0 · Live Draft" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-1 flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 20
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.6
        }, className: "mb-2 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.22_150)] animate-pulse" }),
          "Live auction floor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.h1, { initial: {
          opacity: 0,
          y: 30
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.7,
          delay: 0.1
        }, className: "mt-6 font-display text-5xl font-black leading-tight md:text-7xl", children: [
          "Build Your ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "neon-text bg-gradient-to-r from-[oklch(0.85_0.18_140)] to-[oklch(0.7_0.22_200)] bg-clip-text text-transparent", children: "Dream Squad" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.p, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, transition: {
          delay: 0.3,
          duration: 0.6
        }, className: "mt-5 max-w-2xl text-base text-muted-foreground md:text-lg", children: "A premium football auction platform — pick a category, run the draft, and let the stadium roar." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-3", children: cards.map((c, i) => {
          const meta = AUCTION_META[c.type];
          return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
            opacity: 0,
            y: 40
          }, animate: {
            opacity: 1,
            y: 0
          }, transition: {
            delay: 0.2 + i * 0.12,
            duration: 0.6,
            type: "spring"
          }, whileHover: {
            y: -8,
            rotateX: 6,
            rotateY: -4,
            scale: 1.02
          }, style: {
            transformStyle: "preserve-3d",
            perspective: 1e3
          }, className: "group relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auction/$type", params: {
            type: c.type
          }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong relative overflow-hidden rounded-3xl p-8 transition-shadow animate-border-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -inset-px rounded-3xl bg-gradient-to-br ${meta.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 inline-flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${meta.accent} shadow-2xl`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "⚽" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl font-bold", children: meta.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground min-h-[3rem]", children: c.tagline }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-widest text-muted-foreground", children: "Enter draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { className: "font-display text-xl", initial: {
                  x: 0
                }, whileHover: {
                  x: 4
                }, children: "→" })
              ] })
            ] })
          ] }) }) }, c.type);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "pb-2 pt-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground", children: "Built for live stadium auctions" })
    ] })
  ] });
}
export {
  Landing as component
};
