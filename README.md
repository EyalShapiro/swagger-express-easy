# 🚀 swagger-express-easy

The easiest way to add **OpenAPI 3.0** documentation to your Express application.
Stop writing manual JSON/YAML — just write your code, and let us handle the rest.

[![npm version](https://img.shields.io/npm/v/swagger-express-easy.svg)](https://www.npmjs.com/package/swagger-express-easy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Auto-Generation & Discovery**: Automatically recursively scans your `src/` folder for routes by default if no path is configured.
- **Watch Mode**: Live updates to Swagger UI as you code.
- **Type-Safe Schemas**: Define reusable Entities with a simple API.
- **Programmatic Metadata**: Annotate routes directly in your route files.
- **File Upload Support**: Easy documentation for `multipart/form-data`.
- **Multi-Instance Support**: Run multiple Swagger servers with isolated routes in a single process.
- **Zero Configuration**: Smart defaults from your `package.json`.

---

## 📦 Installation

```bash
npm install swagger-express-easy
```

---

## 🏃 Running Examples

We use a modern Monorepo structure. To start the demonstration/example server locally:

```bash
# Install all dependencies across workspace
npm install

# Start the dev example application
npm run dev
```

---

## 🚀 Quick Start

### 1. Initialize in `app.ts`

```typescript
import express from 'express';
import { SwaggerAuto } from 'swagger-express-easy';

const app = express();

const swagger = new SwaggerAuto(app, {
  path: '/api-docs', // Where the UI lives
  watch: true, // Enable live updates
  endpointsRoutes: ['./src/routes/*.ts'], // Where your routes are
});

async function start() {
  await swagger.setup();
  app.listen(3000, () => console.log('Server & Swagger running!'));
}
start();
```

### 2. Or just use `setupSwagger`

```ttypescripts
import { createServer } from 'http';
import express from 'express';
import { setupSwagger } from 'swagger-express-easy';

import { router } from './routes';
const PORT = 3002;
const url = `http://localhost:${PORT}`;

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', router);
setupSwagger(app, {
  watch: true,

  document: {
    info: {
      title: 'Simple Routers Example',
      version: '1.2.0',
      description: 'A tiny example combining @SwaggerRoute and withSwagger',
    },
  },
  endpointsRoutes: ['./src/index.ts', 'routes/index.ts'],
  outputFile: './swagger-file-example.json',
});

createServer(app).listen(PORT, () => {
  console.info(`Server is running on ${url}`);
  console.info(`Swagger UI is available at ${url}/api-docs`);
});
```

---

## 🛠️ Advanced Usage

### Multiple Instances & Isolation

If you have multiple Express apps or micro-frontends in a single process, you can isolate their documentation using `basePath`.

```typescript
const app1 = express();
const app2 = express();

// This instance will ONLY show routes starting with /api
const swagger1 = new SwaggerAuto(app1, {
  path: '/docs-app1',
  basePath: 'api', // Isolation filter
  outputFile: 'swagger-app1.json',
});

// This instance will ONLY show routes starting with /myApi
const swagger2 = new SwaggerAuto(app2, {
  path: '/docs-app2',
  basePath: 'myApi', // Isolation filter
  outputFile: 'swagger-app2.json',
});

await swagger1.setup();
await swagger2.setup();
```

### Reusable Schemas (Entities)

Define your models once and reuse them everywhere.

```typescript
import { defineSchema, schemaRef, createSwaggerRoute } from 'swagger-express-easy';

// Define the schema
defineSchema('User', {
  id: { type: 'integer', required: true, example: 1 },
  username: { type: 'string', required: true, example: 'johndoe' },
  email: { type: 'string', format: 'email' },
});

// Use it in a route
createSwaggerRoute({
  method: 'get',
  path: '/api/users/{id}',
  responses: {
    200: {
      description: 'User found',
      content: { 'application/json': { schema: { $ref: schemaRef('User') } } },
    },
  },
});
```

### File Uploads

Documenting file uploads is a breeze.

```typescript
createSwaggerRoute({
  method: 'post',
  path: '/api/upload',
  consumes: ['multipart/form-data'],
  parameters: [
    {
      name: 'file',
      in: 'formData',
      type: 'file',
      required: true,
      description: 'The file to upload',
    },
  ],
  tags: ['Files'],
});
```

### Decorators & Wrappers

#### 1. Wrapper (For Standard Functions)

```typescript
import { withSwagger } from 'swagger-express-easy';

export const getHello = withSwagger(
  {
    method: 'get',
    path: '/api/hello',
    description: { text: 'Returns a hello message' },
  },
  (req, res) => {
    res.json({ message: 'Hello World!' });
  },
);
```

#### 2. Class Decorator (For ES6 Classes)

```typescript
import { SwaggerRoute } from 'swagger-express-easy';

class UserController {
  @SwaggerRoute({ method: 'get', path: '/api/users', tags: ['Users'] })
  getUsers(req: Request, res: Response) {
    res.json([]);
  }
}
```

---

## ⚙️ Configuration Options

| Option            | Type       | Default                 | Description                                               |
| :---------------- | :--------- | :---------------------- | :-------------------------------------------------------- |
| `path`            | `string`   | `'/api-docs'`           | The URL path for Swagger UI.                              |
| `watch`           | `boolean`  | `false`                 | Regenerate docs on every request to `path`.               |
| `basePath`        | `string`   | `'/'`                   | Filter routes to only show those starting with this path. |
| `outputFile`      | `string`   | `'swagger-output.json'` | Filename for the generated JSON.                          |
| `outputDir`       | `string`   | `process.cwd()`         | Directory for the output file.                            |
| `endpointsRoutes` | `string[]` | `['./src/app.ts', ...]` | Glob patterns to scan for routes.                         |
| `bearerAuth`      | `boolean`  | `true`                  | Automatically add JWT Bearer auth to spec.                |

---

## 🧪 Running Tests

```bash
npm test
```

## 📄 License

MIT © [Eyal Shapiro](https://github.com/EyalShapiro)
