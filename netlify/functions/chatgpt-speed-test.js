const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const startTime = Date.now();
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API key not configured',
          instructions: 'Add OPENAI_API_KEY to Netlify environment variables'
        })
      };
    }

    console.log('Testing ChatGPT API with same prompt that took Claude 8.4 seconds...');
    
    // EXACT same prompt that took Claude 8.4 seconds
    const testPrompt = `Analyze the current market landscape for Zero Trust Security. Provide:

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

    const chatgptRequest = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: testPrompt }],
      max_tokens: 350,
      temperature: 0.3
    };

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(chatgptRequest)
    });

    const apiCallTime = Date.now() - apiCallStart;
    const totalTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: `ChatGPT API error: ${response.status}`,
          details: errorData.error?.message || 'Unknown error',
          timing: {
            apiCallTime: apiCallTime,
            totalFunctionTime: totalTime,
            underNetlifyLimit: totalTime < 10000
          }
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    const result = {
      success: true,
      timing: {
        apiCallTime: apiCallTime,
        totalFunctionTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 2000 ? 'VERY_FAST' : 
                totalTime < 4000 ? 'FAST' : 
                totalTime < 6000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      chatgptResponse: {
        text: responseText,
        textLength: responseText.length,
        tokens: data.usage,
        model: 'gpt-4'
      },
      comparison: {
        claudeSpeed: '8400ms (119 input tokens, 350 output tokens)',
        chatgptSpeed: `${apiCallTime}ms (API), ${totalTime}ms (total)`,
        winner: apiCallTime < 8400 ? 'CHATGPT_FASTER' : 'CLAUDE_FASTER',
        improvementFactor: apiCallTime < 8400 ? `${(8400 / apiCallTime).toFixed(1)}x faster` : 'Slower than Claude'
      },
      viabilityAssessment: {
        forNetlify: totalTime < 7000 ? 'HIGHLY_VIABLE' : 
                    totalTime < 10000 ? 'VIABLE_WITH_MARGIN' : 'NOT_VIABLE',
        recommendation: totalTime < 5000 ? 
          'ChatGPT solves timeout issue - proceed with full implementation' :
          totalTime < 8000 ?
          'ChatGPT better than Claude but still slow - consider optimization' :
          'ChatGPT not significantly better - explore alternatives'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`ChatGPT test completed: ${apiCallTime}ms API, ${totalTime}ms total`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('ChatGPT test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'ChatGPT test failed: ' + error.message,
        timing: {
          totalFunctionTime: responseTime,
          underNetlifyLimit: responseTime < 10000
        }
      })
    };
  }
};