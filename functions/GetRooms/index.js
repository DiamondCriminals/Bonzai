const { sendError, sendResponse } = require('../../services/responses');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');

const TABLE_NAME = process.env.ROOMS_TABLE;

exports.handler = async () => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#typeAlias = :typeValue',
    ExpressionAttributeNames: {
      '#typeAlias': 'type',
    },
    ExpressionAttributeValues: {
      ':typeValue': 'ROOM',
    },
  };
  try {
    const command = new QueryCommand(params);
    const { Items } = await db.send(command);

    return sendResponse(201, Items);
  } catch (err) {
    return sendError(500, err.message);
  }
};
