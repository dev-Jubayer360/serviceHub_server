const calculateDiscount = (subtotal, coupon) => {
  if (!coupon || coupon.status !== 'Active') return 0;
  
  if (coupon.minimumOrder > 0 && subtotal < coupon.minimumOrder) return 0;

  let discountAmount = 0;
  if (coupon.discountType === 'Fixed') {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === 'Percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
  }

  // Ensure discount is not greater than subtotal and round to nearest integer
  return Math.round(discountAmount > subtotal ? subtotal : discountAmount);
};

module.exports = calculateDiscount;
