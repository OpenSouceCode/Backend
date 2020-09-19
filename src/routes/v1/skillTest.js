const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/skillTest');
const ROLES = require('../../config/roles');

router.post('/', authenticator(ROLES.ADMIN), controller.postSkillTest);
router.patch('/:id', authenticator(ROLES.ADMIN), controller.updateSkillTest);

module.exports = router;
