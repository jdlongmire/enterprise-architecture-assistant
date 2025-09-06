// netlify/functions/supplier-quad.js
// Enterprise Architecture Supplier Quadrant Analysis Module
// Real-world data extraction only - no synthetic data generation

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const { technology } = JSON.parse(event.body);
        
        if (!technology) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Technology parameter is required' })
            };
        }

        console.log(`Starting supplier quadrant analysis for: ${technology}`);
        const startTime = Date.now();

        // Enhanced Magic Quadrant analysis prompt
        const supplierQuadPrompt = `Conduct a Magic Quadrant-style vendor positioning analysis for ${technology}.

**ANALYSIS FRAMEWORK:**
Evaluate 6-10 major vendors using Gartner-style methodology with transparent scoring:

**ABILITY TO EXECUTE (Weighted Scoring)**
- Product Capability (25%): Feature breadth/depth, performance benchmarks, compliance certifications
- Reliability & Operations (15%): SLAs/SLOs, uptime track record, incident response, operational tooling
- Customer Experience (15%): Time-to-value, documentation quality, support responsiveness, user satisfaction
- Market Traction (20%): Customer count, enterprise logos, deployment scale, revenue growth
- Financial Viability (10%): Company stability, funding, profitability indicators, market cap
- Ecosystem Partners (15%): Integration ecosystem, marketplace presence, SI/ISV partnerships

**COMPLETENESS OF VISION (Weighted Scoring)**
- Innovation Roadmap (25%): R&D investment, feature velocity, credible future plans
- Market Understanding (20%): Use case fit, vertical expertise, customer reference diversity
- Platform Strategy (20%): Architecture clarity, extensibility, API-first design, governance
- Go-to-Market (15%): Channel strategy, pricing transparency, packaging clarity, trial availability
- Standards Compliance (10%): Open standards support, API portability, interoperability
- Geographic Strategy (10%): Global presence, localization, data residency compliance

**REQUIRED OUTPUT FORMAT:**
For each vendor, provide EXACTLY this structure:

**Vendor 1: [Company Name]**
1. **Scores:**
   - Product Capability: [0-100] ([brief rationale])
   - Reliability & Operations: [0-100] ([brief rationale])
   - Customer Experience: [0-100] ([brief rationale])
   - Market Traction: [0-100] ([brief rationale])
   - Financial Viability: [0-100] ([brief rationale])
   - Ecosystem Partners: [0-100] ([brief rationale])
   - Innovation Roadmap: [0-100] ([brief rationale])
   - Market Understanding: [0-100] ([brief rationale])
   - Platform Strategy: [0-100] ([brief rationale])
   - Go-to-Market: [0-100] ([brief rationale])
   - Standards Compliance: [0-100] ([brief rationale])
   - Geographic Strategy: [0-100] ([brief rationale])
2. **Axis Scores:**
   - Ability to Execute: [weighted average]
   - Completeness of Vision: [weighted average]
3. **Quadrant Assignment:** [Leaders/Challengers/Visionaries/Niche Players]
4. **Key Strengths:** [2-3 key differentiators]

Use only real, publicly verifiable companies and accurate market data.`;

        // Call GPT-4o API
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: supplierQuadPrompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.1
            }),
        });

        if (!apiResponse.ok) {
            throw new Error(`OpenAI API error: ${apiResponse.status}`);
        }

        const completion = await apiResponse.json();
        const analysisText = completion.choices[0].message.content;
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        console.log(`Supplier quadrant analysis completed in ${executionTime}ms`);

        // Extract vendor data from real GPT analysis only
        const vendorData = extractRealVendorData(analysisText);
        
        if (vendorData.length === 0) {
            throw new Error('Unable to extract vendor data from analysis. GPT response may not match expected format.');
        }
        
        // Generate chart data for Magic Quadrant visualization
        const chartData = generateQuadrantChartData(vendorData);
        
        // Extract key metrics
        const metrics = extractQuadrantMetrics(vendorData);
        
        // Format for web summary
        const webSummary = formatQuadrantSummary(analysisText, vendorData);

        // Return structured response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    analysis: analysisText,
                    vendors: vendorData,
                    chartData: chartData,
                    metrics: metrics,
                    webSummary: webSummary,
                    metadata: {
                        technology: technology,
                        executionTime: executionTime,
                        timestamp: new Date().toISOString(),
                        methodology: 'Magic Quadrant-style weighted scoring - real data only'
                    }
                }
            })
        };

    } catch (error) {
        console.error('Supplier quadrant analysis error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to complete supplier quadrant analysis',
                details: error.message
            })
        };
    }
};

// Extract real vendor data from GPT analysis - no synthetic data
function extractRealVendorData(analysisText) {
    const vendors = [];
    
    console.log('Extracting real vendor data from GPT analysis...');
    
    // Split by vendor sections
    const vendorSections = analysisText.split(/(?=\*\*Vendor\s+\d+:)/);
    
    vendorSections.forEach((section, index) => {
        if (section.trim().length < 100) return; // Skip short sections
        
        try {
            const vendor = parseVendorSection(section);
            if (vendor) {
                vendors.push(vendor);
                console.log(`Extracted vendor: ${vendor.name} - ${vendor.quadrant}`);
            }
        } catch (error) {
            console.warn(`Failed to parse vendor section ${index}:`, error.message);
        }
    });
    
    return vendors;
}

