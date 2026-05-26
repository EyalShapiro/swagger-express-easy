import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local'], debug: false, quiet: false });

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import router from './routes/index';
import { addTimeStamp } from './middlewares/timeStamp';
import { corsOptions } from './middlewares/cors';
import weatherRouter from './routes/weather';
import { errorHandler, notFound404Handle } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(addTimeStamp);
app.use('/assets', express.static('assets'));

app.get('/', (_req, res) => res.send('Hello World!'));

app.get('/ping', (_req, res) => {
  const style = `display: flex; width: 100%;  height: 100%;
    flex-wrap: nowrap; align-items: center; justify-content: center; color: blue;`;
  res.status(200).send(`<div style='${style}'><h1>pong</h1></div>`).sendStatus(200);
});

app.get('/status', (_req, res) => {
  res.jsonp({ status: 'Running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Primary app routes
app.use('/api', router);
app.use('/weather', weatherRouter);
// Optional additional API version
app.use('/api2', router);
app.param('id', function (_req, _res, next, id) {
  console.log('CALLED ONLY ONCE', id);
  next();
});

app.use(notFound404Handle);
app.use(errorHandler);
export default app;
