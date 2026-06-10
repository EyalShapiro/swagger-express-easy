import fs from 'fs';
import path from 'path';
import { FileWatcher } from '../../lib/core/watcher';

describe('FileWatcher', () => {
  let watcher: FileWatcher;
  let callback: jest.Mock;
  const testDir = path.join(__dirname, 'test-watch-dir');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  let mockWatch: jest.SpyInstance;
  let watchListener: (event: string, filename: string) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    callback = jest.fn();
    watcher = new FileWatcher(callback);

    mockWatch = jest.spyOn(fs, 'watch').mockImplementation(((
      filename: fs.PathLike,
      options: fs.WatchOptions | string | undefined | null,
      listener?: (event: fs.WatchEventType, filename: string) => void,
    ) => {
      if (listener) {
        watchListener = listener as any;
      }
      return {
        on: jest.fn(),
        close: jest.fn(),
      } as any;
    }) as any);
  });

  afterEach(() => {
    watcher.stop();
    mockWatch.mockRestore();
    jest.useRealTimers();
  });

  test('should trigger callback when file changes', () => {
    watcher.start([testDir]);

    const testFile = path.join(testDir, 'test.ts');
    if (watchListener) watchListener('change', 'test.ts');

    jest.advanceTimersByTime(350); // Advance past debounce delay

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should debounce rapid file changes', () => {
    watcher.start([testDir]);

    // Rapid changes
    if (watchListener) {
      watchListener('change', 'test.ts');
      jest.advanceTimersByTime(100);
      watchListener('change', 'test.ts');
      jest.advanceTimersByTime(100);
      watchListener('change', 'test.ts');
    }

    // Total time is 200ms, less than 300ms debounce
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(350);

    // Should only be called once despite 3 changes
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should ignore swagger.json files', () => {
    watcher.start([testDir]);

    if (watchListener) watchListener('change', 'swagger-output.json');

    jest.advanceTimersByTime(350);

    expect(callback).not.toHaveBeenCalled();
  });
});
