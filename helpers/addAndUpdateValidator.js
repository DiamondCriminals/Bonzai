const { sendError } = require('../services/responses');
const validateBookingRequest = require('./validators/validateBookingsRequest');
const validateRoomAvailability = require('./validators/validateRoomAvailability');
const validateRoomCapacity = require('./validators/validateRoomCapacity');

const addAndUpdateValidator = async (request, booking_id) => {
  const isValidRequest = validateBookingRequest(request);
  if (!isValidRequest.valid)
    return { valid: false, message: isValidRequest.message };

  console.log('booking_id', booking_id);
  try {
    const isCapacityValid = await validateRoomCapacity(
      request.room_ids,
      request.quantity
    );
    if (!isCapacityValid)
      throw new Error(
        'Total room capacity is less than the required quantity.'
      );
  } catch (err) {
    return {
      valid: false,
      message: err.message,
    };
  }

  try {
    const isAvailable = await validateRoomAvailability(
      request.room_ids,
      new Date(request.checkin_date),
      new Date(request.checkout_date),
      booking_id
    );
    if (!isAvailable) {
      throw new Error(
        'One or more rooms are not available for the selected dates.'
      );
    }
  } catch (err) {
    return {
      valid: false,
      message: err.message,
    };
  }

  return { valid: true };
};

module.exports = addAndUpdateValidator;
