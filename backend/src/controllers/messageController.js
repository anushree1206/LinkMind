import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import replySimulationService from '../services/replySimulationService.js';

// Create a new message and schedule reply simulation
export const createMessage = async (req, res) => {
  try {
    const { contactId, content, type = 'Email', subject, priority = 'Medium' } = req.body;
    const userId = req.user.id;

    // Validate contact exists and belongs to user
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Create the message
    const message = new Message({
      user: userId,
      contact: contactId,
      content,
      type,
      subject,
      priority,
      status: 'pending'
    });

    await message.save();

    // Update contact's lastContacted field
    contact.lastContacted = new Date();
    await contact.save();

    // Schedule reply simulation (30 seconds to 5 minutes delay)
    await replySimulationService.scheduleReply(message._id.toString());

    // Populate contact info for response
    await message.populate('contact', 'fullName company jobTitle email');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get messages for a user with filters
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId, status, type, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filters = {
      contactId,
      status,
      type,
      dateFrom,
      dateTo
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const messages = await Message.findByUserWithFilters(userId, filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalMessages = await Message.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get a specific message by ID
export const getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({ _id: messageId, user: userId })
      .populate('contact', 'fullName company jobTitle email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Update message status (useful for manual testing)
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, replyContent } = req.body;
    const userId = req.user.id;

    const message = await Message.findOne({ _id: messageId, user: userId });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Cancel scheduled reply if changing from pending
    if (message.status === 'pending' && status !== 'pending') {
      await replySimulationService.cancelScheduledReply(messageId);
    }

    message.status = status;
    if (status === 'responded' && replyContent) {
      message.replyContent = replyContent;
      message.repliedAt = new Date();
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({ _id: messageId, user: userId });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Cancel scheduled reply if pending
    if (message.status === 'pending') {
      await replySimulationService.cancelScheduledReply(messageId);
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Get message statistics for a user
export const getMessageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await replySimulationService.getUserAnalytics(userId);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
};
