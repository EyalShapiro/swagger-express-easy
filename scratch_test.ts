import express, { Router } from 'express';
import util from 'util';

const app = express();
const router = Router();
router.get('/posts/:postId', (req, res) => {});
app.use('/users/:userId', router);

const routerObj = app._router || app.router;
if (routerObj) {
  for (const layer of routerObj.stack) {
    if (layer.name === 'router') {
      console.log('--- Router Layer Hidden Inspection ---');
      console.log(util.inspect(layer, { showHidden: true, depth: 3 }));
    }
  }
}
