import type { SwaggerConfigOptions } from '../types/internal';
import type { SwaggerSecurityScheme } from '../types/swagger';

/**
 * Normalizes security configurations to OpenAPI 3.0 `securitySchemes`.
 *
 * @param {SwaggerConfigOptions['bearerAuth']} [bearerAuth] - Enable JWT bearer auth, or pass config.
 * @param {SwaggerConfigOptions['apiKeyAuth']} [apiKeyAuth] - Enable API key auth, or pass config.
 * @returns {Record<string, SwaggerSecurityScheme>} Map of scheme names to their OpenAPI definitions.
 * @example
 * buildSecuritySchemes(true, { name: 'X-API-KEY', in: 'header' });
 */
export function buildSecuritySchemes(
  bearerAuth?: SwaggerConfigOptions['bearerAuth'],
  apiKeyAuth?: SwaggerConfigOptions['apiKeyAuth'],
): Record<string, SwaggerSecurityScheme> {
  const securitySchemes: Record<string, SwaggerSecurityScheme> = {};

  if (bearerAuth) {
    securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      ...(typeof bearerAuth === 'object' ? bearerAuth : {}),
    };
  }

  if (apiKeyAuth) {
    securitySchemes.apiKeyAuth = {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      ...(typeof apiKeyAuth === 'object' ? apiKeyAuth : {}),
    };
  }

  return securitySchemes;
}
