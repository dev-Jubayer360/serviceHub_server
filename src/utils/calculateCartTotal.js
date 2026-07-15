const calculateCartTotal = (items) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return subtotal;
};

module.exports = calculateCartTotal;
