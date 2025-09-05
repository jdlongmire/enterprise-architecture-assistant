// FILE PATH: js/agents/technology-research.js
// Technology Research Orchestrator - Production System
// Coordinates all 4 EA analysis modules with web summary and artifacts

class TechnologyResearchOrchestrator {
    constructor() {
        this.currentResearch = null;
        this.analysisModules = [
            { 
                name: 'market-analysis', 
                title: 'Market Analysis', 
                step: 'step-market',
                expectedTime: 5.3,
                description: 'Analyzing market trends and growth'
            },
            { 
                name: 'vendor-analysis', 
                title: 'Vendor Analysis', 
                step: 'step-vendor',
                expectedTime: 7.7,
                description: 'Evaluating vendor landscape and positioning'
            },
            { 
                name: 'maturity-assessment', 
                title: 'Maturity Assessment', 
                step: 'step-maturity',
                expectedTime: 4.9,
                description: 'Assessing technology maturity and hype cycle'
            },
            { 
                name: '5-year-forecast', 
                title: '5-Year Forecast', 
                step: 'step-forecast',
                expectedTime: 8.7,
                description: 'Developing strategic forecast and roadmap'
            }
        ];
        this.totalExpectedTime = 26.6; // Sum of all module times
        this.currentModuleIndex = 0;
        this.startTime = null;
        
        console.log('Technology Research Orchestrator initialized (Production v2.0)');
    }

    // Main orchestration method
    async conductResearch(technology, options = {}) {
        try {
            this.startTime = Date.now();
            this.currentModuleIndex = 0;
            
            // Initialize research object
            this.currentResearch = {
                technology: technology,
                startTime: new Date(),
                options: options,
                modules: {},
                aggregatedData: {},
                status: 'in-progress',
                totalTime: 0
            };

            // Update UI
            this.initializeProgress();
            this.showProgress();

            // Execute all modules sequentially
            for (let i = 0; i < this.analysisModules.length; i++) {
                this.currentModuleIndex = i;
                const module = this.analysisModules[i];
                
                await this.executeModule(module, technology);
                this.updateProgress();
            }

            // Aggregate results and generate artifacts
            await this.aggregateResults();
            await this.generateArtifacts();
            
            this.currentResearch.status = 'completed';
            this.currentResearch.totalTime = Date.now() - this.startTime;
            
            this.showResults();
            console.log(`Research completed in ${this.currentResearch.totalTime}ms`);
            
        } catch (error) {
            console.error('Research failed:', error);
            this.currentResearch.status = 'failed';
            this.showError(error.message);
            throw error;
        }
    }

