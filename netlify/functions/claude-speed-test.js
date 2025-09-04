const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
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
    
    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Claude API key not configured',
          instructions: 'Add CLAUDE_API_KEY to Netlify environment variables'
        })
      };
    }

    console.log('Testing simplified Claude prompt for viable EA analysis...');
    
    // Simplified prompt - basic EA analysis
    const testPrompt = `Analyze Zero Trust Security for enterprise architecture. Provide:

1. Key business benefits (2-3 points)
2. Main implementation challenges (2-3 points)  
3. One strategic recommendation for adoption

Keep response under 200 words.`;
    
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      temperature: 0.3,
      messages: [{ role: "user", content: testPrompt }]
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
    const totalTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Claude API error: ${response.status}`,
          details: errorData.error?.message || 'Unknown error',
          timing: {
            apiCallTime: apiCallTime,
            totalFunctionTime: totalTime,
            underNetlifyLimit: totalTime < 10000
          },
          comparison: {
            simplestPrompt: '1616ms (17 tokens)',
            simplifiedPrompt: `${apiCallTime}ms (API), ${totalTime}ms (total)`,
            verdict: totalTime < 3000 ? 'SIMPLIFIED_VERY_FAST' : 
                     totalTime < 5000 ? 'SIMPLIFIED_ACCEPTABLE' : 
                     totalTime < 10000 ? 'SIMPLIFIED_SLOW_BUT_WORKABLE' : 'EVEN_SIMPLIFIED_TOO_SLOW'
          }
        })
      };
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    const result = {
      success: true,
      timing: {
        apiCallTime: apiCallTime,
        totalFunctionTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 2000 ? 'VERY_FAST' : 
                totalTime < 3000 ? 'FAST' : 
                totalTime < 5000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      claudeResponse: {
        text: responseText,
        textLength: responseText.length,
        tokens: data.usage,
        model: 'claude-sonnet-4-20250514'
      },
      comparison: {
        simplestPrompt: '1616ms (17 tokens)',
        simplifiedEAPrompt: `${apiCallTime}ms (${data.usage.input_tokens} tokens)`,
        comprehensivePrompt: 'Timed out (hundreds of tokens)',
        winner: 'SIMPLIFIED_PROMPT',
        verdict: totalTime < 5000 ? 'SIMPLIFIED_PROMPTS_VIABLE_FOR_EA' : 'EVEN_SIMPLIFIED_TOO_SLOW'
      },
      viabilityAssessment: {
        forBasicEA: totalTime < 5000 ? 'VIABLE' : 'NOT_VIABLE',
        qualityTradeoff: totalTime < 5000 ? 'Acceptable quality with speed' : 'Quality insufficient for speed gained',
        recommendation: totalTime < 3000 ? 
          'Simplified Claude prompts work - build basic EA agent' :
          totalTime < 5000 ?
          'Simplified prompts borderline - consider Gemini for better experience' :
          'Switch to Gemini - even simplified Claude too slow'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Claude simplified test completed: ${apiCallTime}ms API, ${totalTime}ms total`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Claude simplified test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Simplified test failed: ' + error.message,
        timing: {
          totalFunctionTime: responseTime,
          underNetlifyLimit: responseTime < 10000
        },
        viabilityAssessment: {
          recommendation: 'Function error suggests fundamental issue - consider Gemini API'
        }
      })
    };
  }
};