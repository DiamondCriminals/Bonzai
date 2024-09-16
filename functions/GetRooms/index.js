const { sendError, sendResponse } = require('../../services/responses');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');

const TABLE_NAME = 'bonzai_rooms';

exports.handler = async (event) => {
  try {
    sendResponse(201, newRoom);
  } catch (err) {
    sendError(500, err.message);
  }
};
