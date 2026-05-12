import { Router } from 'express';
import dataRouter from './data';
import weatherRouter from '../weather'; // The weather router we created earlier

const apiV1Router = Router();

// Mount nested routers
apiV1Router.use('/data', dataRouter);
apiV1Router.use('/weather', weatherRouter); // This makes the path /api/v1/weather

export default apiV1Router;
