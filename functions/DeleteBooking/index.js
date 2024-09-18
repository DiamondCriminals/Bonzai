const { sendResponse, sendError } = require('../../services/responses');
const { db } = require('../../services/db');
const { BatchWriteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const BOOKING_LIST = process.env.BOOKINGS_TABLE;

exports.handler = async (event) => {
  const bookingId = event.pathParameters.id;

  const queryParams = {
    TableName: BOOKING_LIST,
    KeyConditionExpression: 'booking_id = :bookingId',
    ExpressionAttributeValues: {
      ':bookingId': bookingId,
    },
  };

  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await db.send(queryCommand);
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
          booking_id: item.room_id,
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
