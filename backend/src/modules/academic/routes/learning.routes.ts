import { Router } from 'express';
import { LearningController } from '../controllers/learning.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(protect, tenantMiddleware);

// Online Classes
router.route('/online-classes')
  .post(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.createOnlineClass)
  .get(LearningController.getOnlineClasses);

router.route('/online-classes/:id')
  .put(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.updateOnlineClass)
  .delete(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.deleteOnlineClass);

// Projects
router.route('/projects')
  .post(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.createProject)
  .get(LearningController.getProjects);

router.route('/projects/:id')
  .put(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.updateProject)
  .delete(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.deleteProject);

// Special Classes
router.route('/special-classes')
  .post(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.createSpecialClass)
  .get(LearningController.getSpecialClasses);

router.route('/special-classes/:id')
  .put(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.updateSpecialClass)
  .delete(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.deleteSpecialClass);

// Assessments
router.route('/assessments')
  .post(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.createAssessment)
  .get(LearningController.getAssessments);

router.route('/assessments/:id')
  .put(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.updateAssessment)
  .delete(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.deleteAssessment);

// Lab Experiments
router.route('/lab-experiments')
  .post(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.createLabExperiment)
  .get(LearningController.getLabExperiments);

router.route('/lab-experiments/:id')
  .put(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.updateLabExperiment)
  .delete(restrictTo('Teacher', 'Admin', 'Super Admin'), LearningController.deleteLabExperiment);

export default router;
