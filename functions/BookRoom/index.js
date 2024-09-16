const { sendError, sendResponse } = require('../../services/responses');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');
const calculateDateDiff = require('../../helpers/calculateDateDiff');

const TABLE_NAME = 'bonzai_bookings';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const room_id = event.pathParameters.id;
  const checkin_date = new Date(body.checkin_date);
  const checkout_date = new Date(body.checkout_date);
  const nightsToStay = calculateDateDiff(checkin_date, checkout_date);
  const roomPrice = '1000';

  const newBooking = {
    id: room_id,
    checkin_date: body.checkin_date,
    checkout_date: body.checkout_date,
    bookings_id: uuid(),
    total_cost: Number(roomPrice) * nightsToStay,
    booker: body.name,
  };

  console.log('newBooking', newBooking);

  const params = {
    TableName: TABLE_NAME,
    Item: newBooking,
  };

  console.log('params', params);
  const command = new PutCommand(params);
  console.log('command', command);
  try {
    const dbaction = await db.send(command);
    console.log('dbaction', dbaction);
    sendResponse(201, params.Item);
  } catch (err) {
    sendError(500, err.message);
  }
};
