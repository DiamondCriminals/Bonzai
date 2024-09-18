const { sendError, sendResponse } = require('../../services/responses');
const { BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');
const calculateDateDiff = require('../../helpers/calculateDateDiff');
const {
  getTotalPricePerNight,
} = require('../../helpers/getTotalPricePerNight');
const addAndUpdateValidator = require('../../helpers/addAndUpdateValidator');

const TABLE_NAME = process.env.BOOKINGS_TABLE;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const checkin_date = new Date(body.checkin_date);
  const checkout_date = new Date(body.checkout_date);
  const nightsToStay = calculateDateDiff(checkin_date, checkout_date);
  const room_ids = body.room_ids;

  console.log('body', body);
  const booking_id = uuid();

  const isValid = await addAndUpdateValidator(body, booking_id);
  console.log('isValid', isValid);
  if (!isValid.valid) return sendError(400, isValid.message);

  const totalPricePerNight = await getTotalPricePerNight(room_ids);
  const totalCost = totalPricePerNight * nightsToStay;

  const newBookings = room_ids.map((id) => ({
    PutRequest: {
      Item: {
        room_id: id,
        checkin_date: checkin_date.toISOString(),
        checkout_date: checkout_date.toISOString(),
        booking_id: booking_id,
        total_cost: totalCost,
        quantity: Number(body.quantity),
        booker: body.name,
        type: 'RESERVATION',
      },
    },
  }));

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
