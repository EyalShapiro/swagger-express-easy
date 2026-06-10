import fs from 'fs';
import path from 'path';
import { logWarning } from '../utils/logger';

export type WatcherCallback = () => void | Promise<void>;

/**
 * File watcher implementation using fs.watch.
 * Supports debouncing to prevent multiple rapid triggers when files change.
 */
export class FileWatcher {
  private activeWatchers: fs.FSWatcher[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceMs = 300;
  private isWatching = false;

  constructor(private callback: WatcherCallback) {}

  /**
   * Starts watching the specified directories for changes.
   *
   * @param {string[]} pathsToWatch - Array of absolute or relative paths to watch.
   */
  start(pathsToWatch: string[]): void {
    if (this.isWatching) {
      this.stop();
    }

    this.isWatching = true;
    const resolvedPaths = new Set(pathsToWatch.map((p) => path.resolve(p)));

    // Try to find common parent directories to avoid watching same files multiple times
    // For simplicity we just watch the provided paths or the src directory
    const defaultWatchDir = path.resolve(process.cwd(), 'src');
    if (fs.existsSync(defaultWatchDir)) {
      resolvedPaths.add(defaultWatchDir);
    }

    for (const dirPath of resolvedPaths) {
      if (fs.existsSync(dirPath)) {
        try {
          // fs.watch with recursive: true is supported on macOS and Windows
          const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
            if (filename && this.shouldIgnore(filename)) {
              return;
            }
            this.triggerChange();
          });
          
          watcher.on('error', (err) => {
            logWarning(`Watcher error on ${dirPath}: ${err.message}`);
          });

          this.activeWatchers.push(watcher);
        } catch (err) {
          logWarning(`Could not start watcher for ${dirPath}: ${err}`);
        }
      }
    }
  }

  /**
   * Stops all active file watchers.
   */
  stop(): void {
    this.isWatching = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    for (const watcher of this.activeWatchers) {
      watcher.close();
    }
    this.activeWatchers = [];
  }

  private triggerChange(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      if (this.isWatching) {
        Promise.resolve(this.callback()).catch((err) => {
          logWarning(`Error during watch callback: ${err}`);
        });
      }
    }, this.debounceMs);
  }

  private shouldIgnore(filename: string): boolean {
    // Ignore node_modules, dist, hidden files, and output json files
    return (
      filename.includes('node_modules') ||
      filename.includes('.git') ||
      filename.endsWith('swagger-output.json') ||
      filename.endsWith('swagger.json')
    );
  }
}
