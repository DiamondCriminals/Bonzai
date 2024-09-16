const { sendError, sendResponse } = require('../../services/responses');
const { PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { v4: uuid } = require('uuid');
const calculateDateDiff = require('../../helpers/calculateDateDiff');

const TABLE_NAME = 'bonzai_bookings';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const checkin_date = new Date(body.checkin_date);
  const checkout_date = new Date(body.checkout_date);
  const nightsToStay = calculateDateDiff(checkin_date, checkout_date);
  const roomPrice = '500';
  const room_ids = body.room_ids;

  const booking_id = uuid();

  // Att få in här är totalt pris för hela bokningen istället för varje rum, skapas upp ett objekt per rum i en hel bokning men alla med samma bokningsnummer.

  // I forEach-loopen så krävs även validering per rum att det inte är bokat, om bokat så kasta ett fel om att rum ej är tillgängligt

  // Även kontrollera så att den summerade capacity inte understiger quantity i request

  //* REQUESTOBJEKT
  //   {
  //     "room_ids": [],
  //     "checkin_date": "2024-09-17",
  //     "checkout_date": "2024-09-21",
  //     "name": "Anton",
  //     "quantity":
  // }

  const newBookings = room_ids.map((id) => ({
    PutRequest: {
      Item: {
        room_id: id,
        checkin_date: checkin_date.toISOString(),
        checkout_date: checkout_date.toISOString(),
        bookings_id: booking_id,
        total_cost: Number(roomPrice) * nightsToStay,
        booker: body.name,
      },
    },
  }));

  console.log('newBookings', newBookings);

  const params = {
    RequestItems: {
      [TABLE_NAME]: newBookings,
    },
  };

  console.log('params', params);
  try {
    const command = new BatchWriteCommand(params);
    console.log('command', command);
    await db.send(command);
    sendResponse(201, params.Item);
  } catch (err) {
    console.log('err', err);
    sendError(500, err.message);
  }
};
