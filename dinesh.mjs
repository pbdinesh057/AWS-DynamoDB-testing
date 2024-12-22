import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(new DynamoDB());

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
    "Content-Type": "application/json"
};

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const operation = event.operation;
        const payload = event.payload;

        if (event.tableName) {
            payload.TableName = event.tableName;
        }

        let result;
        switch (operation) {
            case 'create':
                result = await dynamo.put(payload);
                break;
            case 'read':
                result = await dynamo.get(payload);
                break;
            case 'update':
                result = await dynamo.update(payload);
                break;
            case 'delete':
                result = await dynamo.delete(payload);
                break;
            case 'list':
                result = await dynamo.scan(payload);
                break;
            case 'echo':
                result = payload;
                break;
            case 'ping':
                result = 'pong';
                break;
            default:
                throw new Error(`Unrecognized operation "${operation}"`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Internal server error',
                errorMessage: error.message
            })
        };
    }
};