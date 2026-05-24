export async function simulateAsyncError(): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      reject(new Error('Async operation failed'));
    }, 100);

    // success example
    setTimeout(() => {
      clearTimeout(timeout);

      resolve('Async operation success');
    }, 50);
  });
}

export async function simulateAsyncOperation(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5;

      if (success) {
        resolve('Async operation success');
      } else {
        reject(new Error('Async operation failed'));
      }
    }, 1000);
  });
}
