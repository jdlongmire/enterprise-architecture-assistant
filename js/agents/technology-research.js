// Technology Research Agent - Enhanced with Web Search
class TechnologyResearchAgent {
    constructor() {
        this.currentResearch = null;
        this.progressCallback = null;
        this.resultCallback = null;
        this.init();
    }

    init() {
        console.log('Technology Research Agent initialized with web search capabilities');
    }

    // Main research orchestration method
    async conductResearch(technology, options = {}) {
        this.currentResearch = {
            id: this.generateAnalysisId(),
            technology: technology,
            options: options,
            startTime: new Date(),
            phases: [],
            searchData: {},
            analysis: {},
            artifacts: []
        };

        try {
            this.updateProgress('Initializing research pipeline...', 0);

            // Phase 1: Web Search Intelligence Gathering
            await this.gatherWebIntelligence(technology);
            this.updateProgress('Web intelligence gathered', 20);

            // Phase 2: Market Analysis
            if (options.includeMarketResearch !== false) {
                await this.conductMarketAnalysis(technology);
                this.updateProgress('Market analysis complete', 40);
            }

            // Phase 3: Vendor Analysis
            if (options.includeVendorAnalysis !== false) {
                await this.conductVendorAnalysis(technology);
                this.updateProgress('Vendor analysis complete', 60);
            }

            // Phase 4: Hype Cycle Analysis
            if (options.includeHypeCycle !== false) {
                await this.conductHypeCycleAnalysis(technology);
                this.updateProgress('Hype cycle analysis complete', 80);
            }

            // Phase 5: Strategic Analysis
            if (options.includeStrategicSummary !== false) {
                await this.conductStrategicAnalysis(technology);
                this.updateProgress('Strategic analysis complete', 90);
            }

            // Phase 6: Generate Artifacts
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

    // Gather web intelligence across multiple search queries
    async gatherWebIntelligence(technology) {
        this.setActiveStep('step-search');
        
        try {
            const searchQueries = [
                { query: `${technology} market analysis 2024`, type: 'market' },
                { query: `${technology} vendor landscape`, type: 'vendor' },
                { query: `${technology} Gartner hype cycle`, type: 'hype' },
                { query: `${technology} enterprise implementation`, type: 'technology' }
            ];

            const searchResults = await Promise.all(
                searchQueries.map(async (searchQuery) => {
                    const result = await this.callAPI('search', {
                        query: searchQuery.query,
                        searchType: searchQuery.type,
                        maxResults: 5
                    });
                    return { type: searchQuery.type, data: result.results };
                })
            );

            // Store web intelligence
            this.currentResearch.searchData = {};
            searchResults.forEach(result => {
                this.currentResearch.searchData[result.type] = result.data;
            });

            this.setStepCompleted('step-search');
            
        } catch (error) {
            console.error('Web intelligence gathering failed:', error);
            // Continue with analysis using existing knowledge
            this.currentResearch.searchData = {};
        }
    }

    // Conduct market analysis using enhanced prompts
    async conductMarketAnalysis(technology) {
        this.setActiveStep('step-market');
        
        try {
            const analysis = await this.callAPI('research', {
                technology: technology,
                researchPhase: 'market',
                options: {
                    maxTokens: 3000,
                    temperature: 0.3
                }
            });

            this.currentResearch.analysis.marketResearch = analysis.analysis;
            this.currentResearch.phases.push({
                phase: 'market',
                completedAt: new Date(),
                searchSources: analysis.searchData?.length || 0
            });

            this.setStepCompleted('step-market');
            
        } catch (error) {
            console.error('Market analysis failed:', error);
            throw new Error('Market analysis failed: ' + error.message);
        }
    }

    // Conduct vendor analysis
    async conductVendorAnalysis(technology) {
        this.setActiveStep('step-vendor');
        
        try {
            const analysis = await this.callAPI('research', {
                technology: technology,
                researchPhase: 'vendor',
                options: {
                    maxTokens: 3000,
                    temperature: 0.3
                }
            });

            this.currentResearch.analysis.vendorAnalysis = analysis.analysis;
            this.currentResearch.phases.push({
                phase: 'vendor',
                completedAt: new Date(),
                searchSources: analysis.searchData?.length || 0
            });

            this.setStepCompleted('step-vendor');
            
        } catch (error) {
            console.error('Vendor analysis failed:', error);
            throw new Error('Vendor analysis failed: ' + error.message);
        }
    }

    // Conduct hype cycle analysis
    async conductHypeCycleAnalysis(technology) {
        this.setActiveStep('step-strategic');
        
        try {
            const analysis = await this.callAPI('research', {
                technology: technology,
                researchPhase: 'hype',
                options: {
                    maxTokens: 2000,
                    temperature: 0.3
                }
            });

            this.currentResearch.analysis.hypeCycleData = analysis.analysis;
            this.currentResearch.phases.push({
                phase: 'hype',
                completedAt: new Date(),
                searchSources: analysis.searchData?.length || 0
            });

            this.setStepCompleted('step-strategic');
            
        } catch (error) {
            console.error('Hype cycle analysis failed:', error);
            throw new Error('Hype cycle analysis failed: ' + error.message);
        }
    }

    // Conduct strategic analysis
    async conductStrategicAnalysis(technology) {
        try {
            const analysis = await this.callAPI('research', {
                technology: technology,
                researchPhase: 'strategic',
                options: {
                    maxTokens: 3000,
                    temperature: 0.3
                }
            });

            this.currentResearch.analysis.strategicSummary = analysis.analysis;
            this.currentResearch.phases.push({
                phase: 'strategic',
                completedAt: new Date(),
                searchSources: analysis.searchData?.length || 0
            });
            
        } catch (error) {
            console.error('Strategic analysis failed:', error);
            throw new Error('Strategic analysis failed: ' + error.message);
        }
    }

    // Generate downloadable artifacts
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

    // Call backend API
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
                throw new Error(`API call failed: ${response.status}`);
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

    // Generate Executive Summary PDF
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

    // Generate Market Analysis PDF
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

    // Generate Hype Cycle Chart
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

    // Generate Vendor Landscape Chart
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
        
        // Sample vendor positions
        const vendors = [
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

    // Generate analysis data as JSON
    generateAnalysisData() {
        const data = {
            metadata: {
                id: this.currentResearch.id,
                technology: this.currentResearch.technology,
                timestamp: this.currentResearch.startTime.toISOString(),
                agent: 'Technology Research Agent',
                searchSources: Object.keys(this.currentResearch.searchData).length
            },
            analysis: this.currentResearch.analysis,
            searchData: this.currentResearch.searchData,
            phases: this.currentResearch.phases
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

    // Show research results
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

    // Update progress
    updateProgress(message, percentage) {
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressText) progressText.textContent = message;
        if (progressFill) progressFill.style.width = `${percentage}%`;
        
        if (this.progressCallback) {
            this.progressCallback(message, percentage);
        }
    }

    // Set step as active
    setActiveStep(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
            step.classList.add('active');
        }
    }

    // Set step as completed
    setStepCompleted(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }

    // Generate unique analysis ID
    generateAnalysisId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Handle errors
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

// Initialize the Technology Research Agent
window.technologyResearch = new TechnologyResearchAgent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnologyResearchAgent;
}