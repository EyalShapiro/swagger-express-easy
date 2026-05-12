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

export const getOrders = (req: Request, res: Response) => {
  res.json(getAllOrders());
};

export const getSingleOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const order = getOrderById(id);

  if (!order) {
    res.status(404).json({
      error: 'Order not found',
    });
    return;
  }

  res.json(order);
};

export const addOrder = (req: Request, res: Response) => {
  const order = createOrder(req.body);

  res.status(201).json(order);
};

export const editOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const updatedOrder = updateOrder(id, req.body);

  if (!updatedOrder) {
    res.status(404).json({
      error: 'Order not found',
    });
    return;
  }

  res.json(updatedOrder);
};

export const removeOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'missing id in params', success: false });
  }
  const deleted = deleteOrder(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Order not found', success: false });
  }

  res.json({ success: true, message: 'success' });
};

export const removeAllOrders = (req: Request, res: Response): void => {
  clearOrders();

  res.json({
    success: true,
  });
};

export const getOrdersCount = (req: Request, res: Response): void => {
  res.json({
    count: countOrders(),
  });
};

export const searchOrderById = (req: Request, res: Response) => {
  const id = req.params.id || req.query.id || req.body.id;
  if (!id) {
    return res.status(400).json({ message: 'missing id in params' });
  }
  const orders = searchOrdersByUserId(id as string | number);

  res.json(orders);
};

export const querySearchOrders = (req: Request, res: Response) => {
  const query = req.query;

  const orders = searchOrders(query);

  res.json(orders);
};
