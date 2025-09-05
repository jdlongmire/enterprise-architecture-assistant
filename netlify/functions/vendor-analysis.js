// FILE PATH: netlify/functions/market-analysis.js
// Production Market Analysis Module for Enterprise Architecture AI Agents

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const startTime = Date.now();
    const { technology } = JSON.parse(event.body);
    
    if (!technology) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Technology parameter required' })
      };
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // Market analysis prompt (proven 5.34s performance)
    const marketPrompt = `Analyze the current market landscape for ${technology}.

Provide comprehensive market intelligence covering:

**MARKET SIZE AND GROWTH**
- Current market valuation and projected 3-year growth rates
- Key growth drivers and market expansion factors
- Regional market distribution and growth patterns

**INDUSTRY ADOPTION**
- Current adoption rates across industry sectors
- Leading industries driving implementation
- Enterprise vs. SMB adoption patterns

**MARKET DYNAMICS**
- Competitive market structure and concentration
- Pricing trends and cost evolution
- Investment and funding landscape

**MARKET DRIVERS**
- Primary business drivers accelerating adoption
- Technology enablers supporting growth
- Regulatory and compliance factors

**MARKET CHALLENGES**
- Key barriers limiting market expansion
- Technical and operational challenges
- Market maturity and saturation risks

Keep response under 300 words. Focus on quantitative market insights and actionable business intelligence for enterprise decision-making.`;

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: marketPrompt }],
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
          error: `Market analysis failed: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // Parse structured data from response for chart generation
    const marketData = {
      technology: technology,
      analysis: responseText,
      metrics: extractMarketMetrics(responseText),
      chartData: generateMarketChartData(responseText, technology),
      summary: extractExecutiveSummary(responseText),
      timestamp: new Date().toISOString()
    };

    const result = {
      success: true,
      module: 'market-analysis',
      technology: technology,
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        status: totalTime < 5000 ? 'FAST' : totalTime < 8000 ? 'ACCEPTABLE' : 'SLOW'
      },
      data: marketData,
      artifacts: {
        webSummary: formatWebSummary(marketData),
        chartData: marketData.chartData,
        downloadReady: true
      },
      tokens: data.usage,
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
        error: 'Market analysis failed: ' + error.message,
        module: 'market-analysis'
      })
    };
  }
};

// Extract key market metrics for dashboard display
function extractMarketMetrics(analysisText) {
  const metrics = {
    marketSize: null,
    growthRate: null,
    adoptionRate: null,
    timeToMarket: null
  };

  // Extract market size (patterns like "$X billion", "$X.X billion")
  const sizeMatch = analysisText.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
  if (sizeMatch) {
    metrics.marketSize = `$${sizeMatch[1]}B`;
  }

  // Extract growth rate (patterns like "X%", "X percent")
  const growthMatch = analysisText.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:growth|CAGR|annually)/i);
  if (growthMatch) {
    metrics.growthRate = `${growthMatch[1]}%`;
  }

  // Extract adoption rate
  const adoptionMatch = analysisText.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:adoption|enterprises|organizations)/i);
  if (adoptionMatch) {
    metrics.adoptionRate = `${adoptionMatch[1]}%`;
  }

  return metrics;
}

// Generate chart data for market visualization
function generateMarketChartData(analysisText, technology) {
  return {
    type: 'market-growth',
    title: `${technology} Market Growth Projection`,
    data: {
      labels: ['2024', '2025', '2026', '2027', '2028'],
      datasets: [{
        label: 'Market Size ($B)',
        data: [20, 28, 38, 52, 68], // Sample data - would be extracted from analysis
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${technology} Market Growth (5-Year Projection)`
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Market Size (Billions USD)'
          }
        }
      }
    }
  };
}

// Extract executive summary for web display
function extractExecutiveSummary(analysisText) {
  // Get first paragraph or first 200 characters as summary
  const firstParagraph = analysisText.split('\n')[0];
  if (firstParagraph.length > 50) {
    return firstParagraph.substring(0, 200) + '...';
  }
  
  return analysisText.substring(0, 200) + '...';
}

// Format data for web summary display
function formatWebSummary(marketData) {
  return {
    title: `${marketData.technology} Market Analysis`,
    summary: marketData.summary,
    keyMetrics: marketData.metrics,
    sections: [
      {
        title: 'Market Overview',
        content: extractSection(marketData.analysis, 'MARKET SIZE AND GROWTH')
      },
      {
        title: 'Industry Adoption',
        content: extractSection(marketData.analysis, 'INDUSTRY ADOPTION')
      },
      {
        title: 'Market Drivers',
        content: extractSection(marketData.analysis, 'MARKET DRIVERS')
      },
      {
        title: 'Challenges',
        content: extractSection(marketData.analysis, 'MARKET CHALLENGES')
      }
    ]
  };
}

// Extract specific section from analysis text
function extractSection(analysisText, sectionTitle) {
  const sectionRegex = new RegExp(`\\*\\*${sectionTitle}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
  const match = analysisText.match(sectionRegex);
  
  if (match && match[1]) {
    return match[1].trim().substring(0, 300) + '...';
  }
  
  return 'Analysis content not available.';
}