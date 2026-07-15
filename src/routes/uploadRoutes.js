const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage, uploadMultipleImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Note: If you want normal users to upload (e.g. avatars), remove adminOnly.
// Assuming only admin uploads product/brand/category images.
router.use(protect); // Require login

router.post('/', upload.single('image'), uploadImage);
router.post('/multiple', upload.array('images', 5), uploadMultipleImages); // max 5 images

module.exports = router;
