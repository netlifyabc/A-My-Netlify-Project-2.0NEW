const fetch = require('node-fetch');

exports.handler = async function (event) {
  const ALLOWED_ORIGIN = 'https://netlifyabc.github.io';

  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
    const STOREFRONT_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-04';
    const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    const endpoint = `https://${SHOPIFY_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;

    // Step 1: 创建访问令牌
    const createTokenQuery = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const tokenResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: createTokenQuery,
        variables: { input: { email, password } },
      }),
    });

    const tokenResult = await tokenResponse.json();

    const errors = tokenResult.data.customerAccessTokenCreate.customerUserErrors;
    const tokenInfo = tokenResult.data.customerAccessTokenCreate.customerAccessToken;

    if (errors.length > 0 || !tokenInfo) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: errors[0]?.message || 'Authentication failed' }),
      };
    }

    // Step 2: 用访问令牌查询客户信息
    const customerQuery = `
      query {
        customer(customerAccessToken: "${tokenInfo.accessToken}") {
          firstName
          lastName
          email
          id
        }
      }
    `;

    const customerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: customerQuery }),
    });

    const customerResult = await customerResponse.json();

    const customer = customerResult.data?.customer;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login successful',
        token: tokenInfo.accessToken,
        expiresAt: tokenInfo.expiresAt,
        customer,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', detail: error.message }),
    };
  }
};






