const { sendResponse, sendError } = require('../../services/responses');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');
const { db } = require('../../services/db');

const BOOKING_LIST = 'bonzai_bookings';

exports.handler = async() => {

    const getBookings = {
        TableName: BOOKING_LIST,
        IndexName: 'BookingIdIndex',
        KeyConditionExpression: 'begins_with(booking_id, :prefix)',
        ExpressionAttributeValues: {
            ':prefix': 'RESERVATION',
        }
    }

    console.log(getBookings, 'getbok');
    

    try {
        const command = new QueryCommand(getBookings);
        console.log(command, 'command');
        const result = await db.send(command); 

        const items = result.Items || []

        console.log(result, 'items');

        return sendResponse(201, items)
    } catch(error) {
        return sendError(500, error.message)
    }
}