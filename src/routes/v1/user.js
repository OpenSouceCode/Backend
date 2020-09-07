const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/user');
const ROLES = require('../../config/roles');

router.get('/', authenticator(ROLES.ADMIN), controller.getProfiles);
router.get('/:id', authenticator(ROLES.ADMIN), controller.getProfileById);
router.get('/profile', authenticator(), controller.getProfile);
router.patch('/profile', authenticator(), controller.updateProfile);
router.patch('/socials', authenticator(), controller.updateSocials);

module.exports = router;
