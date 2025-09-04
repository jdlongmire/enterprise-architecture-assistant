const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const requestBody = JSON.parse(event.body);
    const { endpoint, ...requestData } = requestBody;

    // Route to appropriate handler based on endpoint
    switch (endpoint) {
      case 'test':
        return await handleTest(headers);
      case 'search':
        return await handleWebSearch(requestData, headers);
      case 'claude':
        return await handleClaudeAPI(requestData, headers);
      case 'research':
        return await handleEnhancedResearch(requestData, headers);
      default:
        // Backward compatibility - default to Claude API
        return await handleClaudeAPI(requestBody, headers);
    }

  } catch (error) {
    console.error('API function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error: ' + error.message
      })
    };
  }
};

// Handle connection test
async function handleTest(headers) {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const searchApiKey = process.env.BING_SEARCH_API_KEY || process.env.SERPAPI_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Connection test successful',
      capabilities: {
        claude: !!claudeApiKey,
        search: !!searchApiKey,
        timestamp: new Date().toISOString()
      }
    })
  };
}

// Handle web search requests
async function handleWebSearch(requestData, headers) {
  const { query, searchType = 'general', maxResults = 5 } = requestData;

  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Search query is required' })
    };
  }

  try {
    const searchResults = await performWebSearch(query, searchType, maxResults);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        query: query,
        searchType: searchType,
        results: searchResults,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Web search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Web search failed: ' + error.message
      })
    };
  }
}

// Handle enhanced research requests (search + Claude analysis)
async function handleEnhancedResearch(requestData, headers) {
  const { technology, researchPhase, options = {} } = requestData;

  if (!technology || !researchPhase) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Technology and research phase are required' 
      })
    };
  }

  try {
    // Step 1: Gather web search data
    const searchQueries = generateSearchQueries(technology, researchPhase);
    const searchResults = await Promise.all(
      searchQueries.map(query => performWebSearch(query.query, query.type, 3))
    );

    // Step 2: Process and filter search results
    const processedData = processSearchResults(searchResults, researchPhase);

    // Step 3: Generate enhanced Claude prompt with search data
    const enhancedPrompt = generateEnhancedPrompt(technology, researchPhase, processedData, options);

    // Step 4: Get Claude analysis
    const claudeResponse = await callClaudeAPI(enhancedPrompt, {
      maxTokens: options.maxTokens || 3000,
      temperature: options.temperature || 0.3
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        technology: technology,
        researchPhase: researchPhase,
        searchData: processedData,
        analysis: claudeResponse,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Enhanced research error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Enhanced research failed: ' + error.message
      })
    };
  }
}

// Handle standard Claude API requests
async function handleClaudeAPI(requestData, headers) {
  const { prompt, options = {} } = requestData;

  if (!prompt) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Prompt is required' })
    };
  }

  try {
    const response = await callClaudeAPI(prompt, options);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: response,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Claude API failed: ' + error.message
      })
    };
  }
}

// Perform web search using configured provider
async function performWebSearch(query, searchType, maxResults) {
  const searchProvider = process.env.SEARCH_PROVIDER || 'bing';
  
  switch (searchProvider.toLowerCase()) {
    case 'bing':
      return await bingWebSearch(query, searchType, maxResults);
    case 'serpapi':
      return await serpApiSearch(query, searchType, maxResults);
    case 'brave':
      return await braveSearch(query, searchType, maxResults);
    default:
      throw new Error(`Unsupported search provider: ${searchProvider}`);
  }
}

// Bing Web Search API implementation
async function bingWebSearch(query, searchType, maxResults) {
  const bingApiKey = process.env.BING_SEARCH_API_KEY;
  if (!bingApiKey) {
    throw new Error('Bing Search API key not configured');
  }

  const endpoint = 'https://api.bing.microsoft.com/v7.0/search';
  const searchQuery = enhanceSearchQuery(query, searchType);
  
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}&count=${maxResults}&responseFilter=webPages`, {
    headers: {
      'Ocp-Apim-Subscription-Key': bingApiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Bing search failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data.webPages?.value?.map(item => ({
    title: item.name,
    url: item.url,
    snippet: item.snippet,
    datePublished: item.datePublished,
    source: 'bing'
  })) || [];
}

// SerpApi implementation
async function serpApiSearch(query, searchType, maxResults) {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) {
    throw new Error('SerpApi key not configured');
  }

  const endpoint = 'https://serpapi.com/search';
  const searchQuery = enhanceSearchQuery(query, searchType);
  
  const params = new URLSearchParams({
    q: searchQuery,
    api_key: serpApiKey,
    engine: 'google',
    num: maxResults.toString()
  });

  const response = await fetch(`${endpoint}?${params}`);
  
  if (!response.ok) {
    throw new Error(`SerpApi search failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data.organic_results?.map(item => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
    source: 'serpapi'
  })) || [];
}

