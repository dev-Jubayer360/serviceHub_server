const sendEmail = require('../utils/sendEmail');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    const htmlMessage = `
      <h3>New Contact Request</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send email to the site owner (SMTP_USER)
    await sendEmail({
      email: process.env.SMTP_USER,
      subject: `Contact Form Submission: ${subject}`,
      message: `You have received a new contact request from ${name} (${email}).\n\nMessage:\n${message}`,
      html: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: 'Contact email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendContactEmail,
};
