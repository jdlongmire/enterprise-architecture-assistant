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

    // 5-year strategic forecast prompt
    const forecastPrompt = `Develop a comprehensive 5-year strategic forecast for Zero Trust Security technology.

Provide:

**TECHNOLOGY EVOLUTION**
- Expected capability advances in Years 1, 3, and 5
- Emerging technologies that will integrate with Zero Trust
- Technical maturity progression and standardization timeline

**MARKET PROJECTIONS**
- Market size growth trajectory (current → 5 years)
- New market segments and use cases emerging
- Geographic expansion and regional adoption patterns

**VENDOR LANDSCAPE EVOLUTION**
- Expected consolidation, acquisitions, partnerships
- New market entrants and disruptive companies
- Shifts in competitive positioning over 5 years

**IMPLEMENTATION ROADMAP**
- Optimal timing for pilot, deployment, and scaling phases
- Critical decision windows for enterprise adoption
- Integration milestones with existing security infrastructure

**INVESTMENT STRATEGY**
- When to budget for initial investment vs. scaling
- ROI timeline and payback period expectations
- Resource allocation recommendations across the 5-year horizon

**STRATEGIC RISKS & OPPORTUNITIES**
- Future challenges and mitigation strategies
- Competitive advantage windows
- Technology obsolescence risks

Keep response under 350 words. Focus on actionable strategic planning insights with specific timeframes for enterprise decision-making.`;

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: forecastPrompt }],
        max_tokens: 450,
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
      testType: 'five-year-strategic-forecast',
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        underNetlifyLimit: totalTime < 10000,
        status: totalTime < 3000 ? 'VERY_FAST' : 
                totalTime < 5000 ? 'FAST' : 
                totalTime < 7000 ? 'ACCEPTABLE' : 
                totalTime < 10000 ? 'SLOW_BUT_VIABLE' : 'TOO_SLOW'
      },
      forecastResponse: {
        text: responseText,
        textLength: responseText.length,
        tokens: data.usage,
        model: 'gpt-4o'
      },
      comparison: {
        marketAnalysis: '5339ms (current market trends)',
        vendorAnalysis: '7661ms (current vendor positioning)',
        maturityAssessment: '4940ms (current maturity state)',
        fiveYearForecast: `${apiCallTime}ms (strategic planning timeline)`,
        performanceRanking: apiCallTime < 5000 ? 'FASTEST_GROUP' : 
                           apiCallTime < 7000 ? 'MIDDLE_GROUP' : 'SLOWEST_GROUP'
      },
      viabilityForModularSystem: {
        fitsPerformanceProfile: totalTime < 8000,
        strategicPlanningValue: 'Essential for EA roadmap development and investment timing',
        chartDataViability: 'Includes timeline data for roadmap and investment charts',
        recommendedApproach: totalTime < 6000 ? 
          'Full 5-year forecast module - optimal for strategic planning' :
          totalTime < 8000 ?
          '5-year forecast viable with performance monitoring' :
          'Simplify forecast scope or split into shorter timeframes'
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
        error: '5-year forecast test failed: ' + error.message
      })
    };
  }
};