import express from 'express';
import { requireAuth } from '../auth/middleware.js';
import { pickHomePath } from '../auth/home.js';

const router = express.Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const roleNames = req.user.roleNames || [];
  res.json({
    user: { id: req.user.sub, roleNames },
    nextPath: pickHomePath(roleNames),
  });
});

export default router;
