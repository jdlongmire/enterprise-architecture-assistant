// js/agents/supplier-quad-interface.js
// Magic Quadrant-style vendor positioning interface with Chart.js visualization

class SupplierQuadInterface {
    constructor() {
        this.currentAnalysis = null;
        this.magicQuadrantChart = null;
    }

    initializeInterface() {
        const modal = document.getElementById('agent-modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-th-large"></i> Supplier Quad Agent</h2>
                    <span class="close" onclick="closeModal()">&times;</span>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <!-- Input Section -->
                    <div class="input-section">
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">
                            <i class="fas fa-search"></i> Magic Quadrant Analysis
                        </h3>
                        <p style="color: #7f8c8d; margin-bottom: 20px; line-height: 1.6;">
                            Generate Gartner-style vendor positioning analysis with 12-factor weighted scoring across 
                            Ability to Execute and Completeness of Vision dimensions.
                        </p>
                        
                        <div class="input-form">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="technology-input" style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                                    Technology Area
                                </label>
                                <input 
                                    type="text" 
                                    id="technology-input" 
                                    placeholder="Enter technology (e.g., Zero Trust Security, AIOps, Data Mesh)"
                                    style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 1rem;"
                                    onkeypress="if(event.key==='Enter') this.startAnalysis()"
                                />
                            </div>
                            
                            <button 
                                id="start-analysis-btn"
                                onclick="supplierQuadInterface.startAnalysis()"
                                style="background: linear-gradient(45deg, #3498db, #2980b9); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; font-size: 1rem; transition: all 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(52,152,219,0.3)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                            >
                                <i class="fas fa-magic"></i> Generate Magic Quadrant Analysis
                            </button>
                        </div>
                    </div>

                    <!-- Progress Section -->
                    <div id="analysis-progress" style="display: none; margin-top: 30px;">
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; text-align: center;">
                            <div class="progress-spinner" style="margin-bottom: 15px;">
                                <i class="fas fa-chart-line fa-2x" style="color: #3498db; animation: pulse 2s infinite;"></i>
                            </div>
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Generating Magic Quadrant Analysis</h4>
                            <p style="color: #7f8c8d;">Analyzing vendor positioning across 12 evaluation criteria...</p>
                            <div class="progress-bar" style="width: 100%; height: 6px; background: #e1e8ed; border-radius: 3px; margin-top: 15px; overflow: hidden;">
                                <div class="progress-fill" style="height: 100%; background: linear-gradient(45deg, #3498db, #2980b9); width: 0%; transition: width 8s ease;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Results Section -->
                    <div id="analysis-results" style="display: none; margin-top: 30px;">
                        <!-- Results content will be populated here -->
                    </div>
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .quadrant-chart-container {
                    position: relative;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    margin: 20px 0;
                }
                
                .quadrant-labels {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 10;
                }
                
                .quadrant-label {
                    position: absolute;
                    font-weight: 600;
                    font-size: 14px;
                    color: #7f8c8d;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .quadrant-label.leaders {
                    top: 20px;
                    right: 20px;
                    color: #27ae60;
                }
                
                .quadrant-label.challengers {
                    top: 20px;
                    left: 20px;
                    color: #f39c12;
                }
                
                .quadrant-label.visionaries {
                    bottom: 20px;
                    right: 20px;
                    color: #9b59b6;
                }
                
                .quadrant-label.niche {
                    bottom: 20px;
                    left: 20px;
                    color: #95a5a6;
                }
                
                .vendor-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .vendor-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                }
                
                .vendor-card.leaders { border-left-color: #27ae60; }
                .vendor-card.challengers { border-left-color: #f39c12; }
                .vendor-card.visionaries { border-left-color: #9b59b6; }
                .vendor-card.niche { border-left-color: #95a5a6; }
            </style>
        `;
    }

    async startAnalysis() {
        const technologyInput = document.getElementById('technology-input');
        const technology = technologyInput.value.trim();
        
        if (!technology) {
            alert('Please enter a technology area to analyze.');
            return;
        }

        // Show progress
        const progressDiv = document.getElementById('analysis-progress');
        const resultsDiv = document.getElementById('analysis-results');
        const startBtn = document.getElementById('start-analysis-btn');
        
        progressDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        // Animate progress bar
        setTimeout(() => {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
        }, 100);

        try {
            const response = await fetch('/.netlify/functions/supplier-quad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ technology: technology })
            });

            const result = await response.json();

            // Hide progress
            progressDiv.style.display = 'none';
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Magic Quadrant Analysis';

            if (result.success) {
                this.currentAnalysis = result.data;
                this.displayResults(result.data);
            } else {
                this.displayError(result.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Supplier Quad analysis error:', error);
            progressDiv.style.display = 'none';
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Magic Quadrant Analysis';
            this.displayError('Failed to connect to analysis service. Please try again.');
        }
    }

    displayResults(data) {
        const resultsDiv = document.getElementById('analysis-results');
        
        resultsDiv.innerHTML = `
            <div class="analysis-success" style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                <i class="fas fa-check-circle"></i>
                <strong>Analysis Complete!</strong> Magic Quadrant positioning generated for ${data.metadata.technology}
                <span style="float: right; font-size: 0.9rem;">
                    <i class="fas fa-clock"></i> ${(data.metadata.executionTime/1000).toFixed(1)}s
                </span>
            </div>

            <!-- Magic Quadrant Chart -->
            <div class="chart-section">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">
                    <i class="fas fa-chart-scatter"></i> Magic Quadrant - ${data.metadata.technology}
                </h3>
                <div class="quadrant-chart-container">
                    <div class="quadrant-labels">
                        <div class="quadrant-label leaders">LEADERS</div>
                        <div class="quadrant-label challengers">CHALLENGERS</div>
                        <div class="quadrant-label visionaries">VISIONARIES</div>
                        <div class="quadrant-label niche">NICHE PLAYERS</div>
                    </div>
                    <canvas id="magic-quadrant-chart"></canvas>
                </div>
            </div>

            <!-- Vendor Summary -->
            <div class="vendor-summary-section">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">
                    <i class="fas fa-building"></i> Vendor Positioning Summary
                </h3>
                <div class="vendor-summary-grid">
                    ${this.generateVendorCards(data.vendors)}
                </div>
            </div>

            <!-- Key Insights -->
            <div class="insights-section" style="margin-top: 25px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">
                    <i class="fas fa-lightbulb"></i> Key Insights
                </h3>
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
                    <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                        ${data.webSummary.overview}
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        ${Object.entries(data.webSummary.quadrantDistribution).map(([quadrant, count]) => `
                            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; border: 2px solid #e1e8ed;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: ${this.getQuadrantColor(quadrant)};">${count}</div>
                                <div style="font-size: 0.9rem; color: #7f8c8d; text-transform: uppercase;">${quadrant}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Export Options -->
            <div class="export-section" style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e1e8ed;">
                <h4 style="color: #2c3e50; margin-bottom: 15px;">
                    <i class="fas fa-download"></i> Export Analysis
                </h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="supplierQuadInterface.downloadChart()" style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer;">
                        <i class="fas fa-chart-line"></i> Download Chart (PNG)
                    </button>
                    <button onclick="supplierQuadInterface.downloadData()" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer;">
                        <i class="fas fa-database"></i> Download Data (JSON)
                    </button>
                    <button onclick="supplierQuadInterface.generateReport()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer;">
                        <i class="fas fa-file-pdf"></i> Generate Report (PDF)
                    </button>
                </div>
            </div>
        `;

        resultsDiv.style.display = 'block';

        // Create the Magic Quadrant chart
        setTimeout(() => {
            this.createMagicQuadrantChart(data);
        }, 100);
    }

    createMagicQuadrantChart(data) {
        const ctx = document.getElementById('magic-quadrant-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.magicQuadrantChart) {
            this.magicQuadrantChart.destroy();
        }

        // Prepare vendor data for chart
        const chartData = data.vendors.map(vendor => ({
            x: vendor.completenessOfVision,
            y: vendor.abilityToExecute,
            label: vendor.name,
            quadrant: vendor.quadrant,
            backgroundColor: this.getQuadrantColor(vendor.quadrant),
            borderColor: this.getQuadrantColor(vendor.quadrant),
            pointRadius: 8,
            pointHoverRadius: 12
        }));

        this.magicQuadrantChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Vendors',
                    data: chartData,
                    backgroundColor: chartData.map(d => d.backgroundColor),
                    borderColor: chartData.map(d => d.borderColor),
                    pointRadius: chartData.map(d => d.pointRadius),
                    pointHoverRadius: chartData.map(d => d.pointHoverRadius),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            title: function(context) {
                                return context[0].raw.label;
                            },
                            label: function(context) {
                                return [
                                    `Quadrant: ${context.raw.quadrant}`,
                                    `Vision: ${context.raw.x.toFixed(1)}`,
                                    `Execution: ${context.raw.y.toFixed(1)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Completeness of Vision',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 100,
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 50) {
                                    return '#2c3e50';
                                }
                                return '#e1e8ed';
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 50) {
                                    return 2;
                                }
                                return 1;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ability to Execute',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 100,
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 50) {
                                    return '#2c3e50';
                                }
                                return '#e1e8ed';
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 50) {
                                    return 2;
                                }
                                return 1;
                            }
                        }
                    }
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                }
            }
        });
    }

    generateVendorCards(vendors) {
        return vendors.map(vendor => `
            <div class="vendor-card ${vendor.quadrant.toLowerCase().replace(' ', '')}">
                <h4 style="color: #2c3e50; margin-bottom: 8px; font-size: 1.1rem;">${vendor.name}</h4>
                <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 10px;">${vendor.quadrant}</div>
                <div style="display: flex; justify-content: between; font-size: 0.8rem;">
                    <span style="color: #34495e;">Vision: <strong>${vendor.completenessOfVision.toFixed(1)}</strong></span>
                    <span style="color: #34495e; margin-left: 15px;">Execute: <strong>${vendor.abilityToExecute.toFixed(1)}</strong></span>
                </div>
            </div>
        `).join('');
    }

    getQuadrantColor(quadrant) {
        const colors = {
            'Leaders': '#27ae60',
            'Challengers': '#f39c12', 
            'Visionaries': '#9b59b6',
            'Niche Players': '#95a5a6'
        };
        return colors[quadrant] || '#3498db';
    }

    displayError(error) {
        const resultsDiv = document.getElementById('analysis-results');
        resultsDiv.innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <h4>Analysis Failed</h4>
                <p>${error}</p>
                <button onclick="supplierQuadInterface.initializeInterface()" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 10px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }

    downloadChart() {
        if (this.magicQuadrantChart) {
            const link = document.createElement('a');
            link.download = `magic-quadrant-${this.currentAnalysis.metadata.technology.replace(/\s+/g, '-')}.png`;
            link.href = this.magicQuadrantChart.toBase64Image();
            link.click();
        }
    }

    downloadData() {
        if (this.currentAnalysis) {
            const dataStr = JSON.stringify(this.currentAnalysis, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.download = `supplier-quad-data-${this.currentAnalysis.metadata.technology.replace(/\s+/g, '-')}.json`;
            link.href = URL.createObjectURL(dataBlob);
            link.click();
        }
    }

    generateReport() {
        // This would generate a PDF report - simplified for now
        alert('PDF report generation will be implemented in the next update. Use PNG chart download for now.');
    }
}

// Initialize the interface
window.supplierQuadInterface = new SupplierQuadInterface();