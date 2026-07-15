const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    
    if (!receiverId || !text) {
      res.status(400);
      throw new Error('Receiver ID and text are required');
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contacts (users you have chatted with)
// @route   GET /api/messages/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all unique users the current user has exchanged messages with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const contactMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender.toString() === userId.toString();
      const contactId = isSender ? msg.receiver.toString() : msg.sender.toString();

      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          contactId,
          lastMessage: msg.text,
          time: msg.createdAt,
          unread: !isSender && !msg.isRead ? 1 : 0,
        });
      } else {
        if (!isSender && !msg.isRead) {
          contactMap.get(contactId).unread += 1;
        }
      }
    });

    const contactIds = Array.from(contactMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }).select('name role image');

    const contacts = users.map((user) => {
      const contactInfo = contactMap.get(user._id.toString());
      return {
        id: user._id,
        name: user.name,
        role: user.role,
        image: user.image,
        lastMessage: contactInfo.lastMessage,
        time: contactInfo.time,
        unread: contactInfo.unread,
      };
    });

    // Sort contacts by latest message time
    contacts.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getContacts,
  getMessages,
};
