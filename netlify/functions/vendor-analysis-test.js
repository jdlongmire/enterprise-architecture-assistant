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

  try {
    const startTime = Date.now();
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // Unbiased vendor analysis prompt
    const vendorPrompt = `Analyze the Zero Trust Security vendor landscape. Provide:

**MARKET LEADERS**
- Identify the top 5-6 vendors by market position and revenue
- Each vendor's primary strengths and market approach

**COMPETITIVE POSITIONING**
- Gartner Magic Quadrant style categorization
- Leaders vs Challengers vs Niche players vs Visionaries
- Key differentiators between major vendors

**VENDOR COMPARISON**
- Comparative strengths and weaknesses analysis
- Which vendor types excel in specific enterprise scenarios
- Emerging vs established player dynamics

Keep response under 300 words. Focus on unbiased vendor identification and actionable positioning insights.`;

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: vendorPrompt }],
        max_tokens: 400,
        temperature: 0.3
      })
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
          error: `OpenAI API error: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    const result = {
      success: true,
      testType: 'unbiased-vendor-analysis',
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 3000 ? 'VERY_FAST' : 
                totalTime < 5000 ? 'FAST' : 
                totalTime < 7000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      vendorResponse: {
        text: responseText,
        textLength: responseText.length,
        tokens: data.usage,
        model: 'gpt-4o'
      },
      comparison: {
        marketAnalysis: '5339ms (market trends)',
        vendorAnalysis: `${apiCallTime}ms (unbiased vendor identification)`,
        complexityDifference: `${apiCallTime - 5339}ms difference`
      },
      viabilityForModularSystem: {
        canBeStandaloneModule: totalTime < 7000,
        recommendedApproach: totalTime < 6000 ? 
          'Full vendor analysis module viable' :
          'Consider simplified vendor module'
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Vendor analysis test failed: ' + error.message
      })
    };
  }
};