const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const par = (id) => ({
  TableName: process.env.TABLE_NAME,
  Key: {
    id,
  },
});

const checkData = (data) => {
  if (!data || !data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'User not found' }),
    };
  }

  return null;
};

module.exports.handler = async (event) => {
  const { id } = event.pathParameters;
  
  const params = par(id);

  try {
    const data = await dynamoDb.get(params).promise();
  const verData = checkData(data);
  if (verData) return verData;
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
