const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  addFavourite,
  getFavourites,
  removeFavourite,
  checkFavourite
} = require('../controllers/favouriteController');

const router = express.Router();

// Only customers can favourite services
router.use(protect);
router.use(authorize('customer'));

router.route('/')
  .post(addFavourite)
  .get(getFavourites);

router.route('/:serviceId')
  .delete(removeFavourite);
  
router.get('/check/:serviceId', checkFavourite);

module.exports = router;
