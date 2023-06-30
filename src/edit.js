const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const constructUpdateParams = (id, data) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: { id },
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: '',
    ReturnValues: 'UPDATED_NEW',
  };
  let prefix = 'set ';
  Object.keys(data).forEach((key) => {
    params.UpdateExpression += `${prefix}#${key} = :${key}`;
    params.ExpressionAttributeNames[`#${key}`] = key;
    params.ExpressionAttributeValues[`:${key}`] = data[key];
    prefix = ', ';
  });
  return params;
};

const fetchUser = async (id) => {
  const getItemParams = {
    TableName: process.env.TABLE_NAME,
    Key: { id },
  };

  const user = await dynamoDb.get(getItemParams).promise();
  
  if (!user || !user.Item) {
    throw new Error('User not found');
  }
};

const validateRequestBody = (data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('At least one attribute to update is required');
  }
};

const handleUpdate = async (id, data) => {
  const updateParams = constructUpdateParams(id, data);
  const result = await dynamoDb.update(updateParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Attributes),
  };
};

const handleErrorResponse = (error) => {
  console.log(error);
  return {
    statusCode: error.message === 'User not found' || error
    .message === 'At least one attribute to update is required' ? 400 : 500,
    body: JSON.stringify({ error: error.message }),
  };
};

module.exports.handler = async (event) => {
  const { id } = event.pathParameters;
  const data = JSON.parse(event.body);

  try {
    validateRequestBody(data);
    await fetchUser(id);
    return await handleUpdate(id, data);
  } catch (error) {
    return handleErrorResponse(error);
  }
};
