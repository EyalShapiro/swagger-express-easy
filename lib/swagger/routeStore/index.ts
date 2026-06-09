import { SwaggerRouteDefinition } from './type';

export * from './type';

/**
 * Singleton store for manual route definitions.
 */
export class SwaggerRouteStore {
  private static instance: SwaggerRouteStore;
  private routes: SwaggerRouteDefinition[] = [];

  private constructor() {}

  /**
   * Gets the singleton instance of the route store.
   * @returns {SwaggerRouteStore} The shared store instance.
   */
  public static getData(): SwaggerRouteStore {
    if (!SwaggerRouteStore.instance) {
      SwaggerRouteStore.instance = new SwaggerRouteStore();
    }
    return SwaggerRouteStore.instance;
  }

  /**
   * Registers one or more route definitions. Duplicate routes (same path+method) are overwritten.
   *
   * @param {SwaggerRouteDefinition | SwaggerRouteDefinition[]} route - Route definition(s) to add.
   * @returns {void}
   */
  public static addRoute(route: SwaggerRouteDefinition | SwaggerRouteDefinition[]): void {
    const store = SwaggerRouteStore.getData();
    const addSingle = (r: SwaggerRouteDefinition) => {
      const idx = store.routes.findIndex(
        ({ method, path }) =>
          path.toLowerCase() === r.path.toLowerCase() &&
          method.toLowerCase() === r.method.toLowerCase(),
      );
      if (idx !== -1) store.routes[idx] = r;
      else store.routes.push(r);
    };
    if (Array.isArray(route)) route.forEach(addSingle);
    else addSingle(route);
  }

  /**
   * Returns all registered route definitions.
   * @returns {SwaggerRouteDefinition[]} Flat list of stored routes.
   */
  public static getRouteList(): SwaggerRouteDefinition[] {
    return SwaggerRouteStore.getData().routes ?? [];
  }

  /**
   * Clears all registered routes.
   * @returns {void}
   */
  public clear(): void {
    this.routes = [];
  }
}

/**
 * Helper to register one or more routes manually.
 * Supports both a single route object or an array of route objects.
 *
 * @param {SwaggerRouteDefinition | SwaggerRouteDefinition[]} routeDef - Route definition(s) to register.
 * @returns {void}
 * @example
 * createSwaggerRoute({ method: 'get', path: '/health' });
 */
export function createSwaggerRoute(
  routeDef: SwaggerRouteDefinition | SwaggerRouteDefinition[],
): void {
  SwaggerRouteStore.addRoute(routeDef);
}
