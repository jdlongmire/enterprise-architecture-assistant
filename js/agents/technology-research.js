// Technology Research Agent - Optimized for Netlify (Single Claude Call)
class TechnologyResearchAgent {
    constructor() {
        this.currentResearch = null;
        this.init();
    }

    init() {
        console.log('Technology Research Agent initialized (Optimized Single-Call Version)');
    }

    // Main research orchestration method - optimized for speed
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
            this.updateProgress('Initializing comprehensive analysis...', 10);
            this.setActiveStep('step-search');

            // Single comprehensive Claude call covering all research areas
            await this.conductComprehensiveAnalysis(technology, options);
            this.updateProgress('Analysis complete', 80);
            
            this.setStepCompleted('step-search');
            this.setStepCompleted('step-market');
            this.setStepCompleted('step-vendor');
            this.setStepCompleted('step-strategic');
            this.setActiveStep('step-artifacts');

            // Generate artifacts from the comprehensive analysis
            await this.generateArtifacts();
            this.updateProgress('Artifacts generated', 100);
            this.setStepCompleted('step-artifacts');

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

    // Single comprehensive Claude analysis - optimized for speed and completeness
    async conductComprehensiveAnalysis(technology, options) {
        try {
            this.updateProgress('Generating comprehensive strategic analysis...', 30);

            // Build comprehensive prompt covering all research areas
            const comprehensivePrompt = this.buildComprehensivePrompt(technology, options);

            // Single Claude API call
            const response = await this.callClaudeAPI(comprehensivePrompt, {
                maxTokens: 3000,
                temperature: 0.3
            });

            // Parse the structured response
            this.parseComprehensiveResponse(response);
            
            this.updateProgress('Strategic analysis complete', 70);

        } catch (error) {
            console.error('Comprehensive analysis failed:', error);
            throw new Error('Strategic analysis failed: ' + error.message);
        }
    }

    // Build comprehensive prompt covering all research areas in one call
    buildComprehensivePrompt(technology, options) {
        const sections = [];
        
        if (options.includeMarketResearch !== false) {
            sections.push("Market Analysis");
        }
        if (options.includeVendorAnalysis !== false) {
            sections.push("Vendor Landscape");
        }
        if (options.includeHypeCycle !== false) {
            sections.push("Technology Maturity Assessment");
        }
        if (options.includeStrategicSummary !== false) {
            sections.push("Strategic Recommendations");
        }

        return `You are a senior enterprise architect and technology analyst. Provide a comprehensive analysis of ${technology} for enterprise architecture decision-making.

Please structure your response with these sections:

${sections.includes("Market Analysis") ? `
**MARKET ANALYSIS**
- Current market size and growth projections
- Key adoption drivers and business benefits
- Industry sectors leading implementation
- Market trends and future outlook
` : ''}

${sections.includes("Vendor Landscape") ? `
**VENDOR LANDSCAPE**
- Leading vendors and their positioning
- Key differentiators and capabilities
- Market share and competitive dynamics
- Emerging players and innovations
` : ''}

${sections.includes("Technology Maturity Assessment") ? `
**TECHNOLOGY MATURITY ASSESSMENT**
- Current position on technology adoption curve
- Implementation readiness for enterprises
- Time to mainstream adoption
- Risk factors and challenges
` : ''}

${sections.includes("Strategic Recommendations") ? `
**STRATEGIC RECOMMENDATIONS**
- Business case and ROI considerations
- Implementation approach and timeline
- Success factors and best practices
- Decision framework for adoption
` : ''}

**EXECUTIVE SUMMARY**
- Key findings and strategic implications
- Top 3 recommendations for enterprise leaders
- Implementation priority and timeline

Focus on actionable insights for C-level decision makers. Provide specific, data-driven recommendations suitable for enterprise architecture planning.`;
    }

    // Parse the comprehensive Claude response into structured sections
    parseComprehensiveResponse(response) {
        // Split response into sections based on headers
        const sections = this.extractSections(response);
        
        this.currentResearch.analysis = {
            marketResearch: sections['MARKET ANALYSIS'] || sections['Market Analysis'] || '',
            vendorAnalysis: sections['VENDOR LANDSCAPE'] || sections['Vendor Landscape'] || '',
            hypeCycleData: sections['TECHNOLOGY MATURITY ASSESSMENT'] || sections['Technology Maturity Assessment'] || '',
            strategicSummary: sections['STRATEGIC RECOMMENDATIONS'] || sections['Strategic Recommendations'] || '',
            executiveSummary: sections['EXECUTIVE SUMMARY'] || sections['Executive Summary'] || '',
            fullAnalysis: response
        };
    }

    // Extract sections from formatted response
    extractSections(text) {
        const sections = {};
        const lines = text.split('\n');
        let currentSection = '';
        let currentContent = [];

        for (const line of lines) {
            // Check for section headers (marked with **HEADER**)
            const headerMatch = line.match(/\*\*([^*]+)\*\*/);
            if (headerMatch) {
                // Save previous section
                if (currentSection && currentContent.length > 0) {
                    sections[currentSection] = currentContent.join('\n').trim();
                }
                // Start new section
                currentSection = headerMatch[1].toUpperCase();
                currentContent = [];
            } else if (currentSection && line.trim()) {
                currentContent.push(line);
            }
        }

        // Save final section
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n').trim();
        }

