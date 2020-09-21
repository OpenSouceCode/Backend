const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/skillTest');
const ROLES = require('../../config/roles');

router.get('/:testId', authenticator(), controller.getSkillTestQuestions);
router.post('/', authenticator(ROLES.ADMIN), controller.postSkillTest);
router.post(
  '/publish/:testId',
  authenticator(ROLES.ADMIN),
  controller.publishSkillTest,
);
router.post(
  '/question/:testId',
  authenticator(ROLES.ADMIN),
  controller.postSkillTestQuestion,
);
router.patch(
  '/question/:questionId',
  authenticator(ROLES.ADMIN),
  controller.updateSkillTestQuestion,
);
router.patch('/:id', authenticator(ROLES.ADMIN), controller.updateSkillTest);
router.delete(
  '/question/:questionId',
  authenticator(ROLES.ADMIN),
  controller.deleteSkillTestQuestion,
);
router.delete(
  '/publish/:testId',
  authenticator(ROLES.ADMIN),
  controller.unpublishSkillTest,
);

module.exports = router;
