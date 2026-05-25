import { Router } from 'express';
import authRoutes from './authRoutes';
import assessmentRoutes from './assessmentRoutes';
import standardsRoutes from './standardsRoutes';
import dashboardRoutes from './dashboardRoutes';
import userRoutes from './userRoutes';
import templateRoutes from './templateRoutes';
import healthRoutes from './healthRoutes';
import { evidenceRouter, responseEvidenceRouter } from './evidenceRoutes';
import { nonConformityRouter, assessmentNCRRouter } from './nonConformityRoutes';
import { actionRouter, ncrActionRouter } from './correctiveActionRoutes';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/standards', standardsRoutes);
router.use('/evidence', evidenceRouter);
router.use('/responses/:id/evidence', responseEvidenceRouter);
router.use('/non-conformities', nonConformityRouter);
router.use('/assessments/:id/non-conformities', assessmentNCRRouter);
router.use('/actions', actionRouter);
router.use('/non-conformities/:id/actions', ncrActionRouter);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/templates', templateRoutes);

export default router;
