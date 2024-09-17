const { BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../services/db');

const TABLE_NAME = 'bonzai_rooms';

exports.validateRoomCapacity = async (room_ids, requiredCapacity) => {
  const keys = room_ids.map((type) => ({
    id: 'ROOM',
    type: type,
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

    const rooms = data.Responses[TABLE_NAME];

    let totalCapacity = 0;

    for (const room of rooms) {
      const roomCapacity = room.capacity;

      totalCapacity += roomCapacity;

      if (totalCapacity >= requiredCapacity) return true;
    }
  } catch (err) {
    console.log('Error during batch fetching rooms', err);
    throw err;
  }

  return false;
};
