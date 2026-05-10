import { SwaggerRouteDefinition } from './type';

/**
 * Efficient in-memory store for Swagger route metadata.
 * Collects programmatic route definitions and merges them into the final documentation.
 */
export const SwaggerRouteStore = (() => {
  const routeMap = new Map<string, SwaggerRouteDefinition>();

  return {
    /**
     * Adds a new Swagger route definition to the global store.
     * Overwrites existing definitions for the same method and path.
     *
     * @param {SwaggerRouteDefinition} route - The route metadata.
     */
    addRoute: (route: SwaggerRouteDefinition) => {
      const key = `${route.method.toLowerCase()}:${route.path}`;
      routeMap.set(key, route);
    },

    /**
     * Returns the raw internal Map of routes.
     * @returns {Map<string, SwaggerRouteDefinition>} The internal store.
     */
    getData: () => routeMap,

    /**
     * Returns all registered Swagger routes as an array.
     * @returns {SwaggerRouteDefinition[]} The list of all route definitions.
     */
    getRouteList: (): SwaggerRouteDefinition[] => Array.from(routeMap.values()),
  };
})();

/**
 * Registers a single route for Swagger documentation.
 * This is the primary way to add metadata (descriptions, bodies, refs) to your routes programmatically.
 *
 * @param {SwaggerRouteDefinition} route - The route definition object.
 *
 * @example
 * createSwaggerRoute({
 *   method: 'get',
 *   path: '/api/users',
 *   description: { text: 'Get all users' },
 *   tags: ['Users']
 * });
 */
export const createSwaggerRoute = SwaggerRouteStore.addRoute;

/**
 * Registers multiple routes for Swagger documentation at once.
 *
 * @param {SwaggerRouteDefinition[]} routeList - An array of route definitions.
 */
export const createSwaggerRoutes = (routeList: SwaggerRouteDefinition[]) => {
  routeList.map(SwaggerRouteStore.addRoute);
};
