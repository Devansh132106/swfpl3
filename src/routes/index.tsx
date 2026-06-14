import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/auction/FloatingParticles";
import { AUCTION_META, type AuctionType } from "@/config/sheets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SWFPL 6.0 — Live Auction Platform" },
      { name: "description", content: "Run premium football league auctions — Open, Veteran, Female, and Kids drafts with live team building." },
      { property: "og:title", content: "SWFPL 6.0 — Live Auction Platform" },
      { property: "og:description", content: "Run premium football league auctions live." },
    ],
  }),
  component: Landing,
});

const cards: { type: AuctionType; tagline: string }[] = [
  { type: "open", tagline: "8 country teams · 5–6 players each, 3 auction groups." },
  { type: "veteran", tagline: "3 teams · 5–6 players each from the auction." },
  { type: "female", tagline: "Women's lottery — Team 1 & Team 2, 5–6 players each." },
  { type: "kids-u11", tagline: "U11 lottery — 3 teams, 4–5 players each." },
  { type: "kids-u14", tagline: "U15 auction — 3 teams, 4–5 players each." },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden stadium-bg animate-gradient-pan">
      <FloatingParticles count={22} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full glass">
              <span className="font-display text-xl">⚽</span>
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-widest">SWFPL 6.0</div>
              <div className="text-xs text-muted-foreground -mt-0.5">AUCTION SYSTEM</div>
            </div>
          </div>
          <div className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground md:block">
            SWFPL 6.0 · Live Draft
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-2 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.22_150)] animate-pulse" />
            Live auction floor
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-display text-5xl font-black leading-tight md:text-7xl"
          >
            Build Your <span className="neon-text bg-gradient-to-r from-[oklch(0.85_0.18_140)] to-[oklch(0.7_0.22_200)] bg-clip-text text-transparent">Dream Squad</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            A premium football auction platform — pick a category, run the draft, and let the stadium roar.
          </motion.p>

          <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => {
              const meta = AUCTION_META[c.type];
              return (
                <motion.div
                  key={c.type}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.6, type: "spring" }}
                  whileHover={{ y: -8, rotateX: 6, rotateY: -4, scale: 1.02 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  className="group relative"
                >
                  <Link
                    to="/auction/$type"
                    params={{ type: c.type }}
                    className="block"
                  >
                    <div className="glass-strong relative overflow-hidden rounded-3xl p-8 transition-shadow animate-border-glow">
                      <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${meta.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
                      <div className="relative">
                        <div className="mb-6 inline-flex items-center justify-center">
                          <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${meta.accent} shadow-2xl`}>
                            <span className="text-4xl">⚽</span>
                          </div>
                        </div>
                        <h3 className="font-display text-2xl font-bold">{meta.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground min-h-[3rem]">{c.tagline}</p>
                        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
                          <span className="uppercase tracking-widest text-muted-foreground">Enter draft</span>
                          <motion.span
                            className="font-display text-xl"
                            initial={{ x: 0 }} whileHover={{ x: 4 }}
                          >→</motion.span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="pb-2 pt-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Built for live stadium auctions
        </footer>
      </div>
    </main>
  );
}
