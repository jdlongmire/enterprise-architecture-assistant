// FILE PATH: netlify/functions/maturity-assessment.js
// Production Maturity Assessment Module for Enterprise Architecture AI Agents

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

    // Technology maturity assessment prompt (proven 4.94s performance)
    const maturityPrompt = `Assess the technology maturity of ${technology}.

Provide:

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
          error: `Maturity assessment failed: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // Parse structured data from response for chart generation
    const maturityData = {
      technology: technology,
      analysis: responseText,
      hypeCyclePosition: extractHypeCyclePosition(responseText),
      maturityMetrics: extractMaturityMetrics(responseText),
      chartData: generateMaturityChartData(responseText, technology),
      summary: extractExecutiveSummary(responseText),
      timestamp: new Date().toISOString()
    };

    const result = {
      success: true,
      module: 'maturity-assessment',
      technology: technology,
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        status: totalTime < 5000 ? 'FAST' : totalTime < 8000 ? 'ACCEPTABLE' : 'SLOW'
      },
      data: maturityData,
      artifacts: {
        webSummary: formatWebSummary(maturityData),
        chartData: maturityData.chartData,
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
        error: 'Maturity assessment failed: ' + error.message,
        module: 'maturity-assessment'
      })
    };
  }
};

// Extract hype cycle position from analysis text
function extractHypeCyclePosition(analysisText) {
  const positions = [
    'Innovation Trigger',
    'Peak of Expectations',
    'Peak of Inflated Expectations',
    'Trough of Disillusionment',
    'Slope of Enlightenment',
    'Plateau of Productivity'
  ];

  for (const position of positions) {
    const regex = new RegExp(position, 'i');
    if (regex.test(analysisText)) {
      return {
        position: position,
        confidence: 'high',
        evidence: extractPositionRationale(analysisText, position)
      };
    }
  }

  return {
    position: 'Unknown',
    confidence: 'low',
    evidence: 'Position not clearly identified in analysis'
  };
}

// Extract rationale for hype cycle positioning
function extractPositionRationale(analysisText, position) {
  const rationaleRegex = new RegExp(`${position}[^.]*\\.([^.]*\\.)`, 'i');
  const match = analysisText.match(rationaleRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return 'Rationale not available';
}

// Extract maturity metrics from analysis text
function extractMaturityMetrics(analysisText) {
  const metrics = {
    adoptionRate: null,
    timeToMainstream: null,
    enterpriseReadiness: null,
    technicalMaturity: null
  };

  // Extract adoption rate
  const adoptionMatch = analysisText.match(/(\d+(?:-\d+)?)\s*%?\s*(?:adoption|enterprises|organizations)/i);
  if (adoptionMatch) {
    metrics.adoptionRate = adoptionMatch[1] + '%';
  }

  // Extract time to mainstream
  const timeMatch = analysisText.match(/(\d+(?:-\d+)?)\s*years?\s*(?:to|for|until|remaining)/i);
  if (timeMatch) {
    metrics.timeToMainstream = timeMatch[1] + ' years';
  }

  // Extract readiness level
  const readinessPatterns = ['highly viable', 'enterprise-ready', 'ready for', 'mature enough'];
  for (const pattern of readinessPatterns) {
    if (new RegExp(pattern, 'i').test(analysisText)) {
      metrics.enterpriseReadiness = 'High';
      break;
    }
  }

  if (!metrics.enterpriseReadiness) {
    metrics.enterpriseReadiness = 'Moderate';
  }

  return metrics;
}

// Generate chart data for hype cycle visualization
function generateMaturityChartData(analysisText, technology) {
  const position = extractHypeCyclePosition(analysisText);
  
  // Map hype cycle positions to coordinates
  const positionCoordinates = {
    'Innovation Trigger': { x: 10, y: 20 },
    'Peak of Expectations': { x: 30, y: 85 },
    'Peak of Inflated Expectations': { x: 30, y: 85 },
    'Trough of Disillusionment': { x: 50, y: 25 },
    'Slope of Enlightenment': { x: 70, y: 50 },
    'Plateau of Productivity': { x: 90, y: 70 }
  };

  const coords = positionCoordinates[position.position] || { x: 50, y: 50 };

  return {
    type: 'hype-cycle',
    title: `${technology} Hype Cycle Position`,
    data: {
      hypeCurve: [
        { x: 5, y: 15 },   // Innovation Trigger
        { x: 30, y: 85 },  // Peak of Expectations
        { x: 50, y: 25 },  // Trough of Disillusionment
        { x: 70, y: 50 },  // Slope of Enlightenment
        { x: 95, y: 70 }   // Plateau of Productivity
      ],
      technologyPosition: {
        x: coords.x,
        y: coords.y,
        label: technology,
        position: position.position
      },
      phases: [
        { name: 'Innovation\nTrigger', x: 10, y: 10 },
        { name: 'Peak of\nExpectations', x: 30, y: 90 },
        { name: 'Trough of\nDisillusionment', x: 50, y: 15 },
        { name: 'Slope of\nEnlightenment', x: 70, y: 40 },
        { name: 'Plateau of\nProductivity', x: 90, y: 75 }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${technology} Technology Maturity Assessment`
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          },
          min: 0,
          max: 100,
          display: false
        },
        y: {
          title: {
            display: true,
            text: 'Expectations'
          },
          min: 0,
          max: 100,
          display: false
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
function formatWebSummary(maturityData) {
  return {
    title: `${maturityData.technology} Technology Maturity`,
    summary: maturityData.summary,
    position: maturityData.hypeCyclePosition,
    metrics: maturityData.maturityMetrics,
    sections: [
      {
        title: 'Hype Cycle Position',
        content: extractSection(maturityData.analysis, 'HYPE CYCLE POSITIONING')
      },
      {
        title: 'Maturity Indicators',
        content: extractSection(maturityData.analysis, 'MATURITY INDICATORS')
      },
      {
        title: 'Implementation Readiness',
        content: extractSection(maturityData.analysis, 'IMPLEMENTATION READINESS')
      },
      {
        title: 'Adoption Timeline',
        content: extractSection(maturityData.analysis, 'ADOPTION TIMELINE')
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