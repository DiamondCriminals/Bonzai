const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { sendError, sendResponse } = require('../../services/responses');

const TABLE_NAME = process.env.BOOKINGS_TABLE;

exports.handler = async (event) => {
  const booking_id = event.pathParameters.id;

  const queryParams = {
    TableName: TABLE_NAME,
    IndexName: 'BookingIdIndex',
    KeyConditionExpression: 'booking_id = :booking_id',
    ExpressionAttributeValues: {
      ':booking_id': booking_id,
    },
  };
  try {
    const command = new QueryCommand(queryParams);
    const result = await db.send(command);

    if (result.Items.length == 0)
      return sendError(404, `No bookings found on ${booking_id}`);

    const [firstItem] = result.Items;
    const { room_id, ...fields } = firstItem;

    const room_ids = result.Items.map((item) => item.room_id);
    const Item = {
      ...fields,
      room_ids,
    };

    return sendResponse(200, Item);
  } catch (err) {
    console.log('Error:', err);
    return sendError(500, err.message);
  }
};
