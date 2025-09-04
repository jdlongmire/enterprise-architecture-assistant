// File: netlify/functions/market-analysis.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const startTime = Date.now();
    const requestBody = JSON.parse(event.body);
    const { technology } = requestBody;

    if (!technology) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Technology parameter required' })
      };
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Claude API key not configured' })
      };
    }

    // Focused market analysis prompt
    const marketPrompt = `Analyze the current market landscape for ${technology}. Provide:

**MARKET SIZE & GROWTH**
- Current market valuation and projected growth rate
- Key geographic markets and adoption levels

**ADOPTION DRIVERS** 
- Top 3 business drivers accelerating adoption
- Industry sectors leading implementation

**MARKET TRENDS**
- Current trends shaping the market
- Future outlook (next 2-3 years)

Keep response under 250 words. Focus on quantifiable data and business insights.`;

    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 350,
      temperature: 0.3,
      messages: [{ role: "user", content: marketPrompt }]
    };

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': claudeApiKey
      },
      body: JSON.stringify(claudeRequest)
    });

    const apiCallTime = Date.now() - apiCallStart;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Claude API error: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    const result = {
      success: true,
      analysisType: 'market',
      technology: technology,
      content: data.content[0].text,
      performance: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        status: totalTime < 3000 ? 'FAST' : totalTime < 5000 ? 'GOOD' : 'ACCEPTABLE'
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Market analysis failed: ' + error.message,
        performance: { totalTime: responseTime }
      })
    };
  }
};