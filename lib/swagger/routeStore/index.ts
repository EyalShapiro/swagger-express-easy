/**
 * Definition of a single Swagger route.
 */
export interface SwaggerRouteDefinition {
  /** HTTP method (get, post, put, delete, patch, etc.) */
  method: string;
  /** Full path including parameters (e.g. /api/users/{id}) */
  path: string;
  /** Metadata for the route (description, summary) */
  description?: {
    text?: string;
    summary?: string;
  };
  /** Request body schema or example */
  body?: any;
  /** List of parameters (query, path, header) */
  parameters?: any[];
  /** Expected responses and their schemas */
  responses?: Record<string, any>;
  /** Optional tag for grouping in UI */
  tag?: string;
  /** Multiple tags for grouping */
  tags?: string[];
  /** Media types the route consumes */
  consumes?: string[];
  /** Media types the route produces */
  produces?: string[];
  /** Security requirements for this route */
  security?: Array<Record<string, string[]>>;
}

/**
 * Singleton store for manual route definitions.
 */
export class SwaggerRouteStore {
  private static instance: SwaggerRouteStore;
  private routes: SwaggerRouteDefinition[] = [];

  private constructor() {}

  public static getData(): SwaggerRouteStore {
    if (!SwaggerRouteStore.instance) {
      SwaggerRouteStore.instance = new SwaggerRouteStore();
    }
    return SwaggerRouteStore.instance;
  }

  public static addRoute(route: SwaggerRouteDefinition | SwaggerRouteDefinition[]): void {
    const store = SwaggerRouteStore.getData();
    if (Array.isArray(route)) {
      store.routes.push(...route);
    } else {
      store.routes.push(route);
    }
  }

  public static getRouteList(): SwaggerRouteDefinition[] {
    return SwaggerRouteStore.getData().routes;
  }

  public clear(): void {
    this.routes = [];
  }
}

/**
 * Helper to register one or more routes manually.
 * Supports both a single route object or an array of route objects.
 */
export function createSwaggerRoute(
  routeDef: SwaggerRouteDefinition | SwaggerRouteDefinition[],
): void {
  SwaggerRouteStore.addRoute(routeDef);
}

/**
 * Alias for createSwaggerRoute. Supports single or multiple routes.
 */
export const createSwaggerRoutes = createSwaggerRoute;
