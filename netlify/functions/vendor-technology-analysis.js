// FILE PATH: netlify/functions/vendor-technology-analysis.js
// Production Vendor-Specific Technology Analysis Module for Enterprise Architecture AI Agents

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
    const { vendor, technology } = JSON.parse(event.body);
    
    if (!vendor || !technology) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Both vendor and technology parameters required' })
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

    // Vendor-specific technology analysis prompt (targeting 6-7s performance)
    const vendorTechPrompt = `Analyze ${vendor}'s ${technology} solution for enterprise architecture evaluation.

Provide comprehensive assessment covering:

**VENDOR IMPLEMENTATION APPROACH**
- ${vendor}'s specific architecture and technical approach
- Unique features and capabilities that differentiate from competitors
- Integration with ${vendor}'s broader technology ecosystem
- Technical maturity and development timeline

**COMPETITIVE POSITIONING**
- How ${vendor}'s ${technology} compares to market alternatives
- Competitive advantages and unique value propositions
- Market share and customer adoption metrics
- Strengths and limitations vs. competitors

**ENTERPRISE SUITABILITY**
- Target use cases and ideal deployment scenarios
- Scalability and performance characteristics
- Security and compliance capabilities
- Integration complexity with existing infrastructure

**COMMERCIAL CONSIDERATIONS**
- Licensing models and pricing structure
- Total cost of ownership factors
- Support and professional services offerings
- Contract terms and vendor relationship considerations

**IMPLEMENTATION GUIDANCE**
- Deployment complexity and timeline expectations
- Required skills and training considerations
- Success factors and common implementation challenges
- Best practices for enterprise adoption

**STRATEGIC ASSESSMENT**
- Long-term viability and vendor roadmap
- Technology evolution and future development plans
- Risk factors and mitigation strategies
- Strategic fit for enterprise architecture

Keep response under 350 words. Focus on actionable insights for vendor selection and implementation planning.`;

    const apiCallStart = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: vendorTechPrompt }],
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
          error: `Vendor technology analysis failed: ${response.status}`,
          details: errorData.error?.message
        })
      };
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // Parse structured data from response for chart generation
    const vendorTechData = {
      vendor: vendor,
      technology: technology,
      analysis: responseText,
      assessment: extractVendorAssessment(responseText),
      capabilities: extractCapabilityMatrix(responseText),
      chartData: generateVendorTechChartData(responseText, vendor, technology),
      summary: extractExecutiveSummary(responseText),
      timestamp: new Date().toISOString()
    };

    const result = {
      success: true,
      module: 'vendor-technology-analysis',
      vendor: vendor,
      technology: technology,
      timing: {
        apiCallTime: apiCallTime,
        totalTime: totalTime,
        status: totalTime < 5000 ? 'FAST' : totalTime < 8000 ? 'ACCEPTABLE' : 'SLOW'
      },
      data: vendorTechData,
      artifacts: {
        webSummary: formatWebSummary(vendorTechData),
        chartData: vendorTechData.chartData,
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
        error: 'Vendor technology analysis failed: ' + error.message,
        module: 'vendor-technology-analysis'
      })
    };
  }
};

// Extract vendor assessment scores from analysis text
function extractVendorAssessment(analysisText) {
  const assessment = {
    technicalMaturity: 'Moderate',
    competitivePosition: 'Moderate',
    enterpriseSuitability: 'Moderate',
    implementationComplexity: 'Moderate',
    strategicValue: 'Moderate'
  };

  // Simple keyword-based assessment extraction
  const maturityKeywords = ['mature', 'proven', 'established', 'leading'];
  const strongKeywords = ['strong', 'excellent', 'superior', 'market-leading'];
  const complexityKeywords = ['complex', 'challenging', 'difficult', 'extensive'];

  if (maturityKeywords.some(keyword => new RegExp(keyword, 'i').test(analysisText))) {
    assessment.technicalMaturity = 'High';
  }

  if (strongKeywords.some(keyword => new RegExp(keyword, 'i').test(analysisText))) {
    assessment.competitivePosition = 'Strong';
    assessment.strategicValue = 'High';
  }

  if (complexityKeywords.some(keyword => new RegExp(keyword, 'i').test(analysisText))) {
    assessment.implementationComplexity = 'High';
  }

  return assessment;
}

