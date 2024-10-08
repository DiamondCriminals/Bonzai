const { BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../services/db');

const TABLE_NAME = process.env.ROOMS_TABLE;

exports.getTotalPricePerNight = async (room_ids) => {
  const keys = room_ids.map((id) => ({
    type: 'ROOM',
    room_id: id,
  }));

  const params = {
    RequestItems: {
      [TABLE_NAME]: {
        Keys: keys,
      },
    },
  };

  try {
    const command = new BatchGetCommand(params);
    const data = await db.send(command);

    const totalPricePerNight = data.Responses[TABLE_NAME].reduce(
      (sum, room) => {
        const pricePerNight = Number(room.price) || 0;
        return sum + pricePerNight;
      },
      0
    );

    return totalPricePerNight;
  } catch (err) {
    console.log('Error fetching roominfo to get price:', err);
    throw err;
  }
};
