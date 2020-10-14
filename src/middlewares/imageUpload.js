const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const imageType = file.originalname.split('.').slice(-1).pop();
    cb(null, `${file.fieldname}-${Date.now()}.${imageType}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    if (fileType !== 'image') {
      req.fileValidationError = 'File type not image!';
      return cb(null, false, new Error('File type should be an image only!'));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
