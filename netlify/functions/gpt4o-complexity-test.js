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
          error: 'OpenAI API key not configured'
        })
      };
    }

    console.log('Testing gpt-4o across complexity spectrum...');
    
    const results = {
      testSuite: 'gpt-4o Complexity Analysis',
      technology: 'Zero Trust Security',
      tests: {},
      summary: {},
      timestamp: new Date().toISOString()
    };

    // Test 1: Simple Analysis
    const simplePrompt = `Provide a one-sentence summary of Zero Trust Security for enterprise architecture.`;
    
    console.log('Running simple test...');
    const simpleResult = await runComplexityTest('simple', simplePrompt, 100, openaiApiKey);
    results.tests.simple = simpleResult;

    // Test 2: Moderate Analysis (current working level)
    const moderatePrompt = `Analyze the current market landscape for Zero Trust Security. Provide:

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

    console.log('Running moderate test...');
    const moderateResult = await runComplexityTest('moderate', moderatePrompt, 350, openaiApiKey);
    results.tests.moderate = moderateResult;

    // Test 3: Complex Analysis (what timed out with Claude)
    const complexPrompt = `You are a senior enterprise architect and technology analyst. Provide a comprehensive analysis of Zero Trust Security for enterprise architecture decision-making.

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

    console.log('Running complex test...');
    const complexResult = await runComplexityTest('complex', complexPrompt, 1000, openaiApiKey);
    results.tests.complex = complexResult;

    // Calculate summary metrics
    const totalTime = Date.now() - startTime;
    results.summary = {
      totalTestTime: totalTime,
      allTestsCompleted: results.tests.simple.success && results.tests.moderate.success && results.tests.complex.success,
      performanceProgression: {
        simple: `${results.tests.simple.timing?.apiCallTime || 'N/A'}ms`,
        moderate: `${results.tests.moderate.timing?.apiCallTime || 'N/A'}ms`, 
        complex: `${results.tests.complex.timing?.apiCallTime || 'N/A'}ms`
      },
      viabilityAssessment: {
        simpleViable: (results.tests.simple.timing?.apiCallTime || 10000) < 7000,
        moderateViable: (results.tests.moderate.timing?.apiCallTime || 10000) < 7000,
        complexViable: (results.tests.complex.timing?.apiCallTime || 10000) < 7000
      },
      recommendations: generateRecommendations(results.tests)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results, null, 2)
    };

  } catch (error) {
    console.error('gpt-4o complexity test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Complexity test failed: ' + error.message
      })
    };
  }
};

async function runComplexityTest(testType, prompt, maxTokens, apiKey) {
  try {
    const testStart = Date.now();
    
    const request = {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3
    };

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    const apiCallTime = Date.now() - apiCallStart;
    const totalTime = Date.now() - testStart;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        testType: testType,
        error: `API error: ${response.status}`,
        details: errorData.error?.message,
        timing: {
          apiCallTime: apiCallTime,
          totalTime: totalTime,
          underNetlifyLimit: totalTime < 10000
        }
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    return {
      success: true,
      testType: testType,
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 2000 ? 'VERY_FAST' : 
                totalTime < 4000 ? 'FAST' : 
                totalTime < 6000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      response: {
        text: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
        fullLength: responseText.length,
        tokens: data.usage,
        model: 'gpt-4o'
      },
      promptAnalysis: {
        estimatedInputTokens: Math.ceil(prompt.length / 4),
        actualInputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        efficiency: data.usage.completion_tokens / (totalTime / 1000) // tokens per second
      }
    };
    
  } catch (error) {
    return {
      success: false,
      testType: testType,
      error: 'Test execution failed: ' + error.message
    };
  }
}

function generateRecommendations(tests) {
  const simple = tests.simple?.timing?.apiCallTime || 10000;
  const moderate = tests.moderate?.timing?.apiCallTime || 10000;
  const complex = tests.complex?.timing?.apiCallTime || 10000;
  
  const recommendations = [];
  
  if (simple < 2000) recommendations.push('Simple prompts are very fast - suitable for quick insights');
  if (moderate < 5000) recommendations.push('Moderate prompts viable - good balance of speed and depth');
  if (complex < 7000) recommendations.push('Complex prompts viable - comprehensive analysis possible');
  
  if (complex > 8000) recommendations.push('Complex prompts too slow - use moderate complexity');
  if (moderate > 6000) recommendations.push('Moderate prompts borderline - optimize or use simple');
  
  const optimalComplexity = complex < 6000 ? 'complex' : 
                           moderate < 5000 ? 'moderate' : 'simple';
  
  recommendations.push(`Optimal complexity level: ${optimalComplexity}`);
  
  return recommendations;
}