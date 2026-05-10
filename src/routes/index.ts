import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth';

import counterRoutes from './counter';
import helloRoute from './hello';
import messageBoardRoute from './messageBoard';
import filesRoute from './fileUploads';
import funFa from './funFacts';

const router = Router();

router.use(authMiddleware);

router.use('/counter', counterRoutes);
router.use('/hello', helloRoute);
router.use('/files', filesRoute);

router.use('/message-board', messageBoardRoute);
router.use('/fuc', funFa);


export default router;
