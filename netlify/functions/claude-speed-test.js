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

    console.log('Testing single Claude API call...');
    
    // Simple test prompt (similar to working "Test Connection")
    const testPrompt = 'Please respond with exactly one sentence about enterprise architecture.';
    
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
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
            simplePromptSpeed: '1913ms (17 tokens)',
            comprehensivePromptSpeed: `${apiCallTime}ms (API), ${totalTime}ms (total)`,
            verdict: totalTime < 1913 ? 'COMPREHENSIVE_FASTER_THAN_EXPECTED' : 
                     totalTime < 5000 ? 'COMPREHENSIVE_REASONABLE' : 
                     totalTime < 10000 ? 'COMPREHENSIVE_SLOW_BUT_WORKABLE' : 'COMPREHENSIVE_TOO_SLOW_FOR_NETLIFY'
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
                totalTime < 5000 ? 'FAST' : 
                totalTime < 10000 ? 'ACCEPTABLE' : 'TOO_SLOW'
      },
      claudeResponse: {
        text: responseText,
        tokens: data.usage,
        model: 'claude-sonnet-4-20250514'
      },
      comparison: {
        geminiSpeed: '141ms (discovery), 225ms (total)',
        claudeSpeed: `${apiCallTime}ms (API), ${totalTime}ms (total)`,
        winner: apiCallTime < 225 ? 'CLAUDE_FASTER' : 'GEMINI_FASTER',
        verdict: totalTime < 10000 ? 'CLAUDE_VIABLE_FOR_NETLIFY' : 'CLAUDE_TOO_SLOW_FOR_NETLIFY'
      },
      diagnostics: {
        issue: totalTime < 10000 ? 
          'Claude API works fine - issue must be in research agent complexity or multiple API calls' :
          'Claude API too slow for Netlify free tier - switch to Gemini or upgrade hosting',
        recommendation: totalTime < 5000 ?
          'Claude is fast enough - optimize research agent to use simpler prompts' :
          totalTime < 10000 ?
          'Claude is borderline - consider shorter prompts or switch to Gemini' :
          'Switch to Gemini API immediately - Claude response time incompatible with Netlify'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Claude API test completed: ${apiCallTime}ms API, ${totalTime}ms total`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Claude simple test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Claude test failed: ' + error.message,
        timing: {
          totalFunctionTime: responseTime,
          underNetlifyLimit: responseTime < 10000
        },
        diagnostics: {
          issue: 'Function execution error - not Claude API speed issue',
          recommendation: 'Debug function code or check network connectivity'
        }
      })
    };
  }
};