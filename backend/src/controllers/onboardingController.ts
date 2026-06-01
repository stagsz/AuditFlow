import { Request, Response } from 'express';
import { onboardingService } from '../services/onboardingService';

export class OnboardingController {
  async setup(req: Request, res: Response): Promise<void> {
    const result = await onboardingService.setupOrganization(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async checkSlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const available = await onboardingService.checkSlugAvailable(slug);
    res.json({ success: true, data: { available } });
  }
}

export const onboardingController = new OnboardingController();
