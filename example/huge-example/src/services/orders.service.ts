import { delay, fakeDBRequest, randomDelay, randomFail } from '@/utils/delay';
import { ordersDB } from '../db/orders.db';
import type { Order } from '../types/order.types';

export const getAllOrders = async (): Promise<Order[]> => {
  return fakeDBRequest(Array.from(ordersDB.values()));
};
export const getOrderById = async (id: number): Promise<Order | undefined> => {
  return fakeDBRequest(ordersDB.get(id));
};
export async function createOrder(order: Order): Promise<Order> {
  await delay(1000);
  ordersDB.set(order.id, order);
  return order;
}

export async function updateOrder(id: number, order: Order): Promise<Order | null> {
  if (!ordersDB.has(id)) {
    return null;
  }

  const updatedOrder = {
    ...order,
    id,
  };
  await randomDelay();
  ordersDB.set(id, updatedOrder);

  return updatedOrder;
}

export const deleteOrder = async (id: number): Promise<boolean> => {
  const deleted = ordersDB.delete(id);
  await randomDelay();
  return fakeDBRequest(deleted);
};
export async function clearOrders() {
  try {
    await Promise.race([await randomDelay(1000, 3000), await randomFail(2500)]);
    ordersDB.clear();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function countOrders(): Promise<number> {
  await randomDelay(200, 700);
  return ordersDB.size;
}

export const searchOrdersByUserId = async (userId: number | string): Promise<Order[]> => {
  await Promise.race([await randomDelay(1000, 3000), await randomFail(2500)]);

  const id = Number(userId);
  if (!id || isNaN(id)) {
    return [];
  }
  return Array.from(ordersDB.values()).filter((order) => order.userId === id);
};

export const searchOrders = async (query: Partial<Order>): Promise<Order[]> => {
  const orders = Array.from(ordersDB.values());

  const filteredOrders = orders.filter((order) => {
    return Object.entries(query).every(([key, value]) => {
      return String(order[key as keyof Order]) === String(value);
    });
  });

  return fakeDBRequest(filteredOrders, {
    minDelay: 100,
    maxDelay: 3000,
  });
};
