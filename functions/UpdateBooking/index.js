const { sendError, sendResponse } = require('../../services/responses');
const {
  BatchWriteCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const calculateDateDiff = require('../../helpers/calculateDateDiff');
const {
  getTotalPricePerNight,
} = require('../../helpers/getTotalPricePerNight');
const addAndUpdateValidator = require('../../helpers/addAndUpdateValidator');

const TABLE_NAME = process.env.BOOKINGS_TABLE;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const checkin_date = new Date(body.checkin_date);
  const checkout_date = new Date(body.checkout_date);
  const nightsToStay = calculateDateDiff(checkin_date, checkout_date);
  const new_room_ids = body.room_ids;
  const booking_id = event.pathParameters.id;

  const isValid = await addAndUpdateValidator(body, booking_id);
  if (!isValid.valid) return sendError(400, isValid.message);

  const totalPricePerNight = await getTotalPricePerNight(new_room_ids);
  const totalCost = totalPricePerNight * nightsToStay;

  const queryParams = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'booking_id = :booking_id',
    ExpressionAttributeValues: {
      ':booking_id': booking_id,
    },
  };

  console.log('queryParams', queryParams);
  try {
    const queryCommand = new QueryCommand(queryParams);
    console.log('queryCommand', queryCommand);
    const { Items } = await db.send(queryCommand);

    if (Items.length == 0) sendError(404, 'Reservation not found');

    const existingRoomIds = Items.map((item) => item.room_id);
    const roomsToDelete = existingRoomIds.filter(
      (id) => !new_room_ids.includes(id)
    );
    const roomsToAdd = new_room_ids.filter(
      (id) => !existingRoomIds.includes(id)
    );
    const roomsToUpdate = existingRoomIds.filter((id) =>
      new_room_ids.includes(id)
    );

    const deleteRequests = roomsToDelete.map((room_id) => ({
      DeleteRequest: {
        Key: {
          booking_id: booking_id,
        },
        ConditionExpression: 'room_id = :room_id',
        ExpressionAttributeValues: {
          ':room_id': room_id,
        },
      },
    }));
    console.log('deleteRequests', deleteRequests);

    const putRequests = roomsToAdd.map((room_id) => ({
      PutRequest: {
        Item: {
          booking_id: booking_id,
          room_id: room_id,
          checkin_date: checkin_date.toISOString(),
          checkout_date: checkout_date.toISOString(),
          total_cost: totalCost,
          quantity: body.quantity,
          type: 'RESERVATION',
        },
      },
    }));
    console.log('putRequests', putRequests);

    const updateRequests = roomsToUpdate.map((room_id) => ({
      Key: {
        booking_id: booking_id,
      },
      UpdateExpression:
        'SET checkin_date = :checkin_date, checkout_date = :checkout_date, total_cost = :total_cost, quantity = :quantity',
      ExpressionAttributeValues: {
        ':checkin_date': checkin_date.toISOString(),
        ':checkout_date': checkout_date.toISOString(),
        ':total_cost': totalCost,
        ':quantity': body.quantity,
      },
      ReturnValues: 'ALL_NEW',
    }));

    const batchRequest = [...deleteRequests, ...putRequests];
    console.log('batchRequest', batchRequest);

    try {
      if (batchRequest.length > 0) {
        console.log('batchRequest.length', batchRequest.length);
        const batchParams = {
          RequestItems: {
            [TABLE_NAME]: batchRequest,
          },
        };
        const batchCommand = new BatchWriteCommand(batchParams);
        await db.send(batchCommand);
      }

      for (const request of updateRequests) {
        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          ...request,
        });
        console.log('command', command);
        await db.send(command);
      }

      return sendResponse(200, {
        booking_id,
        totalCost,
        message: 'Successfully updated reservation.',
      });
    } catch (err) {
      console.log('Error during batch operation:', err);
      return sendError(500, err.message);
    }
  } catch (err) {
    console.log('Error during update of reservation:', err);
    sendError(500, err.message);
  }
};
