
import express from 'express';
import { requireAuth } from '../auth/middleware.js';
import { pickHomePath } from '../auth/home.js';

const router = express.Router();

// all routes here require a valid access token
router.use(requireAuth);

// GET /api/me
router.get('/', (req, res) => {
  const roleNames = req.user.roleNames || [];
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,            // include if you put it in the token
      roleNames,
      permissions: req.user.permissions || [],
    },

    nextPath: pickHomePath(roleNames),
  });
});

export default router;
