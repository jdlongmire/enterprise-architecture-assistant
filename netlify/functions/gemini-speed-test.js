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

  // Allow both GET (for direct testing) and POST
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const startTime = Date.now();
    
    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Gemini API key not configured',
          instructions: 'Add GEMINI_API_KEY to Netlify environment variables'
        })
      };
    }

    // Simple test prompt for EA analysis
    const testPrompt = `Provide a brief 2-paragraph analysis of Zero Trust Security for enterprise architecture. Include market adoption and key benefits.`;

    // Gemini Pro API endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: testPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      }
    };

    console.log('Calling Gemini API...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Gemini API error: ${response.status}`,
          details: errorData,
          responseTime: responseTime
        })
      };
    }

    const data = await response.json();
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    const result = {
      success: true,
      responseTime: responseTime,
      speedAnalysis: {
        milliseconds: responseTime,
        seconds: (responseTime / 1000).toFixed(2),
        underNetlifyLimit: responseTime < 10000,
        status: responseTime < 5000 ? 'FAST' : responseTime < 10000 ? 'ACCEPTABLE' : 'TOO_SLOW'
      },
      geminiResponse: {
        text: generatedText,
        model: 'gemini-pro',
        prompt: testPrompt
      },
      comparison: {
        claudeTypicalTime: '15-30 seconds',
        geminiActualTime: `${(responseTime / 1000).toFixed(2)} seconds`,
        improvement: responseTime < 10000 ? 'SIGNIFICANT_IMPROVEMENT' : 'STILL_TOO_SLOW'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Gemini API response time: ${responseTime}ms`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - (context.startTime || Date.now());
    
    console.error('Gemini speed test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Speed test failed: ' + error.message,
        responseTime: responseTime,
        details: error.stack
      })
    };
  }
};