const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../services/db');

const TABLE_NAME = 'bonzai_bookings';

exports.validateRoomAvailability = async (
  room_ids,
  checkin_date,
  checkout_date
) => {
  for (const room of room_ids) {
    const room_id = room;

    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression:
        'room_id = :room_id AND (checkin_date BETWEEN :checkin_date AND :checkout_date OR checkout_date BETWEEN :checkin_date AND :checkout_date)',
      ExpressionAttributeValues: {
        ':room_id': room_id,
        ':checkin_date': checkin_date.toISOString(),
        ':checkout_date': checkout_date.toISOString(),
      },
    };

    try {
      const command = new QueryCommand(params);
      const data = await db.seend(command);

      if (data.Items.length > 0) return false;
    } catch (err) {
      console.log(`Error checking room availability for room ${room_id}`);
      throw err;
    }
  }

  return true;
};
