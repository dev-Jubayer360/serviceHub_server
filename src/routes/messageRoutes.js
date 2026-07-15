const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getContacts,
  getMessages,
} = require('../controllers/messageController');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/contacts', getContacts);
router.get('/:userId', getMessages);

module.exports = router;
