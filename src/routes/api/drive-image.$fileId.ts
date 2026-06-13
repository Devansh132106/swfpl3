import { createFileRoute } from "@tanstack/react-router";

import { driveImageDirectUrls } from "@/lib/auction/drivePhoto";

export const Route = createFileRoute("/api/drive-image/$fileId")({
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
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
              },
            });
          } catch {
            // try next URL
          }
        }

        return new Response("Image not found", { status: 404 });
      },
    },
  },
});