// Extract capability matrix from analysis text
function extractCapabilityMatrix(analysisText) {
  const capabilities = {
    security: extractCapabilityScore(analysisText, ['security', 'secure', 'protection']),
    scalability: extractCapabilityScore(analysisText, ['scalability', 'scalable', 'scale']),
    integration: extractCapabilityScore(analysisText, ['integration', 'integrate', 'interoperability']),
    performance: extractCapabilityScore(analysisText, ['performance', 'fast', 'efficient']),
    usability: extractCapabilityScore(analysisText, ['usability', 'user-friendly', 'intuitive']),
    support: extractCapabilityScore(analysisText, ['support', 'service', 'maintenance'])
  };

  return capabilities;
}

// Extract capability score based on keywords
function extractCapabilityScore(analysisText, keywords) {
  const positiveModifiers = ['excellent', 'strong', 'superior', 'advanced', 'robust'];
  const negativeModifiers = ['limited', 'weak', 'poor', 'basic', 'minimal'];

  for (const keyword of keywords) {
    const keywordRegex = new RegExp(`(\\w+\\s+)?${keyword}`, 'gi');
    const matches = analysisText.match(keywordRegex);
    
    if (matches) {
      for (const match of matches) {
        if (positiveModifiers.some(modifier => new RegExp(modifier, 'i').test(match))) {
          return 4; // High score
        }
        if (negativeModifiers.some(modifier => new RegExp(modifier, 'i').test(match))) {
          return 2; // Low score
        }
      }
      return 3; // Moderate score if keyword found but no clear modifier
    }
  }
  
  return 3; // Default moderate score
}

// Generate chart data for vendor technology visualization
function generateVendorTechChartData(analysisText, vendor, technology) {
  const capabilities = extractCapabilityMatrix(analysisText);
  
  return {
    type: 'vendor-capability-radar',
    title: `${vendor} ${technology} Capability Assessment`,
    data: {
      labels: [
        'Security',
        'Scalability', 
        'Integration',
        'Performance',
        'Usability',
        'Support'
      ],
      datasets: [{
        label: `${vendor} ${technology}`,
        data: [
          capabilities.security,
          capabilities.scalability,
          capabilities.integration,
          capabilities.performance,
          capabilities.usability,
          capabilities.support
        ],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#2980b9',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${vendor} ${technology} Enterprise Capabilities`
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
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
function formatWebSummary(vendorTechData) {
  return {
    title: `${vendorTechData.vendor} ${vendorTechData.technology} Analysis`,
    summary: vendorTechData.summary,
    assessment: vendorTechData.assessment,
    capabilities: vendorTechData.capabilities,
    sections: [
      {
        title: 'Implementation Approach',
        content: extractSection(vendorTechData.analysis, 'VENDOR IMPLEMENTATION APPROACH')
      },
      {
        title: 'Competitive Position',
        content: extractSection(vendorTechData.analysis, 'COMPETITIVE POSITIONING')
      },
      {
        title: 'Enterprise Suitability',
        content: extractSection(vendorTechData.analysis, 'ENTERPRISE SUITABILITY')
      },
      {
        title: 'Commercial Considerations',
        content: extractSection(vendorTechData.analysis, 'COMMERCIAL CONSIDERATIONS')
      },
      {
        title: 'Implementation Guidance',
        content: extractSection(vendorTechData.analysis, 'IMPLEMENTATION GUIDANCE')
      },
      {
        title: 'Strategic Assessment',
        content: extractSection(vendorTechData.analysis, 'STRATEGIC ASSESSMENT')
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