// Brave Search API implementation
async function braveSearch(query, searchType, maxResults) {
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!braveApiKey) {
    throw new Error('Brave Search API key not configured');
  }

  const endpoint = 'https://api.search.brave.com/res/v1/web/search';
  const searchQuery = enhanceSearchQuery(query, searchType);
  
  const params = new URLSearchParams({
    q: searchQuery,
    count: maxResults.toString()
  });

  const response = await fetch(`${endpoint}?${params}`, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': braveApiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Brave search failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data.web?.results?.map(item => ({
    title: item.title,
    url: item.url,
    snippet: item.description,
    source: 'brave'
  })) || [];
}

// Enhance search queries based on type
function enhanceSearchQuery(query, searchType) {
  const enhancements = {
    market: `${query} market analysis 2024 2025 research report`,
    vendor: `${query} vendor comparison Gartner Forrester leader`,
    technology: `${query} technology implementation case study enterprise`,
    hype: `${query} hype cycle Gartner market maturity adoption`,
    financial: `${query} market size revenue growth forecast`,
    general: query
  };

  return enhancements[searchType] || enhancements.general;
}

// Generate search queries for different research phases
function generateSearchQueries(technology, researchPhase) {
  const baseQueries = {
    market: [
      { query: `${technology} market size 2024`, type: 'financial' },
      { query: `${technology} enterprise adoption trends`, type: 'market' },
      { query: `${technology} industry analysis report`, type: 'market' }
    ],
    vendor: [
      { query: `${technology} vendor comparison Gartner`, type: 'vendor' },
      { query: `${technology} leading companies market share`, type: 'vendor' },
      { query: `${technology} competitive landscape 2024`, type: 'vendor' }
    ],
    hype: [
      { query: `${technology} Gartner hype cycle 2024`, type: 'hype' },
      { query: `${technology} market maturity assessment`, type: 'hype' },
      { query: `${technology} adoption timeline enterprise`, type: 'technology' }
    ],
    strategic: [
      { query: `${technology} ROI case study enterprise`, type: 'technology' },
      { query: `${technology} implementation best practices`, type: 'technology' },
      { query: `${technology} business value assessment`, type: 'market' }
    ]
  };

  return baseQueries[researchPhase] || baseQueries.market;
}

