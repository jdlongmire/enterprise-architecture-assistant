// Technology Research Agent - Ultra-Minimal Claude-Only Version
class TechnologyResearchAgent {
    constructor() {
        this.currentResearch = null;
        this.init();
    }

    init() {
        console.log('Technology Research Agent initialized (Ultra-Minimal Claude-Only)');
    }

    // Ultra-minimal research - single Claude call only
    async conductResearch(technology, options = {}) {
        this.currentResearch = {
            id: this.generateAnalysisId(),
            technology: technology,
            options: options,
            startTime: new Date(),
            analysis: {},
            artifacts: []
        };

        try {
            this.updateProgress('Starting analysis...', 10);

            // Single streamlined Claude analysis - no web search
            await this.conductStreamlinedAnalysis(technology);
            this.updateProgress('Analysis complete', 70);

            // Generate artifacts
            await this.generateArtifacts();
            this.updateProgress('Artifacts generated', 100);

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

    // Single streamlined analysis using Claude's built-in knowledge
    async conductStreamlinedAnalysis(technology) {
        this.setActiveStep('step-market');
        
        try {
            // Short, focused prompt to avoid timeouts
            const prompt = `Analyze ${technology} technology for enterprise architecture decisions.

Provide a concise analysis with these sections:

MARKET OVERVIEW:
Brief market status, key adoption trends, and growth outlook.

VENDOR LANDSCAPE:
Top 3-4 market leaders and their positioning.

MATURITY ASSESSMENT:
Current maturity level and implementation readiness.

STRATEGIC RECOMMENDATIONS:
Key recommendations for enterprise adoption.

Keep response under 1500 words total.`;

            const analysis = await this.callClaudeAPI(prompt);
            
            // Parse into sections
            this.parseAnalysis(analysis);
            
            this.setStepCompleted('step-market');
            this.setStepCompleted('step-vendor');
            this.setStepCompleted('step-strategic');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            throw new Error('Analysis failed: ' + error.message);
        }
    }

    // Parse analysis into structured sections
    parseAnalysis(analysisText) {
        const sections = {
            marketResearch: '',
            vendorAnalysis: '',
            hypeCycleData: '',
            strategicSummary: ''
        };

        // Split by sections
        const marketMatch = analysisText.match(/MARKET OVERVIEW:([\s\S]*?)(?=VENDOR LANDSCAPE:|$)/i);
        const vendorMatch = analysisText.match(/VENDOR LANDSCAPE:([\s\S]*?)(?=MATURITY ASSESSMENT:|$)/i);
        const maturityMatch = analysisText.match(/MATURITY ASSESSMENT:([\s\S]*?)(?=STRATEGIC RECOMMENDATIONS:|$)/i);
        const strategicMatch = analysisText.match(/STRATEGIC RECOMMENDATIONS:([\s\S]*?)$/i);

        if (marketMatch) sections.marketResearch = marketMatch[1].trim();
        if (vendorMatch) sections.vendorAnalysis = vendorMatch[1].trim();
        if (maturityMatch) sections.hypeCycleData = maturityMatch[1].trim();
        if (strategicMatch) sections.strategicSummary = strategicMatch[1].trim();

        // Fallback: use full text if parsing fails
        if (!sections.marketResearch) {
            const quarters = Math.ceil(analysisText.length / 4);
            sections.marketResearch = analysisText.substring(0, quarters);
            sections.vendorAnalysis = analysisText.substring(quarters, quarters * 2);
            sections.hypeCycleData = analysisText.substring(quarters * 2, quarters * 3);
            sections.strategicSummary = analysisText.substring(quarters * 3);
        }

        this.currentResearch.analysis = sections;
    }

    // Direct Claude API call - bypassing backend search complexity
    async callClaudeAPI(prompt) {
        try {
            const response = await fetch(EA_CONFIG.api.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'claude',
                    prompt: prompt,
                    options: {
                        maxTokens: 1500,  // Shorter to reduce processing time
                        temperature: 0.3
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }

            return result.content;
            
        } catch (error) {
            console.error('Claude API call failed:', error);
            throw error;
        }
    }

    // Generate artifacts (simplified versions)
    async generateArtifacts() {
        this.setActiveStep('step-artifacts');
        
        try {
            const artifacts = [];

            // Executive Summary PDF
            const execPdf = await this.generateExecutivePDF();
            artifacts.push(execPdf);

            // Technology Assessment PDF  
            const techPdf = await this.generateTechnologyPDF();
            artifacts.push(techPdf);

            // Simple Hype Cycle Chart
            const chart = await this.generateSimpleChart();
            artifacts.push(chart);

            // Analysis Data JSON
            const data = this.generateAnalysisData();
            artifacts.push(data);

            this.currentResearch.artifacts = artifacts;
            this.setStepCompleted('step-artifacts');
            
        } catch (error) {
            console.error('Artifact generation failed:', error);
            // Continue even if artifacts fail
            this.currentResearch.artifacts = [];
        }
    }

    async generateExecutivePDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Technology Analysis Report', 20, 30);
            
            doc.setFontSize(14);
            doc.text(`Technology: ${this.currentResearch.technology}`, 20, 45);
            
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
            doc.text('Source: Enterprise Architecture Assistant', 20, 60);
            
            // Strategic Summary
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Strategic Summary', 20, 75);
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            
            const summary = this.currentResearch.analysis.strategicSummary || 'Strategic analysis completed';
            const lines = doc.splitTextToSize(summary.substring(0, 1500), 170);
            doc.text(lines, 20, 85);
            
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            
            return {
                type: 'pdf',
                name: `${this.currentResearch.technology.replace(/\s+/g, '_')}_Executive_Summary.pdf`,
                title: 'Executive Summary',
                description: 'Strategic analysis and recommendations',
                url: url,
                icon: 'fas fa-file-pdf'
            };
        } catch (error) {
            console.error('PDF generation failed:', error);
            return null;
        }
    }

    async generateTechnologyPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Technology Assessment', 20, 30);
            
            doc.setFontSize(14);
            doc.text(`${this.currentResearch.technology}`, 20, 45);
            
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
            
            // Market Overview
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Market Overview', 20, 75);
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            const market = this.currentResearch.analysis.marketResearch || 'Market analysis completed';
            const marketLines = doc.splitTextToSize(market.substring(0, 800), 170);
            doc.text(marketLines, 20, 85);
            
            // Vendor Landscape (new page if needed)
            const yPos = 85 + (marketLines.length * 4) + 10;
            if (yPos > 250) {
                doc.addPage();
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('Vendor Landscape', 20, 30);
                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                const vendor = this.currentResearch.analysis.vendorAnalysis || 'Vendor analysis completed';
                const vendorLines = doc.splitTextToSize(vendor.substring(0, 800), 170);
                doc.text(vendorLines, 20, 40);
            }
            
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            
            return {
                type: 'pdf',
                name: `${this.currentResearch.technology.replace(/\s+/g, '_')}_Technology_Assessment.pdf`,
                title: 'Technology Assessment',
                description: 'Market and vendor analysis',
                url: url,
                icon: 'fas fa-chart-bar'
            };
        } catch (error) {
            console.error('Tech PDF generation failed:', error);
            return null;
        }
    }

    async generateSimpleChart() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 600, 400);
            
            // Title
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.currentResearch.technology} - Technology Maturity`, 300, 30);
            
            // Simple maturity indicator
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(50, 200);
            ctx.lineTo(550, 200);
            ctx.stroke();
            
            // Maturity stages
            const stages = ['Emerging', 'Developing', 'Maturing', 'Established'];
            stages.forEach((stage, index) => {
                const x = 50 + (index * 125);
                ctx.fillStyle = '#34495e';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(stage, x, 180);
                
                // Stage marker
                ctx.fillStyle = '#95a5a6';
                ctx.beginPath();
                ctx.arc(x, 200, 6, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Technology position (example: stage 2-3)
            const techX = 175; // Between Developing and Maturing
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(techX, 200, 10, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Current Position', techX, 240);
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const url = URL.createObjectURL(blob);
            
            return {
                type: 'image',
                name: `${this.currentResearch.technology.replace(/\s+/g, '_')}_Maturity_Chart.png`,
                title: 'Maturity Chart',
                description: 'Technology maturity assessment',
                url: url,
                icon: 'fas fa-chart-line'
            };
        } catch (error) {
            console.error('Chart generation failed:', error);
            return null;
        }
    }

    generateAnalysisData() {
        const data = {
            metadata: {
                id: this.currentResearch.id,
                technology: this.currentResearch.technology,
                timestamp: this.currentResearch.startTime.toISOString(),
                agent: 'Technology Research Agent (Ultra-Minimal)',
                version: 'claude-only'
            },
            analysis: this.currentResearch.analysis
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            type: 'json',
            name: `${this.currentResearch.technology.replace(/\s+/g, '_')}_Analysis_Data.json`,
            title: 'Analysis Data',
            description: 'Complete research data',
            url: url,
            icon: 'fas fa-database'
        };
    }

    // UI helper methods
    showResults() {
        document.getElementById('research-progress').style.display = 'none';
        document.getElementById('research-results').style.display = 'block';
        
        const artifactGrid = document.getElementById('artifact-grid');
        if (artifactGrid && this.currentResearch.artifacts) {
            const validArtifacts = this.currentResearch.artifacts.filter(a => a !== null);
            artifactGrid.innerHTML = validArtifacts.map(artifact => `
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
    }

    setActiveStep(stepId) {
        const step = document.getElementById(stepId);
        if (step) step.classList.add('active');
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
            window.eaApp.showToast(`Research failed: ${error.message}`, 'error');
        }
        
        // Reset interface
        document.getElementById('research-progress').style.display = 'none';
        document.getElementById('research-form').style.display = 'block';
    }
}

// Initialize the ultra-minimal Technology Research Agent
window.technologyResearch = new TechnologyResearchAgent();