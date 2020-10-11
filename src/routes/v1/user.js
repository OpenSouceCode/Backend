const express = require('express');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}.jpg`);
  },
});

const upload = multer({ storage });

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/user');
const ROLES = require('../../config/roles');

router.get('/profiles', authenticator(ROLES.ADMIN), controller.getProfiles);
router.get(
  '/profile/:id',
  authenticator(ROLES.ADMIN),
  controller.getProfileById,
);
router.get('/profile', authenticator(), controller.getProfile);
router.patch('/profile', authenticator(), controller.updateProfile);
router.patch('/socials', authenticator(), controller.updateSocials);
router.post(
  '/avatar',
  [authenticator(), upload.single('avatar')],
  controller.updateAvatar,
);

module.exports = router;
