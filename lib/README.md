# 📦 Library Core (`lib/`)

This directory contains the source code for the `swagger-express-easy` library. It is designed to be framework-agnostic (mostly) and published as an NPM package.

## 🏗️ Architecture

- **`index.ts`**: The main barrel file. All public APIs, classes, and types are exported from here.
- **`swagger/`**: The heart of the library.
  - **`index.ts`**: Contains the `SwaggerAuto` class which orchestrates everything.
  - **`swaggerAuto.ts`**: Handles the generation of the `swagger-output.json` file.
  - **`swagger.config.ts`**: Manages configuration merging (package.json + user options + env).
  - **`schemas.ts`**: The `SchemaManager` for handling OpenAPI components and references.
  - **`routeStore/`**: Handles the programmatic annotation of routes via `createSwaggerRoute`.

## 🛠️ Development

When making changes to the library:

1. Ensure types are exported from the main `index.ts`.
2. Add unit tests in `*.test.ts` files alongside the implementation.
3. Use `npm run build` to verify compilation.

## 🧪 Testing

We use **Jest** for unit testing the core logic.
Run tests with:

```bash
npm test
```
