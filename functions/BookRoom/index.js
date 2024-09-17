const { sendError, sendResponse } = require('../../services/responses');
const { PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');
const calculateDateDiff = require('../../helpers/calculateDateDiff');
const getRoomsForValidation = require('../../helpers/getRoomsForValidation');
const validateRoomCapacity = require('../../helpers/validateRoomCapacity');
const {
  validateRoomAvailability,
} = require('../../helpers/validateRoomAvailability');
const {
  getTotalPricePerNight,
} = require('../../helpers/getTotalPricePerNight');

const TABLE_NAME = 'bonzai_bookings';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const checkin_date = new Date(body.checkin_date);
  const checkout_date = new Date(body.checkout_date);
  const nightsToStay = calculateDateDiff(checkin_date, checkout_date);
  const roomPrice = '500';
  const room_ids = body.room_ids;

  const booking_id = uuid();

  try {
    const isCapacityValid = await validateRoomCapacity(room_ids, body.quantity);
    if (!isCapacityValid)
      return sendError(
        400,
        'Total room capacity is less than the required quantity.'
      );
  } catch (err) {
    console.log('Error during room capacity validation:', err);
    return sendError(500, err.message);
  }

  try {
    const isAvailable = await validateRoomAvailability(
      room_ids,
      checkin_date,
      checkout_date
    );
    if (!isAvailable) {
      return sendError(
        400,
        'One or more rooms are not available for the selected dates.'
      );
    }
  } catch (err) {
    console.log('Error during room availability validation:', err);
    return sendError(500, err.message);
  }

  const totalPricePerNight = await getTotalPricePerNight(room_ids);
  const totalCost = totalPricePerNight * nightsToStay;

  const newBookings = room_ids.map((id) => ({
    PutRequest: {
      Item: {
        room_id: id,
        checkin_date: checkin_date.toISOString(),
        checkout_date: checkout_date.toISOString(),
        bookings_id: booking_id,
        total_cost: totalCost,
        booker: body.name,
      },
    },
  }));

  console.log('newBookings', newBookings);

  const params = {
    RequestItems: {
      [TABLE_NAME]: newBookings,
    },
  };
  try {
    const command = new BatchWriteCommand(params);
    await db.send(command);
    return sendResponse(201, { booking_id, totalCost });
  } catch (err) {
    console.log('err', err);
    sendError(500, err.message);
  }
};
