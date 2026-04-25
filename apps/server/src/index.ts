import { readConfigFromEnv } from "./config.js";
import { buildServer } from "./server.js";

async function main(): Promise<void> {
  const config = readConfigFromEnv();
  const { app } = await buildServer({ config });

  const stop = async (signal: string) => {
    app.log.info(`received ${signal}, closing`);
    try {
      await app.close();
    } catch (err) {
      app.log.error({ err }, "error during close");
      process.exit(1);
    }
    process.exit(0);
  };
  process.on("SIGTERM", () => void stop("SIGTERM"));
  process.on("SIGINT", () => void stop("SIGINT"));

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (err) {
    app.log.error({ err }, "failed to start");
    process.exit(1);
  }
}

void main();
