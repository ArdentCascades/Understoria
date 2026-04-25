import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    status: "ok",
    // No version, no member counts, no host info — minimal surface so the
    // endpoint can stay public without leaking shape data about the node.
  }));
}
