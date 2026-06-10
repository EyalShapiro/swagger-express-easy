# 🚀 swagger-express-easy

> The easiest way to add **OpenAPI 3.0** documentation to your Express application.  
> Stop writing manual JSON/YAML — just write your code, and let the library handle the rest.

[![npm version](https://img.shields.io/npm/v/swagger-express-easy.svg)](https://www.npmjs.com/package/swagger-express-easy)
[![CI/CD Pipeline](https://github.com/EyalShapiro/swagger-express-easy/actions/workflows/ci.yml/badge.svg)](https://github.com/EyalShapiro/swagger-express-easy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/swagger-express-easy)](https://nodejs.org)

---

## ✨ Features

- ⚡ **Auto-Generation & Discovery** — Automatically and recursively scans your `src/` folder for routes
- 👁️ **Watch Mode** — Live updates to Swagger UI as you code
- 🔷 **Type-Safe Schemas** — Define reusable entities with a simple, intuitive API
- 🏷️ **Programmatic Metadata** — Annotate routes directly within your route files
- 📁 **File Upload Support** — Effortless documentation for `multipart/form-data`
- 🔀 **Multi-Instance Support** — Run multiple Swagger servers with isolated routes in a single process
- ⚙️ **Zero Configuration** — Smart defaults derived from your `package.json`

---

## 📦 Installation

```bash
npm install swagger-express-easy
```

---

## 🏃 Running Examples

The project uses a **monorepo structure** with ready-to-run examples inside the [`example/`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example) folder.

| Example | Description |
|---|---|
| [`simple-routers`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/simple-routers) | Basic Express router setup with auto-generated Swagger |
| [`class-based`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/class-based) | Using `@SwaggerRoute` class decorator |
| [`multi-app`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/multi-app) | Multiple isolated Swagger instances in one process |
| [`multer-upload`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/multer-upload) | File upload documentation with `multipart/form-data` |
| [`commonjs`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/commonjs) | CommonJS (`require`) usage |
| [`huge-example`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/huge-example) | Large-scale API with many routes and schemas |
| [`maui`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/maui) | Integration example |

To run any example locally:

```bash
# Install dependencies (monorepo root)
npm install

# Start a specific example, e.g. simple-routers
cd example/simple-routers
npm install
npm run dev
```

---

## 🚀 Quick Start

### 1. Using `SwaggerAuto` (Recommended)

The `SwaggerAuto` class automatically scans your route files and serves live Swagger docs.

```typescript
import express from 'express';
import { SwaggerAuto } from 'swagger-express-easy';

const app = express();

const swagger = new SwaggerAuto(app, {
  path: '/api-docs',          // URL path for Swagger UI
  watch: true,                // Regenerate on every request (great for development)
  endpointsRoutes: ['./src/routes/*.ts'], // Glob patterns to scan
});

async function start() {
  await swagger.setup();
  app.listen(3000, () => console.log('🚀 Server & Swagger running on http://localhost:3000/api-docs'));
}
start();
```

### 2. Using `setupSwagger` (Functional)

A one-call alternative for simpler setups.

```typescript
import { createServer } from 'http';
import express from 'express';
import { setupSwagger } from 'swagger-express-easy';
import { router } from './routes';

const PORT = 3002;
const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use('/api', router);

setupSwagger(app, {
  watch: true,
  document: {
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Auto-generated Swagger documentation',
    },
  },
  endpointsRoutes: ['./src/index.ts', 'routes/index.ts'],
  outputFile: './swagger-output.json',
});

createServer(app).listen(PORT, () => {
  console.info(`Server running at http://localhost:${PORT}`);
  console.info(`Swagger UI at  http://localhost:${PORT}/api-docs`);
});
```

> 👉 See the full example at [`example/simple-routers`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/simple-routers)

---

## 🛠️ Advanced Usage

### Multiple Instances & Isolation

Run multiple Express apps or micro-services in one process with completely isolated documentation.

```typescript
// App 1
const swagger1 = new SwaggerAuto(app1, {
  path: '/docs-app1',
  basePath: 'api',        // Only shows routes starting with /api
  outputFile: 'swagger-app1.json',
});

// App 2
const swagger2 = new SwaggerAuto(app2, {
  path: '/docs-app2',
  basePath: 'myApi',      // Only shows routes starting with /myApi
  outputFile: 'swagger-app2.json',
});

await Promise.all([swagger1.setup(), swagger2.setup()]);
```

> 👉 Full example at [`example/multi-app`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/multi-app)

---

### Reusable Schemas (Entities)

Define your models once and reference them anywhere using `$ref`.

```typescript
import { defineSchema, schemaRef, createSwaggerRoute } from 'swagger-express-easy';

defineSchema('User', {
  id:       { type: 'integer', required: true, example: 1 },
  username: { type: 'string',  required: true, example: 'johndoe' },
  email:    { type: 'string',  format: 'email' },
});

createSwaggerRoute({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': { schema: { $ref: schemaRef('User') } },
      },
    },
  },
});
```

---

### Decorators & Wrappers

#### `withSwagger` — Wrapper for standard handler functions

```typescript
import { withSwagger } from 'swagger-express-easy';

