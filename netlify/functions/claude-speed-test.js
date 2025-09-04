const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
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
    const overallStartTime = Date.now();
    
    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Claude API key not configured',
          instructions: 'Add CLAUDE_API_KEY to Netlify environment variables'
        })
      };
    }

    console.log('Starting Claude speed discovery tests...');
    
    const results = {
      testResults: [],
      summary: {},
      comparison: {},
      diagnostics: {}
    };

    // Test 1: Simple prompt (similar to working "Test Connection")
    await runClaudeTest(
      'Simple Test',
      'Hello, please respond with exactly one sentence about enterprise architecture.',
      500,
      claudeApiKey,
      results
    );

    // Test 2: Medium complexity prompt
    await runClaudeTest(
      'Medium Test',
      'Provide a brief 2-paragraph analysis of Zero Trust Security for enterprise architecture. Include market adoption and key benefits.',
      1000,
      claudeApiKey,
      results
    );

    // Test 3: Complex prompt (similar to what fails in research agent)
    await runClaudeTest(
      'Complex Test',
      `You are a senior technology market analyst. Provide a comprehensive analysis of Zero Trust Security for enterprise architecture.

Based on current market intelligence, provide analysis covering:
1. **Market Size and Growth** - Current valuation and projected growth rates
2. **Key Market Drivers** - What's driving adoption and investment  
3. **Industry Adoption** - Which sectors are leading implementation
4. **Strategic Value Proposition** - Business case and ROI potential
5. **Implementation Approaches** - Proven deployment strategies

Focus on data-driven insights and specific market figures when available. Provide detailed analysis suitable for C-level decision making.`,
      3000,
      claudeApiKey,
      results
    );

    const totalTime = Date.now() - overallStartTime;
    
    // Calculate summary statistics
    const successfulTests = results.testResults.filter(t => t.success);
    const failedTests = results.testResults.filter(t => !t.success);
    
    results.summary = {
      totalTime: totalTime,
      testsRun: results.testResults.length,
      successful: successfulTests.length,
      failed: failedTests.length,
      averageSuccessTime: successfulTests.length > 0 ? 
        Math.round(successfulTests.reduce((sum, t) => sum + t.responseTime, 0) / successfulTests.length) : 0,
      fastestResponse: successfulTests.length > 0 ? 
        Math.min(...successfulTests.map(t => t.responseTime)) : 0,
      slowestResponse: successfulTests.length > 0 ? 
        Math.max(...successfulTests.map(t => t.responseTime)) : 0
    };

    results.comparison = {
      netlifyLimit: 10000,
      allTestsUnderLimit: results.testResults.every(t => !t.success || t.responseTime < 10000),
      timeoutPattern: failedTests.map(t => ({
        testName: t.testName,
        timeoutAt: t.responseTime,
        promptComplexity: t.promptLength
      }))
    };

    results.diagnostics = {
      likelyIssue: determineLikelyIssue(results.testResults),
      recommendations: generateRecommendations(results.testResults),
      comparisonWithGemini: 'Gemini discovery completed in 225ms total, showing significant speed advantage'
    };

    console.log(`Claude speed discovery completed in ${totalTime}ms`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - overallStartTime;
    
    console.error('Claude speed discovery error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Speed discovery failed: ' + error.message,
        responseTime: responseTime,
        details: error.stack
      })
    };
  }
};

// Run individual Claude test
async function runClaudeTest(testName, prompt, maxTokens, apiKey, results) {
  const testStartTime = Date.now();
  
  try {
    console.log(`Running ${testName}...`);
    
    const claudeRequest = {
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature: 0.3,
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

    const responseTime = Date.now() - testStartTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      results.testResults.push({
        testName: testName,
        success: false,
        responseTime: responseTime,
        error: `HTTP ${response.status}: ${errorData.error?.message || 'Unknown error'}`,
        promptLength: prompt.length,
        maxTokens: maxTokens,
        underNetlifyLimit: responseTime < 10000,
        status: responseTime < 5000 ? 'FAST' : responseTime < 10000 ? 'ACCEPTABLE' : 'TOO_SLOW'
      });
      
      return;
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    results.testResults.push({
      testName: testName,
      success: true,
      responseTime: responseTime,
      promptLength: prompt.length,
      maxTokens: maxTokens,
      responseLength: responseText.length,
      tokensUsed: data.usage,
      underNetlifyLimit: responseTime < 10000,
      status: responseTime < 5000 ? 'FAST' : responseTime < 10000 ? 'ACCEPTABLE' : 'TOO_SLOW',
      preview: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    });
    
    console.log(`${testName} completed in ${responseTime}ms`);
    
  } catch (error) {
    const responseTime = Date.now() - testStartTime;
    
    results.testResults.push({
      testName: testName,
      success: false,
      responseTime: responseTime,
      error: error.message,
      promptLength: prompt.length,
      maxTokens: maxTokens,
      underNetlifyLimit: responseTime < 10000,
      status: 'ERROR'
    });
    
    console.error(`${testName} failed:`, error);
  }
}

// Determine likely issue based on test results
function determineLikelyIssue(testResults) {
  const successful = testResults.filter(t => t.success);
  const failed = testResults.filter(t => !t.success);
  
  if (failed.length === 0) {
    return 'All tests passed - Claude API is working well. Issue may be in research agent logic.';
  }
  
  if (successful.length === 0) {
    return 'All tests failed - Fundamental Claude API connectivity or authentication issue.';
  }
  
  // Mixed results - analyze pattern
  const simpleSuccess = testResults.find(t => t.testName === 'Simple Test')?.success;
  const complexFailed = testResults.find(t => t.testName === 'Complex Test')?.success === false;
  
  if (simpleSuccess && complexFailed) {
    return 'Prompt complexity issue - Simple prompts work, complex prompts timeout. Reduce prompt complexity.';
  }
  
  const avgSuccessTime = successful.reduce((sum, t) => sum + t.responseTime, 0) / successful.length;
  
  if (avgSuccessTime > 8000) {
    return 'Claude API responses are consistently slow (8+ seconds). Netlify timeout inevitable.';
  }
  
  return 'Mixed performance - some timeouts, some successes. May be intermittent network/API issues.';
}

// Generate recommendations based on test results
function generateRecommendations(testResults) {
  const recommendations = [];
  
  const allTimeouts = testResults.every(t => !t.success || t.responseTime > 10000);
  const mixedResults = testResults.some(t => t.success) && testResults.some(t => !t.success);
  const allSuccess = testResults.every(t => t.success);
  
  if (allTimeouts) {
    recommendations.push('Switch to Gemini API - Claude is too slow for Netlify free tier');
    recommendations.push('Consider upgrading to Netlify Pro for 26-second timeout limit');
    recommendations.push('Move to different hosting platform with longer timeout limits');
  } else if (mixedResults) {
    recommendations.push('Reduce prompt complexity for research agent');
    recommendations.push('Split complex analysis into multiple simpler API calls');
    recommendations.push('Implement prompt optimization and token reduction');
  } else if (allSuccess) {
    recommendations.push('Claude API is working well - issue is likely in research agent implementation');
    recommendations.push('Check research agent for infinite loops or inefficient processing');
    recommendations.push('Verify error handling and timeout logic in frontend');
  }
  
  // Always add Gemini comparison
  recommendations.push('Consider Gemini API as primary with Claude as fallback');
  
  return recommendations;
}