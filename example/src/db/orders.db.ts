import type { Order } from '../types/order.types';

export const ordersDB = new Map<number, Order>();

ordersDB.set(1, {
  id: 1,
  userId: 100,
  item: 'Laptop',
});

ordersDB.set(2, {
  id: 2,
  userId: 101,
  item: 'Mouse',
});
