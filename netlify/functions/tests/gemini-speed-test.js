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

    console.log('Discovering available Gemini models...');
    
    // Step 1: List available models
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`;
    
    const modelsResponse = await fetch(listModelsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!modelsResponse.ok) {
      const errorData = await modelsResponse.text();
      return {
        statusCode: modelsResponse.status,
        headers,
        body: JSON.stringify({
          error: `Failed to list models: ${modelsResponse.status}`,
          details: errorData
        })
      };
    }

    const modelsData = await modelsResponse.json();
    const discoveryTime = Date.now() - startTime;
    
    // Filter models that support generateContent
    const availableModels = modelsData.models || [];
    const generateContentModels = availableModels.filter(model => 
      model.supportedGenerationMethods && 
      model.supportedGenerationMethods.includes('generateContent')
    );

    // Pick the first available model for speed testing
    const testModel = generateContentModels.length > 0 ? generateContentModels[0] : null;
    
    let speedTestResult = null;
    
    if (testModel) {
      console.log(`Testing speed with model: ${testModel.name}`);
      
      // Step 2: Test speed with available model
      const testPrompt = `Provide a brief 2-paragraph analysis of Zero Trust Security for enterprise architecture. Include market adoption and key benefits.`;
      
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${testModel.name}:generateContent?key=${geminiApiKey}`;
      
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

      const speedTestStart = Date.now();
      
      const generateResponse = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const generateTime = Date.now() - speedTestStart;
      
      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        const generatedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        speedTestResult = {
          success: true,
          responseTime: generateTime,
          speedAnalysis: {
            milliseconds: generateTime,
            seconds: (generateTime / 1000).toFixed(2),
            underNetlifyLimit: generateTime < 10000,
            status: generateTime < 5000 ? 'FAST' : generateTime < 10000 ? 'ACCEPTABLE' : 'TOO_SLOW'
          },
          modelUsed: testModel.name,
          generatedText: generatedText.substring(0, 500) + (generatedText.length > 500 ? '...' : ''),
          comparison: {
            claudeTypicalTime: '15-30 seconds',
            geminiActualTime: `${(generateTime / 1000).toFixed(2)} seconds`,
            improvement: generateTime < 10000 ? 'SIGNIFICANT_IMPROVEMENT' : 'STILL_TOO_SLOW'
          }
        };
      } else {
        const errorData = await generateResponse.text();
        speedTestResult = {
          success: false,
          error: `Speed test failed: ${generateResponse.status}`,
          details: errorData,
          modelTested: testModel.name
        };
      }
    }

    const totalTime = Date.now() - startTime;
    
    const result = {
      modelDiscovery: {
        success: true,
        discoveryTime: discoveryTime,
        totalModelsFound: availableModels.length,
        generateContentModels: generateContentModels.length,
        models: availableModels.map(model => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          inputTokenLimit: model.inputTokenLimit,
          outputTokenLimit: model.outputTokenLimit,
          supportedMethods: model.supportedGenerationMethods || []
        }))
      },
      speedTest: speedTestResult,
      summary: {
        recommendedModel: testModel ? testModel.name : 'No suitable model found',
        readyForProduction: speedTestResult?.success && speedTestResult?.speedAnalysis?.underNetlifyLimit,
        nextSteps: speedTestResult?.success ? 
          'Gemini API is working and fast enough - ready to replace Claude' : 
          'Need to troubleshoot model access or API permissions'
      },
      totalTime: totalTime,
      timestamp: new Date().toISOString()
    };

    console.log(`Model discovery and speed test completed in ${totalTime}ms`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Gemini discovery test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Discovery test failed: ' + error.message,
        responseTime: responseTime,
        details: error.stack
      })
    };
  }
};