import { Request } from 'express';

import { PORT } from '../config';

const ERROR_MSG = {
  internal: 'Internal Server Error 500.',
  notFound: 'Not Found 404.',
  swagger: ` Swagger UI available at http://localhost:${PORT}/api-docs`,
  accessOriginalUrl: (req: Request) =>
    `you tried to access originalUrl: '${req?.originalUrl || ''}'`,
};
export default ERROR_MSG;