// Process and filter search results
function processSearchResults(searchResultsArray, researchPhase) {
  const allResults = searchResultsArray.flat();
  
  // Filter for relevant, recent, and authoritative sources
  const filteredResults = allResults.filter(result => {
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();
    const url = result.url.toLowerCase();
    
    // Prioritize authoritative sources
    const authoritativeSources = [
      'gartner.com', 'forrester.com', 'idc.com', 'mckinsey.com',
      'deloitte.com', 'pwc.com', 'accenture.com', 'statista.com'
    ];
    
    const isAuthoritative = authoritativeSources.some(source => url.includes(source));
    
    // Filter out irrelevant or promotional content
    const excludeKeywords = ['download', 'webinar', 'whitepaper download', 'free trial'];
    const hasExcluded = excludeKeywords.some(keyword => 
      title.includes(keyword) || snippet.includes(keyword)
    );
    
    return !hasExcluded && (isAuthoritative || title.includes('2024') || title.includes('2025'));
  });

  // Group by relevance and limit results
  return filteredResults.slice(0, 8).map(result => ({
    title: result.title,
    snippet: result.snippet,
    url: result.url,
    relevanceScore: calculateRelevanceScore(result, researchPhase)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Calculate relevance score for search results
function calculateRelevanceScore(result, researchPhase) {
  let score = 0;
  const title = result.title.toLowerCase();
  const snippet = result.snippet.toLowerCase();
  const url = result.url.toLowerCase();
  
  // Authority bonus
  const authoritativeSources = ['gartner', 'forrester', 'idc', 'mckinsey'];
  if (authoritativeSources.some(source => url.includes(source))) {
    score += 10;
  }
  
  // Recency bonus
  if (title.includes('2024') || title.includes('2025')) {
    score += 5;
  }
  
  // Phase-specific keywords
  const phaseKeywords = {
    market: ['market', 'analysis', 'size', 'growth', 'forecast'],
    vendor: ['vendor', 'comparison', 'leader', 'competitive', 'landscape'],
    hype: ['hype cycle', 'maturity', 'adoption', 'timeline'],
    strategic: ['ROI', 'implementation', 'case study', 'best practices']
  };
  
  const keywords = phaseKeywords[researchPhase] || [];
  keywords.forEach(keyword => {
    if (title.includes(keyword) || snippet.includes(keyword)) {
      score += 2;
    }
  });
  
  return score;
}

// Generate enhanced prompts with search data
function generateEnhancedPrompt(technology, researchPhase, searchData, options) {
  const searchContext = searchData.map(result => 
    `**${result.title}**\n${result.snippet}\nSource: ${result.url}\n`
  ).join('\n');

  const prompts = {
    market: `You are a senior technology market analyst. Using the current market intelligence below, provide a comprehensive market analysis for ${technology}.

CURRENT MARKET INTELLIGENCE:
${searchContext}

Based on this current data, provide analysis covering:
1. **Market Size and Growth** - Current valuation and projected growth rates
2. **Key Market Drivers** - What's driving adoption and investment
3. **Industry Adoption** - Which sectors are leading implementation
4. **Geographic Trends** - Regional adoption patterns and growth
5. **Investment Landscape** - Funding trends and M&A activity

Focus on data-driven insights from the sources above. Cite specific market figures and projections when available.`,

    vendor: `You are an enterprise vendor analyst. Using the current vendor intelligence below, analyze the ${technology} vendor ecosystem.

CURRENT VENDOR INTELLIGENCE:
${searchContext}

Based on this current data, provide analysis covering:
1. **Market Leaders** - Top vendors by market share and revenue
2. **Competitive Positioning** - How vendors differentiate themselves  
3. **Emerging Players** - New entrants and disruptive companies
4. **Partnership Ecosystem** - Key alliances and integrations
5. **Selection Framework** - Criteria for vendor evaluation

Use specific vendor names, market share data, and competitive insights from the sources above.`,

    hype: `You are a technology maturity analyst. Using the current market positioning data below, assess ${technology}'s position on the hype cycle.

CURRENT POSITIONING DATA:
${searchContext}

Based on this current data, provide analysis covering:
1. **Current Hype Cycle Position** - Where the technology sits today
2. **Market Maturity Indicators** - Evidence of maturation or hype
3. **Adoption Timeline** - Expected path to mainstream adoption
4. **Implementation Readiness** - Current viability for enterprise deployment
5. **Future Outlook** - Next 2-5 year trajectory

Reference specific analyst reports and market indicators from the sources above.`,

    strategic: `You are an enterprise technology strategist. Using the current implementation intelligence below, develop strategic recommendations for ${technology} adoption.

CURRENT IMPLEMENTATION INTELLIGENCE:
${searchContext}

Based on this current data, provide analysis covering:
1. **Strategic Value Proposition** - Business case and ROI potential
2. **Implementation Approaches** - Proven deployment strategies
3. **Success Factors** - Critical elements for successful adoption
4. **Risk Assessment** - Challenges and mitigation strategies  
5. **Timeline and Roadmap** - Recommended implementation phases

Reference specific case studies, ROI data, and best practices from the sources above.`
  };

  return prompts[researchPhase] || prompts.market;
}

// Call Claude API
async function callClaudeAPI(prompt, options = {}) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('Claude API key not configured in environment');
  }

  const claudeRequest = {
    model: options.model || "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 3000,
    temperature: options.temperature || 0.3,
    messages: [{ role: "user", content: prompt }]
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey
    },
    body: JSON.stringify(claudeRequest)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}