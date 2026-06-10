import type http from 'http';

/**
 * Enhanced server error handler that properly warns and terminates
 * the process when a port is in use, rather than failing silently.
 *
 * @param {http.Server} server - The Node.js HTTP server instance.
 * @param {string | number} port - The port the server is binding to.
 * @returns {void}
 */
export function handleServerErrors(server: http.Server, port: string | number) {
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\x1b[31m✖ Error: Port ${port} already in use.\x1b[0m`);
      process.exit(1);
    }
    throw error;
  });
}
