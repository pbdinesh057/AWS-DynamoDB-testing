const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ddb-testing'; // Replace with your DynamoDB table name

// Generate a simple unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2);
}

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // CORS headers for all responses
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'
    };

    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        let response;

        switch (event.httpMethod) {
            case 'POST':
                response = await handlePost(event);
                break;
            case 'GET':
                response = await handleGet();
                break;
            default:
                response = {
                    statusCode: 400,
                    body: JSON.stringify({ message: `Unsupported method: ${event.httpMethod}` })
                };
        }

        return {
            ...response,
            headers
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Internal server error',
                errorDetail: error.message
            })
        };
    }
};

async function handlePost(event) {
    const userData = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = ['name', 'email', 'company', 'favoritePlayer', 'bikeOwned'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing required fields',
                fields: missingFields
            })
        };
    }

    const item = {
        id: generateId(),
        ...userData,
        timestamp: new Date().toISOString()
    };

    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'User added successfully',
            user: item
        })
    };
}

async function handleGet() {
    const result = await dynamoDB.scan({
        TableName: TABLE_NAME
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
    };
}