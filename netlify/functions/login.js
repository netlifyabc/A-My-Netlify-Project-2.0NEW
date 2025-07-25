// netlify/functions/login.js

exports.handler = async function(event) {
  const ALLOWED_ORIGIN = 'https://netlifyabc.github.io';

  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 预检请求处理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // 这里写你的 Shopify 登录逻辑或模拟登录验证，例子里直接模拟成功返回
    // 你可以改成真正的调用 Shopify API 验证用户密码

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // 模拟登录成功响应
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login successful',
        customer: {
          id: 'mocked-customer-id-123',
          firstName: '张',
          lastName: '三',
          email,
        },
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
