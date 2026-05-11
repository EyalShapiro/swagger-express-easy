import { Request, Response } from 'express';
import { SwaggerRoute } from 'swagger-express-easy/swagger/decorators';

/**
 * Example of a Class-based Controller using decorators.
 * This demonstrates the @SwaggerRoute decorator.
 */
export class MathController {
  
  @SwaggerRoute({
    method: 'get',
    path: '/math/v2/pi',
    description: { text: 'Get the value of Pi using Class Decorator' },
    tag: 'Math (Class)'
  })
  getPi(req: Request, res: Response) {
    res.json({ pi: Math.PI });
  }

  @SwaggerRoute({
    method: 'post',
    path: '/math/v2/square',
    description: { text: 'Calculate square of a number' },
    body: { number: 4 },
    tag: 'Math (Class)'
  })
  getSquare(req: Request, res: Response) {
    const { number } = req.body;
    res.json({ result: number * number });
  }
}
