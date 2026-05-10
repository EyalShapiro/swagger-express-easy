import { HOST, IS_PROD } from './server.config';

const ORIGINALS_OPTION_DEV = Object.freeze(
  IS_PROD ? [] : ['localhost:3000', 'localhost:8000', 'localhost:5173', '', HOST],
);
export const ORIGINALS_OPTION = [HOST, 'github', ...ORIGINALS_OPTION_DEV];
