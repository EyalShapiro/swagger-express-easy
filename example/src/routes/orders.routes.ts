import { Router } from 'express';

import {
  getOrders,
  getSingleOrder,
  addOrder,
  editOrder,
  removeOrder,
  removeAllOrders,
  getOrdersCount,
  querySearchOrders,
} from '../controllers/orders.controller';

const router = Router();

router.get('/orders', getOrders);

router.get('/orders/query', querySearchOrders);
router.get('/orders/search-by-id', querySearchOrders);

router.get('/orders/count', getOrdersCount);

router.get('/orders/:id', getSingleOrder);

router.post('/orders', addOrder);

router.put('/orders/:id', editOrder);

router.patch('/orders/:id', editOrder);

router.delete('/orders/:id', removeOrder);

router.delete('/orders/remove-all', removeAllOrders);

export default router;