    // Execute individual analysis module
    async executeModule(module, technology) {
        const stepElement = document.getElementById(module.step);
        if (stepElement) {
            stepElement.className = 'progress-step active';
            stepElement.querySelector('.step-title').textContent = module.description;
        }

        try {
            const moduleStartTime = Date.now();
            
            // Prepare request body based on module type
            let requestBody;
            if (module.name === 'vendor-technology-analysis') {
                // Vendor-specific analysis requires both vendor and technology
                const vendor = this.currentResearch.vendor || 'Leading Vendor';
                requestBody = JSON.stringify({ 
                    vendor: vendor, 
                    technology: technology 
                });
            } else {
                // Standard modules only need technology
                requestBody = JSON.stringify({ technology: technology });
            }
            
            const response = await fetch(`/.netlify/functions/${module.name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            });

            if (!response.ok) {
                throw new Error(`${module.title} failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || `${module.title} failed`);
            }

            const moduleTime = Date.now() - moduleStartTime;
            
            // Store module result
            this.currentResearch.modules[module.name] = {
                ...result,
                executionTime: moduleTime,
                completedAt: new Date()
            };

            // Update UI
            if (stepElement) {
                stepElement.className = 'progress-step completed';
                stepElement.querySelector('.step-time').textContent = `${(moduleTime/1000).toFixed(1)}s`;
            }

            console.log(`${module.title} completed in ${moduleTime}ms`);
            
        } catch (error) {
            console.error(`${module.title} failed:`, error);
            
            if (stepElement) {
                stepElement.className = 'progress-step error';
                stepElement.querySelector('.step-title').textContent = `${module.title} failed`;
            }
            
            throw new Error(`${module.title}: ${error.message}`);
        }
    }

    // Aggregate results from all modules
    async aggregateResults() {
        const modules = this.currentResearch.modules;
        
        // Combine all analysis data
        this.currentResearch.aggregatedData = {
            executiveSummary: this.generateExecutiveSummary(modules),
            keyMetrics: this.aggregateKeyMetrics(modules),
            strategicInsights: this.extractStrategicInsights(modules),
            implementationGuidance: this.compileImplementationGuidance(modules),
            charts: this.aggregateChartData(modules),
            timeline: this.buildImplementationTimeline(modules)
        };
    }

    // Generate executive summary from all modules
    generateExecutiveSummary(modules) {
        const technology = this.currentResearch.technology;
        
        const marketData = modules['market-analysis']?.data;
        const vendorData = modules['vendor-analysis']?.data;
        const maturityData = modules['maturity-assessment']?.data;
        const forecastData = modules['5-year-forecast']?.data;

        return {
            title: `${technology} Strategic Analysis`,
            overview: `Comprehensive enterprise architecture analysis of ${technology} technology covering market landscape, vendor ecosystem, technology maturity, and 5-year strategic forecast.`,
            keyFindings: [
                marketData?.summary || 'Market analysis completed',
                vendorData?.summary || 'Vendor analysis completed', 
                maturityData?.summary || 'Maturity assessment completed',
                forecastData?.summary || 'Strategic forecast completed'
            ],
            recommendations: this.generateTopRecommendations(modules),
            timeframe: this.extractImplementationTimeframe(modules)
        };
    }

    // Aggregate key metrics from all modules
    aggregateKeyMetrics(modules) {
        const metrics = {};
        
        // Market metrics
        if (modules['market-analysis']?.data?.metrics) {
            Object.assign(metrics, modules['market-analysis'].data.metrics);
        }
        
        // Maturity metrics
        if (modules['maturity-assessment']?.data?.maturityMetrics) {
            Object.assign(metrics, modules['maturity-assessment'].data.maturityMetrics);
        }
        
        // Vendor count
        if (modules['vendor-analysis']?.data?.vendors) {
            metrics.vendorCount = modules['vendor-analysis'].data.vendors.length;
        }

        return metrics;
    }

    // Extract strategic insights
    extractStrategicInsights(modules) {
        const insights = [];
        
        Object.keys(modules).forEach(moduleName => {
            const moduleData = modules[moduleName].data;
            if (moduleData.summary) {
                insights.push({
                    module: moduleName,
                    insight: moduleData.summary
                });
            }
        });
        
        return insights;
    }

    // Compile implementation guidance
    compileImplementationGuidance(modules) {
        const guidance = {
            readiness: 'Moderate',
            timeline: '12-18 months',
            priorities: [],
            risks: []
        };
        
        // Extract readiness from maturity assessment
        if (modules['maturity-assessment']?.data?.maturityMetrics?.enterpriseReadiness) {
            guidance.readiness = modules['maturity-assessment'].data.maturityMetrics.enterpriseReadiness;
        }
        
        // Extract timeline from forecast
        if (modules['5-year-forecast']?.data?.timeline) {
            const timeline = modules['5-year-forecast'].data.timeline;
            if (timeline.year1) {
                guidance.timeline = 'Year 1: ' + timeline.year1.substring(0, 100) + '...';
            }
        }
        
        return guidance;
    }

    // Aggregate chart data from all modules
    aggregateChartData(modules) {
        const charts = [];
        
        Object.keys(modules).forEach(moduleName => {
            const chartData = modules[moduleName].data?.chartData;
            if (chartData) {
                charts.push({
                    module: moduleName,
                    ...chartData
                });
            }
        });
        
        return charts;
    }

    // Build implementation timeline
    buildImplementationTimeline(modules) {
        const timeline = {
            phases: [
                { phase: 'Assessment', duration: '1-2 months', description: 'Evaluate current state and readiness' },
                { phase: 'Planning', duration: '2-3 months', description: 'Develop implementation strategy' },
                { phase: 'Pilot', duration: '3-6 months', description: 'Deploy pilot implementation' },
                { phase: 'Scaling', duration: '6-12 months', description: 'Scale across organization' },
                { phase: 'Optimization', duration: 'Ongoing', description: 'Continuous improvement' }
            ],
            totalDuration: '12-24 months'
        };
        
        // Enhance with forecast data if available
        if (modules['5-year-forecast']?.data?.timeline) {
            const forecastTimeline = modules['5-year-forecast'].data.timeline;
            if (forecastTimeline.milestones && forecastTimeline.milestones.length > 0) {
                timeline.strategicMilestones = forecastTimeline.milestones;
            }
        }
        
        return timeline;
    }

    // Generate artifacts (PDFs, charts, JSON)
    async generateArtifacts() {
        const artifacts = [];
        
        try {
            // Generate Executive Summary PDF
            const execSummaryPDF = await this.generateExecutiveSummaryPDF();
            artifacts.push(execSummaryPDF);
            
            // Generate Detailed Analysis PDF
            const detailedPDF = await this.generateDetailedAnalysisPDF();
            artifacts.push(detailedPDF);
            
            // Generate Charts
            const chartArtifacts = await this.generateChartArtifacts();
            artifacts.push(...chartArtifacts);
            
            // Generate Data Export
            const dataExport = this.generateDataExport();
            artifacts.push(dataExport);
            
            this.currentResearch.artifacts = artifacts;
            
        } catch (error) {
            console.error('Artifact generation failed:', error);
            throw error;
        }
    }

    // Generate Executive Summary PDF (2-3 pages)
    async generateExecutiveSummaryPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const lineHeight = 8;
        let yPosition = 30;

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Executive Summary', margin, yPosition);
        
        yPosition += 15;
        doc.setFontSize(16);
        doc.text(`${this.currentResearch.technology} Strategic Analysis`, margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
        
        yPosition += 20;

        // Executive Overview
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Strategic Overview', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const overview = this.currentResearch.aggregatedData.executiveSummary.overview;
        const overviewLines = doc.splitTextToSize(overview, pageWidth - 2 * margin);
        doc.text(overviewLines, margin, yPosition);
        yPosition += overviewLines.length * lineHeight + 10;

        // Key Metrics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Key Metrics', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const metrics = this.currentResearch.aggregatedData.keyMetrics;
        Object.keys(metrics).forEach(key => {
            if (metrics[key]) {
                doc.text(`• ${key}: ${metrics[key]}`, margin + 5, yPosition);
                yPosition += lineHeight;
            }
        });
        yPosition += 10;

        // Strategic Recommendations
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Strategic Recommendations', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const recommendations = this.currentResearch.aggregatedData.executiveSummary.recommendations || [
            'Proceed with pilot implementation in Q2',
            'Evaluate top 3 vendors for detailed assessment',
            'Plan 18-month implementation timeline',
            'Allocate budget for training and integration'
        ];
        
        recommendations.forEach(rec => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;
            }
            doc.text(`• ${rec}`, margin + 5, yPosition);
            yPosition += lineHeight + 2;
        });

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Executive_Summary.pdf`,
            title: 'Executive Summary',
            description: 'Strategic overview and key recommendations (2-3 pages)',
            url: url,
            icon: 'fas fa-file-pdf'
        };
    }

    // Generate Detailed Analysis PDF (5-6 pages)
    async generateDetailedAnalysisPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const lineHeight = 7;
        let yPosition = 30;

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Detailed Technology Analysis', margin, yPosition);
        
        yPosition += 15;
        doc.setFontSize(16);
        doc.text(`${this.currentResearch.technology}`, margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
        
        yPosition += 20;

        // Add content from each module
        const modules = this.currentResearch.modules;
        
        Object.keys(modules).forEach(moduleName => {
            const moduleData = modules[moduleName];
            
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            // Module title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(moduleData.data.technology + ' - ' + moduleName.replace('-', ' ').toUpperCase(), margin, yPosition);
            yPosition += 10;
            
            // Module content
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            const analysisText = moduleData.data.analysis.substring(0, 1500) + '...';
            const analysisLines = doc.splitTextToSize(analysisText, pageWidth - 2 * margin);
            
            analysisLines.forEach(line => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 30;
                }
                doc.text(line, margin, yPosition);
                yPosition += lineHeight;
            });
            
            yPosition += 15;
        });

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        
        return {
            type: 'pdf',
            name: `${this.currentResearch.technology}_Detailed_Analysis.pdf`,
            title: 'Detailed Analysis',
            description: 'Comprehensive analysis report (5-6 pages)',
            url: url,
            icon: 'fas fa-file-pdf'
        };
    }

    // Generate chart artifacts
    async generateChartArtifacts() {
        const chartArtifacts = [];
        const charts = this.currentResearch.aggregatedData.charts;
        
        for (const chart of charts) {
            try {
                const chartUrl = await this.generateChartImage(chart);
                chartArtifacts.push({
                    type: 'image',
                    name: `${this.currentResearch.technology}_${chart.type}.png`,
                    title: chart.title,
                    description: `${chart.module} visualization`,
                    url: chartUrl,
                    icon: 'fas fa-chart-bar'
                });
            } catch (error) {
                console.error(`Chart generation failed for ${chart.type}:`, error);
            }
        }
        
        return chartArtifacts;
    }

    // Generate chart image
    async generateChartImage(chartData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            // Simple chart rendering based on type
            if (chartData.type === 'vendor-positioning') {
                this.renderVendorPositioningChart(ctx, chartData);
            } else if (chartData.type === 'hype-cycle') {
                this.renderHypeCycleChart(ctx, chartData);
            } else if (chartData.type === 'forecast-timeline') {
                this.renderForecastChart(ctx, chartData);
            } else {
                this.renderGenericChart(ctx, chartData);
            }
            
            canvas.toBlob(resolve);
        }).then(blob => URL.createObjectURL(blob));
    }

    // Render vendor positioning chart
    renderVendorPositioningChart(ctx, chartData) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 160, 100);
            ctx.lineTo(i * 160, 500);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(80, 100 + i * 80);
            ctx.lineTo(720, 100 + i * 80);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 500);
        ctx.lineTo(720, 500);
        ctx.moveTo(80, 100);
        ctx.lineTo(80, 500);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.fillText('Completeness of Vision', 300, 550);
        ctx.save();
        ctx.translate(30, 300);
        ctx.rotate(-Math.PI/2);
        ctx.fillText('Ability to Execute', 0, 0);
        ctx.restore();
        
        // Quadrant labels
        ctx.font = '12px Arial';
        ctx.fillText('Leaders', 580, 150);
        ctx.fillText('Challengers', 120, 150);
        ctx.fillText('Visionaries', 580, 450);
        ctx.fillText('Niche Players', 120, 450);
        
        // Plot vendors (sample positions)
        if (chartData.data && chartData.data.datasets[0]) {
            ctx.fillStyle = '#3498db';
            chartData.data.datasets[0].data.forEach((point, index) => {
                const x = 80 + (point.x / 100) * 640;
                const y = 500 - (point.y / 100) * 400;
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = '#333333';
                ctx.font = '10px Arial';
                ctx.fillText(point.vendor || `Vendor ${index + 1}`, x + 10, y + 3);
                ctx.fillStyle = '#3498db';
            });
        }
        
        // Title
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(chartData.title || 'Vendor Positioning', 250, 40);
    }

    // Render hype cycle chart
    renderHypeCycleChart(ctx, chartData) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Hype cycle curve
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 500);
        ctx.quadraticCurveTo(200, 100, 350, 450);
        ctx.quadraticCurveTo(550, 350, 750, 300);
        ctx.stroke();
        
        // Phase labels
        ctx.fillStyle = '#333333';
        ctx.font = '11px Arial';
        ctx.fillText('Innovation\nTrigger', 60, 530);
        ctx.fillText('Peak of\nExpectations', 150, 80);
        ctx.fillText('Trough of\nDisillusionment', 300, 480);
        ctx.fillText('Slope of\nEnlightenment', 500, 380);
        ctx.fillText('Plateau of\nProductivity', 600, 280);
        
        // Technology position
        if (chartData.data && chartData.data.technologyPosition) {
            const pos = chartData.data.technologyPosition;
            const x = (pos.x / 100) * 700 + 50;
            const y = 500 - (pos.y / 100) * 400;
            
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(pos.label || 'Technology', x + 15, y + 4);
        }
        
        // Title
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(chartData.title || 'Technology Hype Cycle', 250, 40);
    }

    // Render forecast timeline chart
    renderForecastChart(ctx, chartData) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Simple timeline chart implementation
        const years = ['2024', '2025', '2026', '2027', '2028'];
        const data = [30, 45, 65, 80, 90]; // Sample progression
        
        // Grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(100 + i * 120, 100);
            ctx.lineTo(100 + i * 120, 450);
            ctx.stroke();
        }
        
        // Data line
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 450 - data[0] * 3);
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(100 + i * 120, 450 - data[i] * 3);
        }
        ctx.stroke();
        
        // Data points
        ctx.fillStyle = '#3498db';
        data.forEach((value, index) => {
            ctx.beginPath();
            ctx.arc(100 + index * 120, 450 - value * 3, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Labels
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        years.forEach((year, index) => {
            ctx.fillText(year, 90 + index * 120, 480);
        });
        
        // Title
        ctx.font = 'bold 16px Arial';
        ctx.fillText(chartData.title || '5-Year Forecast', 250, 40);
    }

    // Render generic chart
    renderGenericChart(ctx, chartData) {
        // Simple bar chart as fallback
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(chartData.title || 'Analysis Chart', 250, 40);
        
        ctx.fillStyle = '#3498db';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(100 + i * 120, 200 + i * 30, 80, 200 - i * 30);
        }
    }

    // Generate data export
    generateDataExport() {
        const exportData = {
            technology: this.currentResearch.technology,
            generatedAt: new Date().toISOString(),
            totalAnalysisTime: this.currentResearch.totalTime,
            modules: this.currentResearch.modules,
            aggregatedData: this.currentResearch.aggregatedData,
            metadata: {
                version: '2.0',
                moduleCount: this.analysisModules.length,
                systemPerformance: {
                    totalTime: this.currentResearch.totalTime,
                    averageModuleTime: this.currentResearch.totalTime / this.analysisModules.length
                }
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            type: 'json',
            name: `${this.currentResearch.technology}_Analysis_Data.json`,
            title: 'Complete Analysis Data',
            description: 'Raw analysis data and metadata (JSON)',
            url: url,
            icon: 'fas fa-database'
        };
    }

    // Helper methods for recommendations and timeline
    generateTopRecommendations(modules) {
        const recommendations = [
            'Evaluate current organizational readiness for technology adoption',
            'Conduct pilot program with leading vendor solution',
            'Develop comprehensive training and change management plan',
            'Establish timeline for phased implementation approach',
            'Allocate appropriate budget for technology and integration costs'
        ];
        
        // Enhance based on maturity assessment
        if (modules['maturity-assessment']?.data?.hypeCyclePosition?.position) {
            const position = modules['maturity-assessment'].data.hypeCyclePosition.position;
            if (position.includes('Slope') || position.includes('Plateau')) {
                recommendations.unshift('Technology is mature - proceed with confidence');
            } else if (position.includes('Trough')) {
                recommendations.unshift('Technology emerging from hype - good timing for adoption');
            }
        }
        
        return recommendations.slice(0, 5);
    }

    extractImplementationTimeframe(modules) {
        // Default timeframe
        let timeframe = '12-18 months';
        
        // Check maturity assessment for timing insights
        if (modules['maturity-assessment']?.data?.maturityMetrics?.timeToMainstream) {
            timeframe = modules['maturity-assessment'].data.maturityMetrics.timeToMainstream;
        }
        
        return timeframe;
    }

    // UI Methods
    initializeProgress() {
        const progressContainer = document.getElementById('research-progress');
        if (!progressContainer) return;
        
        progressContainer.innerHTML = `
            <div class="progress-header">
                <h3>Enterprise Architecture Analysis</h3>
                <div class="progress-summary">
                    <span>Technology: <strong>${this.currentResearch.technology}</strong></span>
                    <span>Modules: ${this.analysisModules.length}</span>
                    <span>Est. Time: ~${Math.round(this.totalExpectedTime)}s</span>
                </div>
            </div>
            <div class="progress-steps">
                ${this.analysisModules.map((module, index) => `
                    <div class="progress-step" id="${module.step}">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-title">${module.title}</div>
                            <div class="step-description">${module.description}</div>
                            <div class="step-time">~${module.expectedTime}s</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-text" id="progress-text">Starting analysis...</div>
            </div>
        `;
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const progress = ((this.currentModuleIndex + 1) / this.analysisModules.length) * 100;
            progressFill.style.width = `${progress}%`;
            
            if (this.currentModuleIndex < this.analysisModules.length - 1) {
                const nextModule = this.analysisModules[this.currentModuleIndex + 1];
                progressText.textContent = `Next: ${nextModule.title}`;
            } else {
                progressText.textContent = 'Generating artifacts...';
            }
        }
    }

    showProgress() {
        const progressContainer = document.getElementById('research-progress');
        const resultsContainer = document.getElementById('research-results');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (resultsContainer) resultsContainer.style.display = 'none';
    }

    showResults() {
        const progressContainer = document.getElementById('research-progress');
        const resultsContainer = document.getElementById('research-results');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            this.renderWebSummary();
        }
    }

    showError(errorMessage) {
        const progressContainer = document.getElementById('research-progress');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Analysis Failed</h3>
                    <p>${errorMessage}</p>
                    <button onclick="location.reload()" class="retry-button">Try Again</button>
                </div>
            `;
        }
    }

    // Render web summary view
    renderWebSummary() {
        const resultsContainer = document.getElementById('research-results');
        if (!resultsContainer) return;

        const summary = this.currentResearch.aggregatedData.executiveSummary;
        const metrics = this.currentResearch.aggregatedData.keyMetrics;
        const artifacts = this.currentResearch.artifacts || [];

        resultsContainer.innerHTML = `
            <div class="web-summary">
                <div class="summary-header">
                    <h2>${summary.title}</h2>
                    <div class="summary-meta">
                        <span><i class="fas fa-clock"></i> Completed in ${(this.currentResearch.totalTime/1000).toFixed(1)}s</span>
                        <span><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}</span>
                        <span><i class="fas fa-cogs"></i> ${this.analysisModules.length} modules</span>
                    </div>
                </div>

                <div class="summary-content">
                    <div class="executive-overview">
                        <h3>Executive Overview</h3>
                        <p>${summary.overview}</p>
                    </div>

                    <div class="key-metrics-grid">
                        <h3>Key Metrics</h3>
                        <div class="metrics-cards">
                            ${Object.keys(metrics).map(key => metrics[key] ? `
                                <div class="metric-card">
                                    <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <div class="metric-value">${metrics[key]}</div>
                                </div>
                            ` : '').join('')}
                        </div>
                    </div>

                    <div class="strategic-recommendations">
                        <h3>Strategic Recommendations</h3>
                        <ul>
                            ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="module-results">
                        <h3>Analysis Modules</h3>
                        ${this.analysisModules.map(module => {
                            const moduleData = this.currentResearch.modules[module.name];
                            return `
                                <div class="module-result-card">
                                    <div class="module-header">
                                        <h4>${module.title}</h4>
                                        <span class="module-time">${(moduleData?.executionTime/1000 || 0).toFixed(1)}s</span>
                                    </div>
                                    <div class="module-summary">
                                        ${moduleData?.data?.summary || 'Analysis completed successfully'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="artifacts-section">
                    <h3>Download Artifacts</h3>
                    <div class="artifacts-grid">
                        ${artifacts.map(artifact => `
                            <div class="artifact-card">
                                <div class="artifact-icon">
                                    <i class="${artifact.icon}"></i>
                                </div>
                                <div class="artifact-info">
                                    <h4>${artifact.title}</h4>
                                    <p>${artifact.description}</p>
                                </div>
                                <a href="${artifact.url}" download="${artifact.name}" class="download-btn">
                                    <i class="fas fa-download"></i> Download
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize orchestrator
const technologyResearch = new TechnologyResearchOrchestrator();

// Export for use by interface
window.technologyResearch = technologyResearch;