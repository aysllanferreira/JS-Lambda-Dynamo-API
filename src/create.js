const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const validateNickname = async (data) => {
  if (!data.nickname || data.nickname.trim() === '') {
    console.log('here');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nickname is required' }),
    };
  }

  return null;
};

const userExists = async (nickname, data) => {
  const checkParams = {
    TableName: process.env.TABLE_NAME,
    IndexName: 'NicknameIndex',
    KeyConditionExpression: 'nickname = :nickname',
    ExpressionAttributeValues: {
      ':nickname': data.nickname,
    },
  };
  
  const result = await dynamoDb.query(checkParams).promise();
  if (result.Count > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nickname already exists' }),
    };
  }

  return null;
};

const verifyAll = async (data) => {
  const checkNick = await validateNickname(data);
  if (checkNick) return checkNick;
  
  const checkUser = await userExists(data.nickname, data);
  if (checkUser) return checkUser;

  return null;
};

const par = (data) => ({
    TableName: process.env.TABLE_NAME,
    Item: {
      id: uuidv4(),
      nickname: data.nickname,
      level: 1,
      money: 300,
      power: 1,
      strength: 1,
      stamina: 1,
      speed: 1,
    },
  });

module.exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const check = await verifyAll(data);
  console.log(data);
  if (check) return check;

  const params = par(data);

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