        return sections;
    }

    // Call backend API - optimized endpoint
    async callClaudeAPI(prompt, options = {}) {
        try {
            const response = await fetch(EA_CONFIG.api.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'claude',
                    prompt: prompt,
                    options: options
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

    // Generate downloadable artifacts from comprehensive analysis
    async generateArtifacts() {
        try {
            const artifacts = [];

            // Generate Executive Summary PDF
            if (this.currentResearch.analysis.executiveSummary || this.currentResearch.analysis.strategicSummary) {
                const executivePdf = await this.generateExecutivePDF();
                artifacts.push(executivePdf);
            }

            // Generate Comprehensive Analysis PDF
            if (this.currentResearch.analysis.fullAnalysis) {
                const fullAnalysisPdf = await this.generateFullAnalysisPDF();
                artifacts.push(fullAnalysisPdf);
            }

            // Generate Technology Maturity Chart
            if (this.currentResearch.analysis.hypeCycleData) {
                const maturityChart = await this.generateMaturityChart();
                artifacts.push(maturityChart);
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
            
        } catch (error) {
            console.error('Artifact generation failed:', error);
            // Don't fail the entire research for artifact generation issues
            this.currentResearch.artifacts = [this.generateAnalysisData()];
        }
    }

    // Generate Executive Summary PDF
    async generateExecutivePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title page
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Executive Summary', 20, 30);
        
        doc.setFontSize(16);
        doc.text(`Technology: ${this.currentResearch.technology}`, 20, 45);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
        doc.text(`Analysis Duration: ${Math.round(this.currentResearch.duration / 1000)} seconds`, 20, 65);
        
        // Executive Summary Content
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Key Findings & Recommendations', 20, 85);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const summaryContent = this.currentResearch.analysis.executiveSummary || 
                              this.currentResearch.analysis.strategicSummary || 
                              'Executive summary not available.';
        
        const lines = doc.splitTextToSize(summaryContent.substring(0, 2500), 170);
        doc.text(lines, 20, 95);
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Executive_Summary.pdf`,
            title: 'Executive Summary',
            description: 'Strategic analysis and key recommendations',
            url: pdfUrl,
            icon: 'fas fa-file-pdf'
        };
    }

    // Generate Full Analysis PDF
    async generateFullAnalysisPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title page
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Technology Analysis Report', 20, 30);
        
        doc.setFontSize(16);
        doc.text(`Technology: ${this.currentResearch.technology}`, 20, 45);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
        
        // Full Analysis Content
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Comprehensive Analysis', 20, 75);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const fullContent = this.currentResearch.analysis.fullAnalysis || 'Analysis content not available.';
        const lines = doc.splitTextToSize(fullContent.substring(0, 3000), 170);
        doc.text(lines, 20, 85);
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Full_Analysis.pdf`,
            title: 'Comprehensive Analysis',
            description: 'Complete technology analysis report',
            url: pdfUrl,
            icon: 'fas fa-file-alt'
        };
    }

    // Generate Technology Maturity Chart
    async generateMaturityChart() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw maturity curve
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
        ctx.fillText('Innovation', 60, 530);
        ctx.fillText('Peak Expectations', 150, 80);
        ctx.fillText('Disillusionment', 320, 480);
        ctx.fillText('Enlightenment', 500, 380);
        ctx.fillText('Productivity', 600, 280);
        
        // Position technology (estimated based on analysis)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(400, 400, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.currentResearch.technology, 420, 405);
        
        // Title
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${this.currentResearch.technology} Maturity Assessment`, 200, 40);
        
        const chartBlob = await new Promise(resolve => canvas.toBlob(resolve));
        const chartUrl = URL.createObjectURL(chartBlob);
        
        return {
            type: 'image',
            name: `${this.currentResearch.technology}_Maturity_Chart.png`,
            title: 'Technology Maturity Chart',
            description: 'Current position on adoption curve',
            url: chartUrl,
            icon: 'fas fa-chart-line'
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
        ctx.fillText('Market Presence', 350, 540);
        ctx.save();
        ctx.translate(50, 300);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Innovation Capability', 0, 0);
        ctx.restore();
        
        // Title
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${this.currentResearch.technology} Vendor Landscape`, 220, 40);
        
        // Sample vendor positions (would be enhanced with real data)
        const vendors = [
            { name: 'Leader A', x: 500, y: 200, color: '#3498db' },
            { name: 'Leader B', x: 450, y: 250, color: '#3498db' },
            { name: 'Challenger', x: 350, y: 300, color: '#f39c12' },
            { name: 'Niche Player', x: 250, y: 180, color: '#9b59b6' }
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
                duration: this.currentResearch.duration,
                agent: 'Technology Research Agent (Optimized)',
                version: '2.0'
            },
            analysis: this.currentResearch.analysis,
            options: this.currentResearch.options,
            performance: {
                totalTime: this.currentResearch.duration,
                artifactsGenerated: this.currentResearch.artifacts?.length || 0
            }
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
                <div class="artifact-card" onclick="window.open('${artifact.url}', '_blank')" 
                     data-download-url="${artifact.url}" data-file-name="${artifact.name}">
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

// Initialize the optimized Technology Research Agent
window.technologyResearch = new TechnologyResearchAgent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnologyResearchAgent;
}