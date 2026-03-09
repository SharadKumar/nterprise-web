import { createServer } from "node:net";

/** Find a free port, starting from the preferred port */
export function findFreePort(preferred: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(preferred, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : preferred;
      server.close(() => resolve(port));
    });
    server.on("error", () => {
      // preferred port taken — let OS pick one
      const server2 = createServer();
      server2.listen(0, () => {
        const addr = server2.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        server2.close(() => resolve(port));
      });
      server2.on("error", reject);
    });
  });
}
