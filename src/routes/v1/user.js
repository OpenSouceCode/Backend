const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/user');
const ROLES = require('../../config/roles');

router.get('/', authenticator(ROLES.ADMIN), controller.getProfiles);
router.get('/profile', authenticator(ROLES.USER), controller.getProfile);
router.patch('/profile', authenticator(ROLES.USER), controller.updateProfile);
router.patch('/socials', authenticator(ROLES.USER), controller.updateSocials);

module.exports = router;
