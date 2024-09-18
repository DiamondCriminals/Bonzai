const { sendResponse, sendError } = require('../../services/responses');
const { db } = require('../../services/db');
const { BatchWriteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const BOOKING_LIST = 'bonzai_bookings';

exports.handler = async (event) => {
  console.log('event', event);
  const bookingId = event.pathParameters.id;

  console.log('bookingId', bookingId);

  const queryParams = {
    TableName: BOOKING_LIST,
    IndexName: 'BookingIdIndex',
    KeyConditionExpression: 'booking_id = :bookingId',
    ExpressionAttributeValues: {
      ':bookingId': bookingId,
    },
  };

  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await db.send(queryCommand);
    console.log('queryResult', queryResult);
    const { checkin_date } = queryResult.Items[0];
    const currentDate = new Date();

    const checkinDate = new Date(checkin_date);
    const diffTime = checkinDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 2) {
      return sendError(400, 'Too close to checkin date to cancel reservation.');
    }

    const deleteRequests = queryResult.Items.map((item) => ({
      DeleteRequest: {
        Key: {
          room_id: item.room_id,
          checkin_date: item.checkin_date,
        },
      },
    }));

    const batchParams = {
      RequestItems: {
        [BOOKING_LIST]: deleteRequests,
      },
    };

    const command = new BatchWriteCommand(batchParams);
    await db.send(command);

    return sendResponse(204, '');
  } catch (err) {
    return sendError(500, err.message);
  }
};
