// Enterprise Architecture Assistant - Configuration
const EA_CONFIG = {
    // Application Information
    version: '1.0.0',
    name: 'Enterprise Architecture Assistant',
    
    // API Endpoints
    api: {
        baseUrl: '/.netlify/functions/ea-api',
        timeout: 30000, // 30 seconds
        retryAttempts: 3
    },
    
    // Search Configuration
    search: {
        maxResults: 5,
        timeout: 10000,
        providers: {
            bing: 'Bing Web Search',
            serpapi: 'SerpApi (Google)',
            brave: 'Brave Search'
        }
    },
    
    // Research Agent Settings
    research: {
        phases: [
            { id: 'market', name: 'Market Research', description: 'Gathering market intelligence and trends' },
            { id: 'vendor', name: 'Vendor Analysis', description: 'Analyzing vendor landscape and capabilities' },
            { id: 'hype', name: 'Hype Cycle Analysis', description: 'Positioning technology on maturity curve' },
            { id: 'strategic', name: 'Strategic Analysis', description: 'Developing strategic recommendations' },
            { id: 'artifacts', name: 'Artifact Generation', description: 'Creating reports and visualizations' }
        ],
        defaultOptions: {
            includeMarketResearch: true,
            includeVendorAnalysis: true,
            includeHypeCycle: true,
            includeStrategicSummary: true,
            generateArtifacts: true,
            maxSearchResults: 5,
            analysisDepth: 'comprehensive'
        }
    },
    
    // Agent Definitions
    agents: {
        'technology-research': {
            name: 'Technology Research Agent',
            description: 'Comprehensive technology analysis with market intelligence',
            status: 'ready',
            priority: 1,
            icon: 'fas fa-search',
            features: [
                'Real-time market research',
                'Vendor landscape analysis', 
                'Hype cycle positioning',
                'Strategic whitepapers'
            ]
        },
        'strategic-analysis': {
            name: 'Strategic Analysis Agent',
            description: 'Business-technology alignment analysis',
            status: 'coming-soon',
            priority: 2,
            icon: 'fas fa-chess',
            features: [
                'Business case development',
                'ROI analysis frameworks',
                'Risk assessment matrices',
                'Implementation roadmaps'
            ]
        },
        'supplier-evaluation': {
            name: 'Supplier Evaluation Agent',
            description: '4 P\'s framework evaluation for vendor selection',
            status: 'coming-soon',
            priority: 3,
            icon: 'fas fa-balance-scale',
            features: [
                '4 P\'s evaluation framework',
                'TCO analysis',
                'Risk assessment',
                'Comparative scorecards'
            ]
        },
        'roadmap-planning': {
            name: 'Roadmap Planning Agent',
            description: 'Multi-year technology roadmap development',
            status: 'coming-soon',
            priority: 4,
            icon: 'fas fa-road',
            features: [
                'Dependency analysis',
                'Timeline optimization',
                'Resource planning',
                'Milestone tracking'
            ]
        },
        'adr-agent': {
            name: 'ADR Agent',
            description: 'Architecture Decision Record generation',
            status: 'coming-soon',
            priority: 5,
            icon: 'fas fa-file-contract',
            features: [
                'Decision documentation',
                'Context analysis',
                'Consequence evaluation',
                'Template generation'
            ]
        }
    },
    
    // Industry Sectors
    industries: [
        { value: 'financial-services', label: 'Financial Services' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'technology', label: 'Technology' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'retail', label: 'Retail' },
        { value: 'government', label: 'Government' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' }
    ],
    
    // Storage Keys
    storage: {
        settings: 'ea_assistant_settings',
        history: 'ea_assistant_history',
        preferences: 'ea_assistant_preferences'
    },
    
    // UI Settings
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        maxHistoryItems: 50,
        autoSaveInterval: 30000 // 30 seconds
    },
    
    // Error Messages
    errors: {
        networkError: 'Network connection failed. Please check your internet connection.',
        apiKeyMissing: 'Claude API key not configured. Please check your settings.',
        searchFailed: 'Web search failed. Please try again or check your search provider settings.',
        analysisTimeout: 'Analysis timed out. Please try again with a smaller scope.',
        invalidInput: 'Invalid input provided. Please check your parameters.',
        serverError: 'Server error occurred. Please try again later.',
        rateLimited: 'Rate limit exceeded. Please wait before making another request.'
    },
    
    // Success Messages
    success: {
        settingsSaved: 'Settings saved successfully',
        connectionTested: 'Connection test successful! Your integration is working.',
        analysisComplete: 'Analysis completed successfully',
        artifactsGenerated: 'Artifacts generated and ready for download'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EA_CONFIG;
}