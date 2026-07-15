const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/authMiddleware');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:serviceId/reviews', reviewRouter);

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
