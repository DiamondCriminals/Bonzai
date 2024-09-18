const validateBookingRequest = (body) => {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, message: 'Request body must be an object.' };
  }

  if (!Array.isArray(body.room_ids) || body.room_ids.length === 0) {
    return { valid: false, message: 'Room_ids must be a non-empty array.' };
  }

  if (
    typeof body.checkin_date !== 'string' ||
    !isValidDate(body.checkin_date)
  ) {
    return {
      valid: false,
      message: 'Checkin_date must be a valid date string in YYYY-MM-DD format.',
    };
  }

  if (
    typeof body.checkout_date !== 'string' ||
    !isValidDate(body.checkout_date)
  ) {
    return {
      valid: false,
      message:
        'Checkout_date must be a valid date string in YYYY-MM-DD format.',
    };
  }

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return { valid: false, message: 'Name must be a non-empty string.' };
  }

  if (typeof body.quantity !== 'number' || body.quantity <= 0) {
    return { valid: false, message: 'Quantity must be a positive number.' };
  }

  const dateValidation = validateBookingDates(
    body.checkin_date,
    body.checkout_date
  );

  if (!dateValidation.valid) {
    return dateValidation;
  }

  return { valid: true, message: 'Request body is valid.' };
};

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  return true;
};

const validateBookingDates = (checkin_date, checkout_date) => {
  const today = new Date();
  const checkinDate = new Date(checkin_date);
  const checkoutDate = new Date(checkout_date);

  if (checkinDate < today)
    return { valid: false, message: 'Cant reserve a room back in time.' };
  if (checkoutDate < checkinDate)
    return { valid: false, message: 'Cant stay at the hotel for minusdays.' };

  return { valid: true, message: 'Dates are valid' };
};

module.exports = validateBookingRequest;
