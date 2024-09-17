const { sendError, sendResponse } = require('../../services/responses');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');

const TABLE_NAME = 'bonzai_rooms';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const newRoom = {
    id: 'ROOM',
    room_type: `#${body.room_type}:${uuid()}`,
    price: Number(body.price),
    capacity: Number(body.capacity),
  };

  const params = {
    TableName: TABLE_NAME,
    Item: newRoom,
  };

  const command = new PutCommand(params);
  try {
    await db.send(command);

    return sendResponse(201, newRoom);
  } catch (err) {
    sendError(500, err.message);
  }
};
