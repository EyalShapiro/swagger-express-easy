import { Router } from 'express';

import { createSwaggerRoute } from 'swagger-express-easy';

const router = Router();

const facts = ['Cats sleep 70% of their life.', 'Bananas are berries.', 'Honey never spoils.'];

router.get('/random-fact', (req, res) => {
  const random = facts[Math.floor(Math.random() * facts.length)];
  res.json({ fact: random });
});
router.get('/random-fact/:id', (req, res) => {
  const id = req.params.id;
  res.json({ fact: facts[parseInt(id)] });
});

// Register to swagger:
createSwaggerRoute({
  method: 'get',
  path: '/fun/random-fact',
  description: { text: 'Returns a random fun fact' },
});

export default router;
