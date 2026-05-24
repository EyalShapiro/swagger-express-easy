export * from './server.config';

export * from './origins';

/**
 * Secret key token used for signing/verifying tokens
 */
export const SECRET_TOKEN = process.env?.SECRET_TOKEN || 'test';
