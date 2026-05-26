import type { SwaggerConfigOptions, ResolvedSwaggerConfig } from '../types/internal';
import { buildSecuritySchemes } from './security';

const DEFAULT_OPTIONS: ResolvedSwaggerConfig = {
  outputFile: './swagger-output.json',
  basePath: '/',
  caseSensitive: false,
  debug: false,
  tagsOrder: [],
};

/**
 * Resolves the configuration options, applying defaults.
 * @param {SwaggerConfigOptions} options
 * @returns {ResolvedSwaggerConfig}
 * @example
 * buildSwaggerConfig({ outputFile: './swagger.json' });
 */
export function buildSwaggerConfig(options?: SwaggerConfigOptions): ResolvedSwaggerConfig {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...(options || {}) };

  if (mergedOptions.bearerAuth || mergedOptions.apiKeyAuth) {
    const defaultSecurity = buildSecuritySchemes(
      mergedOptions.bearerAuth,
      mergedOptions.apiKeyAuth,
    );
    mergedOptions.security = { ...(mergedOptions.security || {}), ...defaultSecurity };
  }

  return mergedOptions;
}
