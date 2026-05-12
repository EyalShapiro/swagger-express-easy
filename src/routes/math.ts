import { Router, Request, Response } from 'express';
import { withSwagger } from 'swagger-express-easy/swagger/decorators';

const router = Router();

/*
POST /calculate
*/
router.post(
  '/calculate',
  withSwagger(
    {
      method: 'post',
      path: '/calculate',
      description: { text: 'Calculate a math expression' },
      body: { expression: '2 + 2' },
    },
    (req: Request<unknown, unknown, { expression: string }>, res: Response) => {
      try {
        // req.body is now fully typed as { expression: string }
        const { expression } = req.body;

        if (!expression) {
          return res.status(400).json({ error: 'expression is required' });
        }

        const result = new Function('return ' + expression)();

        res.json({ success: true, expression, result });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    },
  ),
);

router.post('/quadratic', (req: Request, res: Response) => {
  try {
    const { a, b, c } = req.body;

    const delta = b * b - 4 * a * c;

    if (delta < 0) {
      return res.json({ success: false, message: 'No real solutions' });
    }

    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);

    res.json({
      success: true,
      delta,
      x1,
      x2,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/circle-area',
  withSwagger(
    {
      method: 'post',
      path: '/circle-area',
      description: { text: 'Calculate the area of a circle' },
      body: { radius: 5 },
    },
    (req, res) => {
      try {
        const { radius } = req.body;

        const area = Math.PI * radius * radius;

        res.json({ success: true, radius, pi: Math.PI, area });
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  ),
);

/*
GET /constants
*/
router.get(
  '/constants',
  withSwagger(
    {
      method: 'get',
      path: '/constants',
      description: { text: 'Get mathematical constants' },
    },
    (req, res) => {
      res.json({ pi: Math.PI, e: Math.E, sqrt2: Math.SQRT2, ln2: Math.LN2 });
    },
  ),
);

/*
POST /math/add
*/
router.post('/add', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({ operation: 'add', result: a + b });
});

/*
POST /math/subtract
*/
router.post('/subtract', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({ operation: 'subtract', result: a - b });
});

/*
POST /math/multiply
*/
router.post('/multiply', (req: Request, res: Response) => {
  const { a, b } = req.body;

  res.json({ operation: 'multiply', result: a * b });
});

/*
POST /math/divide
*/
router.post('/divide', (req: Request, res: Response) => {
  const { a, b } = req.body;

  if (b === 0) {
    return res.status(400).json({ error: 'Cannot divide by zero' });
  }

  res.json({
    operation: 'divide',
    result: a / b,
  });
});

router.patch('/sqrt', (req: Request, res: Response) => {
  const { number } = req.body;

  if (number === undefined) {
    return res.status(400).json({ error: 'number is required' });
  }

  if (typeof number !== 'number') {
    return res.status(400).json({ error: 'number must be a number' });
  }
  if (number < 0) {
    return res.status(400).json({ error: 'cannot calculate square root of negative number' });
  }
  res.json({ operation: 'sqrt', number, result: Math.sqrt(number) });
});

/*
POST /math/power
*/
router.post('/power', (req: Request, res: Response) => {
  const { base, exponent } = req.body;

  res.json({ operation: 'power', result: base ** exponent });
});

/*
GET /math/constants
*/
router.get('/constants', (_req: Request, res: Response) => {
  res.json({ pi: Math.PI, e: Math.E, sqrt2: Math.SQRT2 });
});
export default router;
