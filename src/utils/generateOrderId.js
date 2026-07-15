const generateOrderId = () => {
  const prefix = 'NEX';
  const timestamp = Date.now().toString().slice(-6);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

module.exports = generateOrderId;
