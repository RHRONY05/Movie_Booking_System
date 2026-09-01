import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is healthy and running smoothly',
    timestamp: new Date().toISOString()
  });
});

export default router;
