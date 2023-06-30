const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const constructDeleteParams = (id) => ({
  TableName: process.env.TABLE_NAME,
  Key: { id },
});

const getUserData = async (params) => {
  const userData = await dynamoDb.get(params).promise();

  if (!userData || !userData.Item) {
    throw new Error('User not found');
  }
};

const deleteUser = async (params) => {
  await dynamoDb.delete(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'User deleted successfully' }),
  };
};

const handleErrorResponse = (error) => {
  console.log(error);
  return {
    statusCode: error.message === 'User not found' ? 404 : 500,
    body: JSON.stringify({ error: error.message }),
  };
};

module.exports.handler = async (event) => {
  const { id } = event.pathParameters;
  const params = constructDeleteParams(id);

  try {
    await getUserData(params);
    return await deleteUser(params);
  } catch (error) {
    return handleErrorResponse(error);
  }
};
