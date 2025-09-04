// Technology Research Agent - Simplified Fast Version
class TechnologyResearchAgent {
    constructor() {
        this.currentResearch = null;
        this.progressCallback = null;
        this.resultCallback = null;
        this.init();
    }

    init() {
        console.log('Technology Research Agent initialized (Fast Version)');
    }

    // Main research orchestration method - simplified workflow
    async conductResearch(technology, options = {}) {
        this.currentResearch = {
            id: this.generateAnalysisId(),
            technology: technology,
            options: options,
            startTime: new Date(),
            searchData: {},
            analysis: {},
            artifacts: []
        };

        try {
            this.updateProgress('Initializing comprehensive research...', 0);

            // Phase 1: Single Comprehensive Search
            await this.gatherComprehensiveIntelligence(technology);
            this.updateProgress('Market intelligence gathered', 25);

            // Phase 2: Single Comprehensive Analysis
            await this.conductComprehensiveAnalysis(technology);
            this.updateProgress('Comprehensive analysis complete', 75);

            // Phase 3: Generate Artifacts
            if (options.generateArtifacts !== false) {
                await this.generateArtifacts();
                this.updateProgress('Artifacts generated', 100);
            }

            // Complete research
            this.currentResearch.endTime = new Date();
            this.currentResearch.duration = this.currentResearch.endTime - this.currentResearch.startTime;

            // Save to history
            if (window.eaApp) {
                window.eaApp.saveToHistory({
                    id: this.currentResearch.id,
                    type: 'technology-research',
                    technology: technology,
                    timestamp: this.currentResearch.startTime.toISOString(),
                    duration: this.currentResearch.duration,
                    artifacts: this.currentResearch.artifacts.length
                });
            }

            // Show results
            this.showResults();
            
            return this.currentResearch;

        } catch (error) {
            console.error('Research failed:', error);
            this.handleError(error);
            throw error;
        }
    }

    // Single comprehensive search instead of multiple searches
    async gatherComprehensiveIntelligence(technology) {
        this.setActiveStep('step-search');
        
        try {
            // Single comprehensive search query
            const comprehensiveQuery = `${technology} market analysis vendor landscape Gartner Forrester 2024 enterprise implementation`;
            
            const searchResult = await this.callAPI('search', {
                query: comprehensiveQuery,
                searchType: 'market',
                maxResults: 10
            });

            this.currentResearch.searchData = searchResult.results;
            this.setStepCompleted('step-search');
            
        } catch (error) {
            console.error('Web intelligence gathering failed:', error);
            // Continue with analysis using existing knowledge
            this.currentResearch.searchData = [];
        }
    }

    // Single comprehensive analysis instead of multiple phases
    async conductComprehensiveAnalysis(technology) {
        this.setActiveStep('step-market');
        this.setActiveStep('step-vendor');
        this.setActiveStep('step-strategic');
        
        try {
            // Create comprehensive prompt that covers all analysis areas
            const comprehensivePrompt = this.createComprehensivePrompt(technology);
            
            const analysis = await this.callAPI('claude', {
                prompt: comprehensivePrompt,
                options: {
                    maxTokens: 4000,
                    temperature: 0.3
                }
            });

            // Parse the comprehensive analysis into sections
            this.parseComprehensiveAnalysis(analysis.content);
            
            this.setStepCompleted('step-market');
            this.setStepCompleted('step-vendor');
            this.setStepCompleted('step-strategic');
            
        } catch (error) {
            console.error('Comprehensive analysis failed:', error);
            throw new Error('Analysis failed: ' + error.message);
        }
    }

