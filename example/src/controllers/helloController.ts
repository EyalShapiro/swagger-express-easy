import { Request, Response } from 'express';
import ERROR_MSG from '../constant/error_msg';

import { withSwagger } from 'swagger-express-easy';

export const getHello = withSwagger(
  {
    method: 'get',
    path: '/api/hello',
    description: { text: 'Returns a hello message' },
  },
  (req: Request, res: Response) => {
    try {
      const statusCode = 200;
      const timeStamp = res.locals?.timeStamp || new Date().toUTCString();

      res.status(statusCode).json({ message: 'Hello World!', statusCode, timeStamp });
    } catch (error) {
      console.error(error);
      const statusCode = 500;
      res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error });
    }
  },
);
export const getHelloById = (req: Request, res: Response) => {
  try {
    const statusCode = 200;
    const { id } = req.params;

    console.log(req.params, req.query);

    const timeStamp = res.locals?.timeStamp || new Date().toUTCString();

    res.status(statusCode).json({ message: `Hello id=${id}`, statusCode, timeStamp });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error });
  }
};
export function postHello(req: Request, res: Response) {
  try {
    const body = req.body;

    const statusCode = 200;
    const timeStamp = res.locals?.timeStamp || new Date().toUTCString();

    res.status(statusCode).json({ message: 'get back Hello World!', statusCode, timeStamp, body });
  } catch (error) {
    console.error(error);
    const statusCode = 500;
    res.status(statusCode).json({ message: ERROR_MSG.internal, statusCode, error });
  }
}
export function postUserHi(req: Request, res: Response) {
  const { name, age } = req.body;

  // Validation: Ensure both name and age are provided
  if (!name || typeof name !== 'string' || !age || typeof age !== 'number') {
    return res
      .status(400)
      .json({ error: 'Invalid input. Please provide both name (string) and age (number).' });
  }

  // Respond with age categorization
  const ageCategory = age < 20 ? 'child' : 'older';
  res.json({ message: `Hi ${name}, you are considered an ${ageCategory}.` });
}
