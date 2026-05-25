import { Router } from 'express';
import { userController } from '../controllers/userController';
import { withAuth, withRoles, asyncHandler } from '../proxy';
import { UserRole } from '../types/enums';

const router = Router();

// All routes require authentication
router.use(withAuth((req, res, next) => next()));

// GET /api/users - List users with filters (role, isActive, search) and pagination
// Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER
router.get(
  '/',
  withRoles([UserRole.SYSTEM_ADMIN, UserRole.QUALITY_MANAGER], (req, res, next) => next()),
  asyncHandler(userController.list.bind(userController))
);

// GET /api/users/:id - Get user by ID
// Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER, or self (handled in controller)
router.get(
  '/:id',
  asyncHandler(userController.getById.bind(userController))
);

// PUT /api/users/:id - Update user profile
// Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER, or self (handled in controller)
router.put(
  '/:id',
  asyncHandler(userController.update.bind(userController))
);

// POST /api/users/:id/toggle-active - Activate/deactivate user
// Accessible by: SYSTEM_ADMIN only (enforced in controller)
router.post(
  '/:id/toggle-active',
  asyncHandler(userController.toggleActive.bind(userController))
);

// POST /api/users/:id/change-role - Change user role
// Accessible by: SYSTEM_ADMIN only (enforced in controller)
router.post(
  '/:id/change-role',
  asyncHandler(userController.changeRole.bind(userController))
);

export default router;
