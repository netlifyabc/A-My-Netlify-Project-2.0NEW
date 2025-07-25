exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',  // 先用星号测试是否通过CORS
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Hello from Netlify Function!' }),
  };
};



