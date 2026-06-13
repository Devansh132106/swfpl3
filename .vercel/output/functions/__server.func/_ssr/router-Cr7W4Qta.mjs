import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as notFound } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-CzT3Q6f0.mjs";
import { d as driveImageDirectUrls } from "./drivePhoto-BlqciLZ2.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const appCss = "/assets/styles-FWot1rA-.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center stadium-bg px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong max-w-md rounded-2xl p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold neon-text", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "This page is offside." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground neon-glow", children: "Back to lobby" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "root" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center stadium-bg px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong max-w-md rounded-2xl p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Something broke" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          router2.invalidate();
          reset();
        },
        className: "mt-6 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground neon-glow",
        children: "Try again"
      }
    )
  ] }) });
}
const Route$4 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SWFPL 6.0 — Live Auction Platform" },
      { name: "description", content: "Premium football league auction management — open, veteran and female drafts with real-time team building." },
      { property: "og:title", content: "SWFPL 6.0 — Live Auction Platform" },
      { property: "og:description", content: "Premium football league auction management platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$4.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const BASE_URL = "";
const Route$3 = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          "/",
          "/auction/open",
          "/auction/veteran",
          "/auction/female",
          "/auction/kids-u11",
          "/auction/kids-u14"
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
          `</urlset>`
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      }
    }
  }
});
const $$splitComponentImporter$1 = () => import("./index-OgUPQSI-.mjs");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "SWFPL 6.0 — Live Auction Platform"
    }, {
      name: "description",
      content: "Run premium football league auctions — Open, Veteran, Female, and Kids drafts with live team building."
    }, {
      property: "og:title",
      content: "SWFPL 6.0 — Live Auction Platform"
    }, {
      property: "og:description",
      content: "Run premium football league auctions live."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const SHEETS = {
  openPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=1475985538#gid=1475985538",
  veteranPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=997517097#gid=997517097",
  femalePlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=232303448#gid=232303448",
  kidsU11Players: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=2085525280#gid=2085525280",
  kidsU14Players: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=1162699620#gid=1162699620"
};
const AUCTION_META = {
  open: {
    title: "Open Auction",
    subtitle: "Main league draft",
    accent: "from-[oklch(0.72_0.18_145)] to-[oklch(0.62_0.22_165)]",
    sheetKey: "openPlayers"
  },
  veteran: {
    title: "Veteran Auction",
    subtitle: "Legends of the game",
    accent: "from-[oklch(0.72_0.18_55)] to-[oklch(0.62_0.22_35)]",
    sheetKey: "veteranPlayers"
  },
  female: {
    title: "Female Auction",
    subtitle: "Women's championship draft",
    accent: "from-[oklch(0.72_0.18_340)] to-[oklch(0.62_0.22_310)]",
    sheetKey: "femalePlayers"
  },
  "kids-u11": {
    title: "Kids (U11)",
    subtitle: "11 and under draft",
    accent: "from-[oklch(0.75_0.18_200)] to-[oklch(0.65_0.22_220)]",
    sheetKey: "kidsU11Players"
  },
  "kids-u14": {
    title: "Kids (U14)",
    subtitle: "14 and under draft",
    accent: "from-[oklch(0.78_0.2_130)] to-[oklch(0.68_0.22_110)]",
    sheetKey: "kidsU14Players"
  }
};
const AUCTION_TYPES = Object.keys(AUCTION_META);
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const loadPlayers = createServerFn({
  method: "GET"
}).validator(objectType({
  url: stringType().min(1),
  auctionType: stringType().min(1)
})).handler(createSsrRpc("788cb3f044dc896b914af7d4d5649f1a6496e105be9fe6f6d2c466419caf549f"));
const $$splitNotFoundComponentImporter = () => import("./auction._type-Cr4sL5to.mjs");
const $$splitErrorComponentImporter = () => import("./auction._type-D6cfMVTw.mjs");
const $$splitComponentImporter = () => import("./auction._type-B6iZr5ah.mjs");
const VALID = AUCTION_TYPES;
const Route$1 = createFileRoute("/auction/$type")({
  beforeLoad: ({
    params
  }) => {
    if (!VALID.includes(params.type)) throw notFound();
  },
  loader: async ({
    context,
    params
  }) => {
    const type = params.type;
    const meta = AUCTION_META[type];
    const playersUrl = SHEETS[meta.sheetKey];
    if (!playersUrl) return;
    await context.queryClient.ensureQueryData({
      queryKey: ["players", type, "v3"],
      queryFn: () => loadPlayers({
        data: {
          url: playersUrl,
          auctionType: type
        }
      }),
      staleTime: 5 * 6e4
    });
  },
  head: ({
    params
  }) => {
    const meta = AUCTION_META[params.type];
    const title = `${meta?.title ?? "Auction"} — Live Draft`;
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: `${meta?.title} live draft floor.`
      }, {
        property: "og:title",
        content: title
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const Route = createFileRoute("/api/drive-image/$fileId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const fileId = params.fileId;
        if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
          return new Response("Invalid file id", { status: 400 });
        }
        for (const url of driveImageDirectUrls(fileId)) {
          try {
            const res = await fetch(url, { redirect: "follow" });
            if (!res.ok) continue;
            const contentType = res.headers.get("content-type") ?? "";
            if (contentType.includes("text/html")) continue;
            const body = await res.arrayBuffer();
            if (body.byteLength < 100) continue;
            return new Response(body, {
              headers: {
                "Content-Type": contentType.split(";")[0] || "image/jpeg",
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
              }
            });
          } catch {
          }
        }
        return new Response("Image not found", { status: 404 });
      }
    }
  }
});
const SitemapDotxmlRoute = Route$3.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$4
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$4
});
const AuctionTypeRoute = Route$1.update({
  id: "/auction/$type",
  path: "/auction/$type",
  getParentRoute: () => Route$4
});
const ApiDriveImageFileIdRoute = Route.update({
  id: "/api/drive-image/$fileId",
  path: "/api/drive-image/$fileId",
  getParentRoute: () => Route$4
});
const rootRouteChildren = {
  IndexRoute,
  SitemapDotxmlRoute,
  AuctionTypeRoute,
  ApiDriveImageFileIdRoute
};
const routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AUCTION_META as A,
  Route$1 as R,
  SHEETS as S,
  loadPlayers as l,
  router as r
};
