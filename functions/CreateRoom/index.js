const { sendError, sendResponse } = require('../../services/responses');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');
const generateRoomFields = require('../../helpers/generateRoomFields');

const TABLE_NAME = process.env.ROOMS_TABLE;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log('body', body);
  const { capacity } = body;

  if (capacity == undefined)
    return sendError(400, 'Need to give how many people fits in the room.');

  const roomFields = generateRoomFields(Number(capacity));

  if (roomFields.error) return sendError(400, roomFields.message);

  const newRoom = {
    type: `ROOM`,
    room_id: `${roomFields.type}:${uuid()}`,
    price: Number(roomFields.price),
    capacity: Number(capacity),
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
