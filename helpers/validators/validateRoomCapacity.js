const { BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');

const TABLE_NAME = process.env.ROOMS_TABLE;

const validateRoomCapacity = async (room_ids, requiredCapacity) => {
  const keys = room_ids.map((id) => ({
    type: 'ROOM',
    room_id: id,
  }));

  console.log('keys', keys);
  const params = {
    RequestItems: {
      [TABLE_NAME]: {
        Keys: keys,
      },
    },
  };
  console.log('params', params);
  try {
    const command = new BatchGetCommand(params);
    console.log('command', command);
    const data = await db.send(command);
    console.log('data.Responses', data.Responses);
    const rooms = data.Responses[TABLE_NAME];

    let totalCapacity = 0;

    for (const room of rooms) {
      const roomCapacity = Number(room.capacity);

      totalCapacity += roomCapacity;

      if (totalCapacity >= requiredCapacity) return true;
    }
  } catch (err) {
    console.log('Error during batch fetching rooms', err);
    throw err;
  }

  return false;
};

module.exports = validateRoomCapacity;