    // Create a comprehensive prompt that covers all research areas
    createComprehensivePrompt(technology) {
        const searchContext = this.currentResearch.searchData
            .map(result => `**${result.title}**\n${result.snippet}\nSource: ${result.url}`)
            .join('\n\n');

        return `You are a senior enterprise technology analyst. Using the current market intelligence below, provide a comprehensive analysis for ${technology}.

CURRENT MARKET INTELLIGENCE:
${searchContext}

Please provide a comprehensive analysis with the following sections:

# MARKET RESEARCH
Analyze market size, growth trends, key drivers, industry adoption patterns, and geographic trends. Include specific data and projections where available.

# VENDOR ANALYSIS  
Identify market leaders, competitive positioning, emerging players, and selection criteria. Use specific vendor names and market positioning from the sources.

# HYPE CYCLE ANALYSIS
Assess the technology's current position on the hype cycle, maturity indicators, adoption timeline, and implementation readiness. 

# STRATEGIC SUMMARY
Develop strategic recommendations including value proposition, implementation approaches, success factors, risk assessment, and recommended timeline.

Focus on actionable insights based on the current market intelligence provided. Use specific data, vendor names, and market positioning from the sources above.

Format each section with clear headers and provide comprehensive analysis for enterprise decision-making.`;
    }

