import { ordersDB } from '../db/orders.db';
import type { Order } from '../types/order.types';

export const getAllOrders = (): Order[] => {
  return Array.from(ordersDB.values());
};

export const getOrderById = (id: number): Order | undefined => {
  return ordersDB.get(id);
};

export const createOrder = (order: Order): Order => {
  ordersDB.set(order.id, order);
  return order;
};

export const updateOrder = (id: number, order: Order): Order | null => {
  if (!ordersDB.has(id)) {
    return null;
  }

  const updatedOrder = {
    ...order,
    id,
  };

  ordersDB.set(id, updatedOrder);

  return updatedOrder;
};

export const deleteOrder = (id: number): boolean => {
  return ordersDB.delete(id);
};

export const clearOrders = (): void => {
  ordersDB.clear();
};

export const countOrders = (): number => {
  return ordersDB.size;
};

export const searchOrdersByUserId = (userId: number | string): Order[] => {
  const id = Number(userId);
  if (!id || isNaN(id)) {
    return [];
  }
  return Array.from(ordersDB.values()).filter((order) => order.userId === id);
};

export const searchOrders = (query: Partial<Order>): Order[] => {
  const orders = Array.from(ordersDB.values());

  return orders.filter((order) => {
    return Object.entries(query).every(([key, value]) => {
      return String(order[key as keyof Order]) === String(value);
    });
  });
};
