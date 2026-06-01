import { Router } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { withValidation, onboardingSchemas } from '../proxy/validationProxy';
import { asyncHandler } from '../proxy';

const router = Router();

router.post(
  '/setup',
  withValidation(
    { body: onboardingSchemas.setup },
    asyncHandler(onboardingController.setup.bind(onboardingController))
  )
);

router.get('/check-slug/:slug', asyncHandler(onboardingController.checkSlug.bind(onboardingController)));

export default router;
