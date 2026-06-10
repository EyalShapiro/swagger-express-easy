import { Router } from 'express';
import { getPing, getPingById, postPing, putPing, deletePing } from '../controllers/ping';

const router = Router();
router.search('/s', (req, res) => {
  res.send('Hello World!');
});
router.get('/', getPing);
router.get('/:id', getPingById);
router.get('/:id1/:id2', getPingById);

router.post('/', postPing);
router.put('/:id', putPing);
router.delete('/:id', deletePing);
router.patch('/:id', postPing);

export default router;
