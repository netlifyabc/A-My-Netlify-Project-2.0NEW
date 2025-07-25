// netlify/functions/register.js

exports.handler = async function(event) {
  // 允许的跨域源，改成你的前端域名或者使用 '*'
  const ALLOWED_ORIGIN = '*';

  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理 CORS 预检请求（OPTIONS）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 解析请求体 JSON
    const { firstName, lastName, email, password } = JSON.parse(event.body);

    if (!firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
    const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    if (!SHOP_DOMAIN || !STOREFRONT_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing Shopify Storefront API credentials' }),
      };
    }

    // GraphQL mutation
    const query = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        firstName,
        lastName,
        email,
        password,
        acceptsMarketing: false,
      },
    };

    // 动态导入 fetch 避免 ESM/CJS 问题
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(`https://${SHOP_DOMAIN}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Shopify API request failed', details: text }),
      };
    }

    const result = await response.json();

    if (result.errors) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Shopify API returned errors', details: result.errors }),
      };
    }

    const userErrors = result.data.customerCreate.customerUserErrors;
    if (userErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User input error', details: userErrors }),
      };
    }

    const customer = result.data.customerCreate.customer;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Customer created successfully',
        customer,
      }),
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }




};



