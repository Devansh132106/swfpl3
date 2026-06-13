import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchPlayers } from "./sheets";

/** Fetch players on the server (avoids browser CORS / client-only fetch issues). */
export const loadPlayers = createServerFn({ method: "GET" })
  .validator(z.object({ url: z.string().min(1) }))
  .handler(async ({ data }) => fetchPlayers(data.url));
