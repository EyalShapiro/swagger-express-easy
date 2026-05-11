import { Router } from 'express';
import dataRouter from './data';
import weatherRouter from '../weather'; // The weather router we created earlier

const apiRouter = Router();

// Mount nested routers
apiRouter.use('/data', dataRouter);
apiRouter.use('/weather', weatherRouter); // This makes the path /api/v1/weather

export default apiRouter;
