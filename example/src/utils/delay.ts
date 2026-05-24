export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const randomDelay = async (min = 200, max = 2000): Promise<number> => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);

  await delay(ms);

  return ms;
};

export const randomFail = async (chance = 0.2) => {
  const shouldFail = Math.random() < chance;

  if (shouldFail) {
    return Promise.reject(new Error('Fake DB error'));
  }
  return Promise.resolve(true);
};

export async function fakeDBRequest<T>(
  data: T,
  options?: {
    minDelay?: number;
    maxDelay?: number;
    failChance?: number;
  },
): Promise<T> {
  const { minDelay = 300, maxDelay = 1500, failChance = 0.1 } = options || {};

  await randomDelay(minDelay, maxDelay);

  randomFail(failChance);

  return data;
}
