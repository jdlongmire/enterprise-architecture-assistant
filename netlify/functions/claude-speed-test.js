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

    console.log('Testing comprehensive Claude API call (same prompt as research agent)...');
    
    // Test with the EXACT comprehensive prompt from research agent
    const testPrompt = `You are a senior enterprise architect and technology analyst. Provide a comprehensive analysis of Zero Trust Security for enterprise architecture decision-making.

Please structure your response with these sections:

**MARKET ANALYSIS**
- Current market size and growth projections
- Key adoption drivers and business benefits
- Industry sectors leading implementation
- Market trends and future outlook

**VENDOR LANDSCAPE**
- Leading vendors and their positioning
- Key differentiators and capabilities
- Market share and competitive dynamics
- Emerging players and innovations

**TECHNOLOGY MATURITY ASSESSMENT**
- Current position on technology adoption curve
- Implementation readiness for enterprises
- Time to mainstream adoption
- Risk factors and challenges

**STRATEGIC RECOMMENDATIONS**
- Business case and ROI considerations
- Implementation approach and timeline
- Success factors and best practices
- Decision framework for adoption

**EXECUTIVE SUMMARY**
- Key findings and strategic implications
- Top 3 recommendations for enterprise leaders
- Implementation priority and timeline

Focus on actionable insights for C-level decision makers. Provide specific, data-driven recommendations suitable for enterprise architecture planning.`;
    
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
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
        text: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
        fullTextLength: responseText.length,
        tokens: data.usage,
        model: 'claude-sonnet-4-20250514'
      },
      comparison: {
        simplePromptSpeed: '1913ms (17 tokens)',
        comprehensivePromptSpeed: `${apiCallTime}ms (API), ${totalTime}ms (total)`,
        winner: apiCallTime < 1913 ? 'COMPREHENSIVE_FASTER' : 'SIMPLE_FASTER',
        verdict: totalTime < 10000 ? 'COMPREHENSIVE_PROMPT_VIABLE_FOR_NETLIFY' : 'COMPREHENSIVE_PROMPT_TOO_SLOW_FOR_NETLIFY'
      },
      diagnostics: {
        issue: totalTime < 10000 ? 
          'Comprehensive prompts work fine - issue must be in research agent backend routing' :
          'Comprehensive prompts too complex for Netlify - need simpler prompts or switch to Gemini',
        recommendation: totalTime < 5000 ?
          'Comprehensive prompts are fast enough - debug research agent backend' :
          totalTime < 10000 ?
          'Comprehensive prompts are borderline - optimize or consider Gemini' :
          'Switch to Gemini API or dramatically simplify prompts'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Claude comprehensive test completed: ${apiCallTime}ms API, ${totalTime}ms total`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Claude comprehensive test error:', error);
    
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
          issue: 'Function execution error with comprehensive prompt - not necessarily Claude API speed issue',
          recommendation: 'Debug function code, check prompt complexity, or test with simpler prompt'
        }
      })
    };
  }
};