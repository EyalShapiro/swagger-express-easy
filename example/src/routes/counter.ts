import { Router } from 'express';
import {
  addOneCounter,
  deleteCounter,
  getCounter,
  subOneCounter,
} from '../controllers/counterController';

const counterRoutes = Router();

counterRoutes.get('/', getCounter);
counterRoutes.get('/get', getCounter);

counterRoutes.post('/add', addOneCounter);
counterRoutes.post(['/inc', '/plus', '/\\+'], addOneCounter);

counterRoutes.post('/sub', subOneCounter);
counterRoutes.post(['/dec', '/minus', '/\\-'], subOneCounter);

counterRoutes.delete('/0', deleteCounter);
counterRoutes.delete('/reset', deleteCounter);
counterRoutes.delete('/zero', deleteCounter);
counterRoutes.delete('/', deleteCounter);

export default counterRoutes;
