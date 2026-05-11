// src/routes/math.router.ts

import { Router, Request, Response } from 'express';

const outersRouter = Router();

/*
POST /math/add
*/
outersRouter.post('/add', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({
    operation: 'add',
    result: a + b,
  });
});
outersRouter.post('/add/:param', (req: Request, res: Response) => {
  const { value } = req.body;
  const { param } = req.params;
  const sum = Number(value) + Number(param);
  const query = `${value} + ${param} =${sum}`;
  console.log(query);

  res.json({
    operation: 'add',
    result: sum,
    query,
    param,
    value,
  });
});
/*
POST /math/subtract
*/
outersRouter.post('/subtract', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({
    operation: 'subtract',
    result: a - b,
  });
});

/*
POST /math/multiply
*/
outersRouter.post('/multiply', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({
    operation: 'multiply',
    result: a * b,
  });
});

/*
POST /math/divide
*/
outersRouter.post('/divide', (req: Request, res: Response) => {
  const { a, b } = req.body;

  if (b === 0) {
    return res.status(400).json({
      error: 'Cannot divide by zero',
    });
  }

  res.json({
    operation: 'divide',
    result: a / b,
  });
});

/*
POST /math/sqrt
*/
outersRouter.post('/sqrt', (req: Request, res: Response) => {
  const { number } = req.body;

  res.json({
    operation: 'sqrt',
    result: Math.sqrt(number),
  });
});

/*
POST /math/power
*/
outersRouter.post('/power', (req: Request, res: Response) => {
  const { base, exponent } = req.body;

  res.json({
    operation: 'power',
    result: base ** exponent,
  });
});

/*
GET /math/constants
*/
outersRouter.get('/constants', (_req: Request, res: Response) => {
  res.json({
    pi: Math.PI,
    e: Math.E,
    sqrt2: Math.SQRT2,
  });
});

export default outersRouter;
