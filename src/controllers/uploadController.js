const axios = require('axios');
const FormData = require('form-data');

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    const base64Image = req.file.buffer.toString('base64');
    
    const formData = new FormData();
    formData.append('image', base64Image);
    
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        }
      }
    );

    if (response.data && response.data.data) {
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: response.data.data.url,
          delete_url: response.data.data.delete_url
        }
      });
    } else {
      res.status(500);
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('ImgBB API Error:', error.response.data);
    }
    next(new Error('Image upload failed'));
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No image files provided');
    }

    const uploadPromises = req.files.map(async (file) => {
      const base64Image = file.buffer.toString('base64');
      const formData = new FormData();
      formData.append('image', base64Image);
      
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          }
        }
      );
      return response.data.data.url;
    });

    const urls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: urls,
    });
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('ImgBB API Error:', error.response.data);
    }
    next(new Error('Multiple images upload failed'));
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
};
