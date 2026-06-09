import express from 'express';
import morgan from 'morgan';

import outersRouter from './outers';

const app2 = express();

app2.use(express.json());
app2.use(morgan('short'));

app2.get('/', (_req, res) => res.send('Hello World from app2!'));
// Use outersRouter under /myApi for the secondary app
app2.use('/myApi', outersRouter);
export default app2;
