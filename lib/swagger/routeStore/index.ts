import { SwaggerRouteDefinition } from './type';

export * from './type';

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
