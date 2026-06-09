import { Request, Response } from 'express';

import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  clearOrders,
  countOrders,
  searchOrdersByUserId,
  searchOrders,
} from '../services/orders.service';

export async function getOrders(req: Request, res: Response) {
  try {
    const orders = await getAllOrders();

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
export const getSingleOrder = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const order = await getOrderById(id);

  if (!order) {
    res.status(404).json({
      error: 'Order not found',
    });
    return;
  }

  res.json(order);
};

export const addOrder = async (req: Request, res: Response) => {
  const order = await createOrder(req.body);

  res.status(201).json(order);
};

export async function editOrder(req: Request, res: Response) {
  const id = Number(req.params.id);

  const updatedOrder = await updateOrder(id, req.body);

  if (!updatedOrder) {
    res.status(404).json({
      error: 'Order not found',
    });
    return;
  }

  res.json(updatedOrder);
}

export const removeOrder = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'missing id in params', success: false });
  }
  const deleted = await deleteOrder(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Order not found', success: false });
  }

  res.json({ success: true, message: 'success' });
};

export async function removeAllOrders(req: Request, res: Response) {
  await clearOrders();

  res.json({
    success: true,
  });
}

export async function getOrdersCount(req: Request, res: Response) {
  res.json({
    count: await countOrders(),
  });
}

export async function searchOrderById(req: Request, res: Response) {
  const id = req.params.id || req.query.id || req.body.id;
  if (!id) {
    return res.status(400).json({ message: 'missing id in params' });
  }
  const orders = await searchOrdersByUserId(id as string | number);

  res.json(orders);
}

export async function querySearchOrders(req: Request, res: Response) {
  const query = req.query;

  const orders = await searchOrders(query);

  res.json(orders);
}
