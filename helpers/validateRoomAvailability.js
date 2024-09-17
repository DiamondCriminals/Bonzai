const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../services/db');

const TABLE_NAME = 'bonzai_bookings';

const validateRoomAvailability = async (
  room_ids,
  checkin_date,
  checkout_date
) => {
  const checkinDate = new Date(checkin_date);
  const checkoutDate = new Date(checkout_date);

  for (const room_id of room_ids) {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'room_id = :room_id',
      ExpressionAttributeValues: {
        ':room_id': room_id,
      },
    };

    try {
      const command = new QueryCommand(params);
      const data = await db.send(command);

      const hasOverlap = data.Items.some((item) => {
        const itemCheckinDate = new Date(item.checkin_date);
        const itemCheckoutDate = new Date(item.checkout_date);

        return itemCheckinDate < checkoutDate && itemCheckoutDate > checkinDate;
      });

      if (hasOverlap) return false;
    } catch (err) {
      console.log(`Error checking room availability for room ${room_id}:`, err);
      throw err;
    }
  }

  return true;
};

module.exports = validateRoomAvailability;
