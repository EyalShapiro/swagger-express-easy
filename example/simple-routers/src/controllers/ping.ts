import type { Request, Response } from 'express';

export function getPing(_req: Request, res: Response) {
  res.send('pong');
}

export function getPingById(req: Request, res: Response) {
  const { id } = req.params;
  res.status(200).json({ message: `Fetched ping with ID: ${id}`, id, params: req.params });
}

export function postPing(req: Request, res: Response) {
  const { body, params, query } = req;
  const data = { nameFunction: 'postPing', body: body ?? {}, params, query, message: 'posng' };
  res.status(201).json(data);
}

export function putPing({ body, params, query }: Request, res: Response) {
  const data = { nameFunction: 'putPing', body: body ?? {}, params, query, message: 'posng' };
  res.status(201).json(data);
}

export function deletePing(req: Request, res: Response) {
  const { id } = req.params;
  res.json({ message: `Deleted ping with ID: ${id}`, id });
}
