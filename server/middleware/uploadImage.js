const multer = require('multer');
const path = require('path');

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/images'); // Save images to this folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get file extension
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// File Filter (Only Images Allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only images (JPG, PNG, GIF) are allowed!'), false);
  }
};

// Multer Upload Middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload.single('image'); // Accepts a single image with key 'image'