// Parse individual vendor section for real data
function parseVendorSection(section) {
    // Extract vendor name
    const nameMatch = section.match(/\*\*Vendor\s+\d+:\s+([^*\n]+)\*\*/);
    if (!nameMatch) return null;
    
    const vendorName = nameMatch[1].trim().replace(/\s*\([^)]*\)$/, ''); // Remove parenthetical
    
    // Extract scores
    const scores = {};
    const scorePatterns = {
        productCapability: /Product Capability:\s*(\d+)/,
        reliabilityAndOps: /Reliability & Operations:\s*(\d+)/,
        customerExperience: /Customer Experience:\s*(\d+)/,
        marketTraction: /Market Traction:\s*(\d+)/,
        financialViability: /Financial Viability:\s*(\d+)/,
        ecosystemPartners: /Ecosystem Partners:\s*(\d+)/,
        innovationRoadmap: /Innovation Roadmap:\s*(\d+)/,
        marketUnderstanding: /Market Understanding:\s*(\d+)/,
        platformStrategy: /Platform Strategy:\s*(\d+)/,
        goToMarket: /Go-to-Market:\s*(\d+)/,
        standardsCompliance: /Standards Compliance:\s*(\d+)/,
        geographicStrategy: /Geographic Strategy:\s*(\d+)/
    };
    
    let validScoreCount = 0;
    for (const [key, pattern] of Object.entries(scorePatterns)) {
        const match = section.match(pattern);
        if (match) {
            scores[key] = parseInt(match[1]);
            validScoreCount++;
        }
    }
    
    // Require at least 8 valid scores for data quality
    if (validScoreCount < 8) {
        console.warn(`Vendor ${vendorName} has insufficient scores (${validScoreCount}/12)`);
        return null;
    }
    
    // Extract axis scores
    const executeMatch = section.match(/Ability to Execute:\s*(\d+(?:\.\d+)?)/);
    const visionMatch = section.match(/Completeness of Vision:\s*(\d+(?:\.\d+)?)/);
    
    if (!executeMatch || !visionMatch) {
        console.warn(`Vendor ${vendorName} missing axis scores`);
        return null;
    }
    
    const abilityToExecute = parseFloat(executeMatch[1]);
    const completenessOfVision = parseFloat(visionMatch[1]);
    
    // Extract quadrant assignment
    const quadrantMatch = section.match(/Quadrant Assignment:\s*([A-Za-z\s]+)/);
    if (!quadrantMatch) {
        console.warn(`Vendor ${vendorName} missing quadrant assignment`);
        return null;
    }
    
    const quadrant = normalizeQuadrantName(quadrantMatch[1].trim());
    
    // Extract key strengths
    const strengthsMatch = section.match(/Key Strengths:\s*([^\n]*)/);
    const strengths = strengthsMatch ? strengthsMatch[1].trim() : '';
    
    return {
        name: vendorName,
        quadrant: quadrant,
        abilityToExecute: abilityToExecute,
        completenessOfVision: completenessOfVision,
        scores: scores,
        strengths: strengths,
        summary: `${vendorName}: ${strengths}`
    };
}

// Normalize quadrant names to standard format
function normalizeQuadrantName(quadrant) {
    const normalized = quadrant.toLowerCase().trim();
    if (normalized.includes('leader')) return 'Leaders';
    if (normalized.includes('challenger')) return 'Challengers';
    if (normalized.includes('visionar')) return 'Visionaries';
    if (normalized.includes('niche')) return 'Niche Players';
    return 'Niche Players'; // Default fallback
}

// Generate chart data for Magic Quadrant visualization
function generateQuadrantChartData(vendors) {
    return {
        type: 'scatter',
        title: 'Magic Quadrant - Vendor Positioning',
        datasets: [{
            label: 'Vendors',
            data: vendors.map(vendor => ({
                x: vendor.completenessOfVision,
                y: vendor.abilityToExecute,
                label: vendor.name,
                quadrant: vendor.quadrant
            })),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointRadius: 8,
            pointHoverRadius: 10
        }],
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Completeness of Vision' },
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: true }
                },
                y: {
                    title: { display: true, text: 'Ability to Execute' },
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: true }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.label}: (${context.parsed.x}, ${context.parsed.y})`;
                        }
                    }
                }
            }
        },
        quadrantLines: {
            vertical: 50,
            horizontal: 50
        }
    };
}

// Extract key metrics from real vendor data
function extractQuadrantMetrics(vendors) {
    return {
        totalVendors: vendors.length,
        evaluationFramework: '12-factor weighted scoring',
        methodology: 'Magic Quadrant-style positioning',
        scoringBasis: 'Real market analysis - no synthetic data'
    };
}

// Format supplier quadrant data for web summary display
function formatQuadrantSummary(analysisText, vendors) {
    const quadrantCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.quadrant] = (acc[vendor.quadrant] || 0) + 1;
        return acc;
    }, {});

    return {
        title: 'Supplier Quadrant Analysis',
        overview: analysisText.substring(0, 300) + '...',
        quadrantDistribution: quadrantCounts,
        topVendors: vendors
            .sort((a, b) => (b.abilityToExecute + b.completenessOfVision) - (a.abilityToExecute + a.completenessOfVision))
            .slice(0, 5)
            .map(v => ({ name: v.name, quadrant: v.quadrant })),
        sections: [
            {
                title: 'Market Leaders',
                content: vendors.filter(v => v.quadrant === 'Leaders').map(v => v.name).join(', ') || 'None identified'
            },
            {
                title: 'Strong Challengers', 
                content: vendors.filter(v => v.quadrant === 'Challengers').map(v => v.name).join(', ') || 'None identified'
            },
            {
                title: 'Visionary Players',
                content: vendors.filter(v => v.quadrant === 'Visionaries').map(v => v.name).join(', ') || 'None identified'
            }
        ]
    };
}