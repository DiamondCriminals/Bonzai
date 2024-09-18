const { sendResponse, sendError } = require('../../services/responses');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');

const BOOKING_LIST = process.env.BOOKINGS_TABLE;

exports.handler = async () => {
  const params = {
    TableName: BOOKING_LIST,
    IndexName: 'BookingTypeIndex',
    KeyConditionExpression: '#typeAlias = :typeValue',
    ExpressionAttributeNames: {
      '#typeAlias': 'type',
    },
    ExpressionAttributeValues: {
      ':typeValue': 'RESERVATION',
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await db.send(command);

    const groupedBookings = [];

    result.Items.forEach((result) => {
      const { booking_id, room_id, ...fields } = result;

      if (groupedBookings[booking_id]) {
        groupedBookings[booking_id].room_ids.push(room_id);
      } else {
        groupedBookings[booking_id] = {
          ...fields,
          booking_id: booking_id,
          room_ids: [room_id],
        };
      }
    });

    const mergedResults = Object.values(groupedBookings);

    return sendResponse(201, mergedResults);
  } catch (error) {
    return sendError(500, error.message);
  }
};
