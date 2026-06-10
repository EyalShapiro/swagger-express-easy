const PREFIX = '[swagger-express-easy]';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';

/**
 * Information collected during document generation, used for the summary log.
 */
export interface SwaggerSummaryInfo {
  /** Number of routes scanned from the live Express app. */
  routeCount: number;
  /** Absolute URL path where Swagger UI is mounted (e.g. '/api-docs'). */
  swaggerPath: string;
  /** Optional base server URL (e.g. 'http://localhost:3002'). */
  serverUrl?: string;
  /** Absolute path of the generated JSON output file. */
  outputFile: string;
}

/**
 * Prints a single-block summary after Swagger document generation completes.
 *
 * @param {SwaggerSummaryInfo} info - Summary data collected during generation.
 */
export function printSummary(info: SwaggerSummaryInfo): void {
  const { routeCount, swaggerPath, serverUrl, outputFile } = info;
  const uiUrl = serverUrl ? `${serverUrl}${swaggerPath}` : swaggerPath;

  const lines: string[] = [
    `${CYAN}${PREFIX}${RESET}`,
    `  ${GREEN}✓${RESET} OpenAPI document generated → ${outputFile}`,
    `  ${GREEN}✓${RESET} Routes scanned: ${routeCount}`,
    `  ${GREEN}✓${RESET} Swagger UI: ${uiUrl}`,
  ];

  if (serverUrl) {
    lines.push(`  ${GREEN}✓${RESET} Server: ${serverUrl}`);
  }

  console.info(lines.join('\n'));
}

/**
 * Logs a warning (shown once per unique message).
 *
 * @param {string} message - Warning message to display.
 */
export function logWarning(message: string): void {
  console.warn(`${YELLOW}${PREFIX} Warning: ${message}${RESET}`);
}

/**
 * Logs an error.
 *
 * @param {string} message - Error description.
 * @param {unknown} [err] - Optional underlying error object.
 */
export function logError(message: string, err?: unknown): void {
  console.error(`${RED}${PREFIX} Error: ${message}${RESET}`, err ?? '');
}
