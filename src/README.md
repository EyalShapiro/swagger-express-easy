# 🚀 Example Application (`src/`)

This directory contains a full-blown Express application demonstrating how to use the `swagger-express-easy` library in a real-world scenario.

## 📂 Structure

- **`app.ts`**: The entry point. Shows how to initialize `SwaggerAuto` and use `handleServerErrors`.
- **`routes/`**: Contains various routing examples:
  - `messageBoard.ts`: Demonstrates using **Schemas** and **References**.
  - `fileUploads.ts`: Demonstrates **Multipart/Form-Data** (File Uploads) with `multer`.
  - `hello.ts`: Simple GET/POST examples.
- **`controllers/`**: Standard Express controllers.
- **`middlewares/`**: Middlewares for auth, CORS, and error handling.

## 💡 Key Examples

### File Uploads

See [fileUploads.ts](./routes/fileUploads.ts) to see how to use the `consumes` field and `formData` parameters to document file uploads.

### Schemas & References

See [messageBoard.ts](./routes/messageBoard.ts) to see how `defineSchema` and `schemaRef` work together to create clean, reusable documentation.

## 🏃 Running the Example

Start the development server with hot-reload:

```bash
npm run dev
```

The Swagger UI will be available at `http://localhost:3004/api-docs` (or your configured port).
