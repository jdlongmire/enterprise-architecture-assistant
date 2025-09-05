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

    // Technology maturity assessment prompt
    const maturityPrompt = `Assess the technology maturity of Zero Trust Security. Provide:

**HYPE CYCLE POSITIONING**
- Current position on the hype cycle curve (Innovation Trigger, Peak of Expectations, Trough of Disillusionment, Slope of Enlightenment, or Plateau of Productivity)
- Rationale for current positioning

**MATURITY INDICATORS**
- Market adoption percentage and enterprise readiness
- Time to mainstream adoption (years remaining)
- Technical maturity vs. market hype assessment

**IMPLEMENTATION READINESS**
- Current viability for enterprise deployment
- Key barriers preventing mainstream adoption
- Success factors for early implementation

**ADOPTION TIMELINE**
- Expected progression through remaining hype cycle phases
- Projected timeline to reach productivity plateau

Keep response under 300 words. Focus on specific maturity indicators and actionable timing insights for enterprise planning.`;

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: maturityPrompt }],
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
      testType: 'technology-maturity-assessment',
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 3000 ? 'VERY_FAST' : 
                totalTime < 5000 ? 'FAST' : 
                totalTime < 7000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      maturityResponse: {
        text: responseText,
        textLength: responseText.length,
        tokens: data.usage,
        model: 'gpt-4o'
      },
      comparison: {
        marketAnalysis: '5339ms (market trends)',
        vendorAnalysis: '7661ms (vendor positioning)',
        maturityAssessment: `${apiCallTime}ms (technology maturity)`,
        performanceRanking: 'TBD based on results'
      },
      viabilityForModularSystem: {
        fitsPerformanceProfile: totalTime < 8000,
        chartDataViability: 'Includes hype cycle positioning data for chart generation',
        recommendedApproach: totalTime < 6000 ? 
          'Full maturity assessment module viable' :
          totalTime < 8000 ?
          'Maturity module acceptable with monitoring' :
          'Simplify maturity module or split into components'
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
        error: 'Maturity assessment test failed: ' + error.message
      })
    };
  }
};