    // Parse comprehensive analysis into structured sections
    parseComprehensiveAnalysis(analysisText) {
        const sections = {
            marketResearch: '',
            vendorAnalysis: '',
            hypeCycleData: '',
            strategicSummary: ''
        };

        // Split analysis by headers
        const marketMatch = analysisText.match(/# MARKET RESEARCH([\s\S]*?)(?=# |$)/i);
        const vendorMatch = analysisText.match(/# VENDOR ANALYSIS([\s\S]*?)(?=# |$)/i);
        const hypeMatch = analysisText.match(/# HYPE CYCLE ANALYSIS([\s\S]*?)(?=# |$)/i);
        const strategicMatch = analysisText.match(/# STRATEGIC SUMMARY([\s\S]*?)(?=# |$)/i);

        if (marketMatch) sections.marketResearch = marketMatch[1].trim();
        if (vendorMatch) sections.vendorAnalysis = vendorMatch[1].trim();
        if (hypeMatch) sections.hypeCycleData = hypeMatch[1].trim();
        if (strategicMatch) sections.strategicSummary = strategicMatch[1].trim();

        // Fallback: if sections not properly parsed, use the full analysis
        if (!sections.marketResearch && !sections.vendorAnalysis) {
            sections.marketResearch = analysisText.substring(0, analysisText.length / 4);
            sections.vendorAnalysis = analysisText.substring(analysisText.length / 4, analysisText.length / 2);
            sections.hypeCycleData = analysisText.substring(analysisText.length / 2, 3 * analysisText.length / 4);
            sections.strategicSummary = analysisText.substring(3 * analysisText.length / 4);
        }

        this.currentResearch.analysis = sections;
    }

    // Generate downloadable artifacts (unchanged from original)
    async generateArtifacts() {
        this.setActiveStep('step-artifacts');
        
        try {
            const artifacts = [];

            // Generate Executive Summary PDF
            if (this.currentResearch.analysis.strategicSummary) {
                const pdfArtifact = await this.generateExecutivePDF();
                artifacts.push(pdfArtifact);
            }

            // Generate Market Analysis PDF
            if (this.currentResearch.analysis.marketResearch) {
                const marketPdf = await this.generateMarketAnalysisPDF();
                artifacts.push(marketPdf);
            }

            // Generate Hype Cycle Chart
            if (this.currentResearch.analysis.hypeCycleData) {
                const hypeCycleChart = await this.generateHypeCycleChart();
                artifacts.push(hypeCycleChart);
            }

            // Generate Vendor Landscape Chart
            if (this.currentResearch.analysis.vendorAnalysis) {
                const vendorChart = await this.generateVendorChart();
                artifacts.push(vendorChart);
            }

            // Generate Analysis Data (JSON)
            const dataArtifact = this.generateAnalysisData();
            artifacts.push(dataArtifact);

            this.currentResearch.artifacts = artifacts;
            this.setStepCompleted('step-artifacts');
            
        } catch (error) {
            console.error('Artifact generation failed:', error);
            throw new Error('Artifact generation failed: ' + error.message);
        }
    }

    // Call backend API (simplified error handling)
    async callAPI(endpoint, data) {
        try {
            const response = await fetch(EA_CONFIG.api.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: endpoint,
                    ...data
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }

            return result;
            
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // PDF generation methods (unchanged from original)
    async generateExecutivePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Enterprise Architecture Analysis', 20, 30);
        
        doc.setFontSize(16);
        doc.text(`Technology: ${this.currentResearch.technology}`, 20, 45);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
        
        // Executive Summary
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Executive Summary', 20, 75);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const summary = this.currentResearch.analysis.strategicSummary || 'Strategic analysis data not available.';
        const lines = doc.splitTextToSize(summary.substring(0, 2000), 170);
        doc.text(lines, 20, 85);
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Executive_Summary.pdf`,
            title: 'Executive Summary',
            description: 'Strategic analysis and recommendations',
            url: pdfUrl,
            icon: 'fas fa-file-pdf'
        };
    }

    async generateMarketAnalysisPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Market Analysis Report', 20, 30);
        
        doc.setFontSize(16);
        doc.text(`Technology: ${this.currentResearch.technology}`, 20, 45);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
        
        // Market Analysis
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Market Research', 20, 75);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const marketData = this.currentResearch.analysis.marketResearch || 'Market research data not available.';
        const lines = doc.splitTextToSize(marketData.substring(0, 2000), 170);
        doc.text(lines, 20, 85);
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Market_Analysis.pdf`,
            title: 'Market Analysis',
            description: 'Comprehensive market research and trends',
            url: pdfUrl,
            icon: 'fas fa-chart-line'
        };
    }

    async generateHypeCycleChart() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Draw hype cycle curve
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 500);
        ctx.quadraticCurveTo(200, 100, 350, 450);
        ctx.quadraticCurveTo(550, 350, 750, 300);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText('Innovation Trigger', 60, 530);
        ctx.fillText('Peak of Inflated Expectations', 150, 80);
        ctx.fillText('Trough of Disillusionment', 320, 480);
        ctx.fillText('Slope of Enlightenment', 500, 380);
        ctx.fillText('Plateau of Productivity', 600, 280);
        
        // Position technology
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(400, 400, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.currentResearch.technology, 420, 405);
        
        const chartBlob = await new Promise(resolve => canvas.toBlob(resolve));
        const chartUrl = URL.createObjectURL(chartBlob);
        
        return {
            type: 'image',
            name: `${this.currentResearch.technology}_Hype_Cycle.png`,
            title: 'Hype Cycle Chart',
            description: 'Technology maturity positioning',
            url: chartUrl,
            icon: 'fas fa-chart-area'
        };
    }

    async generateVendorChart() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw axes
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 500);
        ctx.lineTo(700, 500);
        ctx.moveTo(100, 100);
        ctx.lineTo(100, 500);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText('Market Share', 350, 540);
        ctx.save();
        ctx.translate(50, 300);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Innovation', 0, 0);
        ctx.restore();
        
        // Title
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${this.currentResearch.technology} Vendor Landscape`, 250, 40);
        
        // Extract vendor names from analysis or use placeholders
        const vendorAnalysis = this.currentResearch.analysis.vendorAnalysis || '';
        const detectedVendors = this.extractVendorNames(vendorAnalysis);
        
        const vendors = detectedVendors.length > 0 ? detectedVendors : [
            { name: 'Leader A', x: 500, y: 200, color: '#3498db' },
            { name: 'Leader B', x: 450, y: 250, color: '#3498db' },
            { name: 'Challenger C', x: 350, y: 300, color: '#f39c12' },
            { name: 'Niche D', x: 250, y: 180, color: '#9b59b6' }
        ];
        
        vendors.forEach(vendor => {
            ctx.fillStyle = vendor.color;
            ctx.beginPath();
            ctx.arc(vendor.x, vendor.y, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#2c3e50';
            ctx.font = '12px Arial';
            ctx.fillText(vendor.name, vendor.x + 15, vendor.y + 5);
        });
        
        const chartBlob = await new Promise(resolve => canvas.toBlob(resolve));
        const chartUrl = URL.createObjectURL(chartBlob);
        
        return {
            type: 'image',
            name: `${this.currentResearch.technology}_Vendor_Landscape.png`,
            title: 'Vendor Landscape',
            description: 'Competitive positioning analysis',
            url: chartUrl,
            icon: 'fas fa-building'
        };
    }

    // Extract vendor names from analysis text
    extractVendorNames(text) {
        const commonVendors = [
            'Microsoft', 'Google', 'Amazon', 'IBM', 'Oracle', 'Salesforce', 'SAP', 'Cisco',
            'VMware', 'Dell', 'HP', 'Intel', 'NVIDIA', 'Adobe', 'Workday', 'ServiceNow',
            'Palo Alto Networks', 'CrowdStrike', 'Zscaler', 'Okta', 'Splunk', 'Tableau'
        ];
        
        const foundVendors = [];
        commonVendors.forEach((vendor, index) => {
            if (text.includes(vendor)) {
                foundVendors.push({
                    name: vendor,
                    x: 200 + (index % 4) * 150,
                    y: 200 + Math.floor(index / 4) * 100,
                    color: index < 2 ? '#3498db' : index < 4 ? '#f39c12' : '#9b59b6'
                });
            }
        });
        
        return foundVendors.slice(0, 6); // Limit to 6 vendors for clean chart
    }

    generateAnalysisData() {
        const data = {
            metadata: {
                id: this.currentResearch.id,
                technology: this.currentResearch.technology,
                timestamp: this.currentResearch.startTime.toISOString(),
                agent: 'Technology Research Agent (Fast)',
                searchSources: this.currentResearch.searchData.length
            },
            analysis: this.currentResearch.analysis,
            searchData: this.currentResearch.searchData
        };
        
        const dataBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        return {
            type: 'json',
            name: `${this.currentResearch.technology}_Analysis_Data.json`,
            title: 'Analysis Data',
            description: 'Complete research data and metadata',
            url: dataUrl,
            icon: 'fas fa-database'
        };
    }

    // UI helper methods (unchanged)
    showResults() {
        document.getElementById('research-progress').style.display = 'none';
        document.getElementById('research-results').style.display = 'block';
        
        const artifactGrid = document.getElementById('artifact-grid');
        if (artifactGrid && this.currentResearch.artifacts) {
            artifactGrid.innerHTML = this.currentResearch.artifacts.map(artifact => `
                <div class="artifact-card" onclick="window.open('${artifact.url}', '_blank')">
                    <i class="${artifact.icon}"></i>
                    <h5>${artifact.title}</h5>
                    <p>${artifact.description}</p>
                    <small>Click to download</small>
                </div>
            `).join('');
        }
    }

    updateProgress(message, percentage) {
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressText) progressText.textContent = message;
        if (progressFill) progressFill.style.width = `${percentage}%`;
        
        if (this.progressCallback) {
            this.progressCallback(message, percentage);
        }
    }

    setActiveStep(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            step.classList.add('active');
        }
    }

    setStepCompleted(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }

    generateAnalysisId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleError(error) {
        console.error('Research error:', error);
        
        if (window.eaApp) {
            window.eaApp.showToast(
                `Research failed: ${error.message}`, 
                'error'
            );
        }
        
        // Reset interface
        document.getElementById('research-progress').style.display = 'none';
        document.getElementById('research-form').style.display = 'block';
    }
}

// Initialize the simplified Technology Research Agent
window.technologyResearch = new TechnologyResearchAgent();