export const getHello = withSwagger(
  {
    method: 'get',
    path: '/api/hello',
    tags: ['Misc'],
    description: { text: 'Returns a hello message' },
  },
  (req, res) => {
    res.json({ message: 'Hello World!' });
  },
);
```

#### `@SwaggerRoute` — Class decorator (ES6 / TypeScript)

```typescript
import { SwaggerRoute } from 'swagger-express-easy';

class UserController {
  @SwaggerRoute({ method: 'get', path: '/api/users', tags: ['Users'] })
  getUsers(req: Request, res: Response) {
    res.json([]);
  }

  @SwaggerRoute({ method: 'post', path: '/api/users', tags: ['Users'] })
  createUser(req: Request, res: Response) {
    res.status(201).json({ id: 1, ...req.body });
  }
}
```

> 👉 Full example at [`example/class-based`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/class-based)

---

### File Uploads (`multipart/form-data`)

```typescript
import multer from 'multer';
import { withSwagger } from 'swagger-express-easy';

const upload = multer({ dest: 'uploads/' });

export const uploadFile = withSwagger(
  {
    method: 'post',
    path: '/api/upload',
    tags: ['Files'],
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
  },
  upload.single('file'),
  (req, res) => {
    res.json({ filename: req.file?.originalname });
  },
);
```

> 👉 Full example at [`example/multer-upload`](https://github.com/EyalShapiro/swagger-express-easy/tree/main/example/multer-upload)

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `path` | `string` | `'/api-docs'` | URL path for the Swagger UI |
| `watch` | `boolean` | `false` | Regenerate docs on every request to `path` |
| `basePath` | `string` | `'/'` | Filter routes to only those starting with this path |
| `outputFile` | `string` | `'swagger-output.json'` | Filename for the generated JSON spec |
| `outputDir` | `string` | `process.cwd()` | Directory for the output file |
| `endpointsRoutes` | `string[]` | `['./src/app.ts', ...]` | Glob patterns to scan for routes |
| `bearerAuth` | `boolean` | `true` | Automatically add JWT Bearer auth to spec |
| `document.info.title` | `string` | from `package.json` | API title shown in Swagger UI |
| `document.info.version` | `string` | from `package.json` | API version shown in Swagger UI |

---

## 🧪 Running Tests

```bash
npm test
```

---


## 📄 License

MIT © [Eyal Shapiro](https://github.com/EyalShapiro)

---

<p align="center">
  <a href="https://github.com/EyalShapiro">GitHub</a> •
  <a href="https://www.linkedin.com/in/eyalshapiro/">LinkedIn</a>
</p>
