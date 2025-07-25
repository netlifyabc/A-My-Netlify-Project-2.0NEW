const { createCartWithItem } = require('../../lib/shopify');

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { merchandiseId, quantity } = JSON.parse(event.body);

    if (!merchandiseId || !quantity) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing merchandiseId or quantity' }),
      };
    }

    const result = await createCartWithItem(merchandiseId, quantity);

    if (result.userErrors && result.userErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ errors: result.userErrors }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.cart),
    };
  } catch (err) {
    console.error('Error in add-to-cart function:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server Error', details: err.message }),
    };
  }
};


