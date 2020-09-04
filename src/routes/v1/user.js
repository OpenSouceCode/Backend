const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/user');

router.get('/', authenticator, controller.getProfiles);
router.get('/profile', authenticator, controller.getProfile);
router.patch('/profile', authenticator, controller.updateProfile);
router.patch('/socials', authenticator, controller.updateSocials);

module.exports = router;
