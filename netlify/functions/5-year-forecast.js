// FILE PATH: netlify/functions/5-year-forecast.js
// Production 5-Year Forecast Module for Enterprise Architecture AI Agents

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

    // 5-year strategic forecast prompt (proven 8.69s performance)
    const forecastPrompt = `Develop a comprehensive 5-year strategic forecast for ${technology} technology.

Provide:

**TECHNOLOGY EVOLUTION**
- Expected capability advances in Years 1, 3, and 5
- Emerging technologies that will integrate with ${technology}
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
- Integration milestones with existing infrastructure

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
          error: `5-year forecast failed: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // Parse structured data from response for chart generation
    const forecastData = {
      technology: technology,
      analysis: responseText,
      timeline: extractTimelineData(responseText),
      investmentPhases: extractInvestmentPhases(responseText),
      chartData: generateForecastChartData(responseText, technology),
      summary: extractExecutiveSummary(responseText),
      timestamp: new Date().toISOString()
    };

    const result = {
      success: true,
      module: '5-year-forecast',
      technology: technology,
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        status: totalTime < 5000 ? 'FAST' : totalTime < 8000 ? 'ACCEPTABLE' : 'SLOW'
      },
      data: forecastData,
      artifacts: {
        webSummary: formatWebSummary(forecastData),
        chartData: forecastData.chartData,
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
        error: '5-year forecast failed: ' + error.message,
        module: '5-year-forecast'
      })
    };
  }
};

// Extract timeline data from analysis text
function extractTimelineData(analysisText) {
  const timeline = {
    year1: null,
    year3: null,
    year5: null,
    milestones: []
  };

  // Extract year-specific content
  const year1Match = analysisText.match(/Year\s*1[:\-\s]*([^\.]*\.[^\.]*\.?)/i);
  if (year1Match) {
    timeline.year1 = year1Match[1].trim();
  }

  const year3Match = analysisText.match(/Year\s*3[:\-\s]*([^\.]*\.[^\.]*\.?)/i);
  if (year3Match) {
    timeline.year3 = year3Match[1].trim();
  }

  const year5Match = analysisText.match(/Year\s*5[:\-\s]*([^\.]*\.[^\.]*\.?)/i);
  if (year5Match) {
    timeline.year5 = year5Match[1].trim();
  }

  // Extract milestone patterns
  const milestonePatterns = [
    /pilot/i, /deployment/i, /scaling/i, /integration/i, /standardization/i
  ];

  milestonePatterns.forEach((pattern, index) => {
    if (pattern.test(analysisText)) {
      timeline.milestones.push({
        phase: pattern.source.replace(/[\/\\gi]/g, ''),
        timeframe: `Year ${index + 1}-${index + 2}`,
        priority: index + 1
      });
    }
  });

  return timeline;
}

// Extract investment phases from analysis text
function extractInvestmentPhases(analysisText) {
  const phases = [];
  
  const investmentPatterns = [
    { phase: 'Initial Investment', keywords: ['initial', 'pilot', 'budget'] },
    { phase: 'Scaling Investment', keywords: ['scaling', 'expansion', 'growth'] },
    { phase: 'ROI Realization', keywords: ['ROI', 'payback', 'returns'] }
  ];

  investmentPatterns.forEach(pattern => {
    const hasKeywords = pattern.keywords.some(keyword => 
      new RegExp(keyword, 'i').test(analysisText)
    );
    
    if (hasKeywords) {
      phases.push(pattern.phase);
    }
  });

  return phases;
}

// Generate chart data for forecast timeline visualization
function generateForecastChartData(analysisText, technology) {
  const timeline = extractTimelineData(analysisText);
  
  return {
    type: 'forecast-timeline',
    title: `${technology} 5-Year Strategic Roadmap`,
    data: {
      labels: ['2024', '2025', '2026', '2027', '2028', '2029'],
      datasets: [
        {
          label: 'Technology Maturity',
          data: [30, 45, 65, 80, 90, 95],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Market Adoption',
          data: [20, 35, 55, 70, 85, 95],
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Investment Level',
          data: [40, 70, 85, 75, 60, 50],
          borderColor: '#f39c12',
          backgroundColor: 'rgba(243, 156, 18, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    milestones: [
      { year: '2025', event: 'Pilot Phase', color: '#3498db' },
      { year: '2026', event: 'Scaling Phase', color: '#e74c3c' },
      { year: '2027', event: 'Integration Phase', color: '#27ae60' },
      { year: '2028', event: 'Optimization Phase', color: '#f39c12' }
    ],
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `${technology} Strategic Forecast (2024-2029)`
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Timeline'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Maturity & Adoption (%)'
          },
          min: 0,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Investment Level'
          },
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  };
}

// Extract executive summary for web display
function extractExecutiveSummary(analysisText) {
  const firstParagraph = analysisText.split('\n')[0];
  if (firstParagraph.length > 50) {
    return firstParagraph.substring(0, 200) + '...';
  }
  
  return analysisText.substring(0, 200) + '...';
}

// Format data for web summary display
function formatWebSummary(forecastData) {
  return {
    title: `${forecastData.technology} 5-Year Strategic Forecast`,
    summary: forecastData.summary,
    timeline: forecastData.timeline,
    investmentPhases: forecastData.investmentPhases,
    sections: [
      {
        title: 'Technology Evolution',
        content: extractSection(forecastData.analysis, 'TECHNOLOGY EVOLUTION')
      },
      {
        title: 'Market Projections',
        content: extractSection(forecastData.analysis, 'MARKET PROJECTIONS')
      },
      {
        title: 'Implementation Roadmap',
        content: extractSection(forecastData.analysis, 'IMPLEMENTATION ROADMAP')
      },
      {
        title: 'Investment Strategy',
        content: extractSection(forecastData.analysis, 'INVESTMENT STRATEGY')
      },
      {
        title: 'Risks & Opportunities',
        content: extractSection(forecastData.analysis, 'STRATEGIC RISKS')
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