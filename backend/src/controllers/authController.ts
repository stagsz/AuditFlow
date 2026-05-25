import { Request, Response } from 'express';
import { authService } from '../services/authService';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, organizationId, role } = req.body;

    const user = await authService.register({
      email,
      password,
      firstName,
      lastName,
      organizationId,
      role,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const { user, tokens } = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user,
        ...tokens,
      },
    });
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  }

  /**
   * POST /api/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user!.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  /**
   * GET /api/auth/me
   */
  async me(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: req.user,
    });
  }
}

export const authController = new AuthController();
