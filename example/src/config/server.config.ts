export const NODE_ENV = (process.env.NODE_ENV || 'development').trim().toLowerCase();
export const IS_PROD = ['production', 'prod'].includes(NODE_ENV);

/**
 * Port number for server binding
 */
export const PORT = Number(IS_PROD ? 8080 : process.env.PORT || 3000);
export const HOST = `localhost:${PORT}`;
