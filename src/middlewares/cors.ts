import { CorsOptions } from 'cors';
import { ORIGINALS_OPTION } from '../config';
import { getUrlHost } from '../utils/getUrlOrigins';

/**
 * CORS configuration object
 * @typedef {Object} CorsOptions
 * @property {CustomOrigin} origin - Function to validate request origin
 * @property {number} optionsSuccessStatus - Status code to return for successful OPTIONS requests
 */

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (ORIGINALS_OPTION.includes(getUrlHost(origin))) {
      callback(null, true);
    } else {
      console.warn(`CORS policy does not allow access from origin: ${origin}`);
      callback(new Error('Not allowed by CORS!'));
    }
  },
  optionsSuccessStatus: 200,
};
