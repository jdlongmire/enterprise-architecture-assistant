// FILE PATH: js/agents/technology-research-interface.js
// Technology Research Interface - Production UI
// Provides the user interface for the EA analysis orchestrator

class TechnologyResearchInterface {
    constructor() {
        this.isResearchActive = false;
        this.currentTechnology = null;
        
        console.log('Technology Research Interface initialized (Production v2.0)');
        this.initializeInterface();
    }

    // Initialize the complete interface
    initializeInterface() {
        const agentModal = document.getElementById('agent-modal');
        if (!agentModal) return;

        agentModal.innerHTML = `
            <div class="modal-content research-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-search"></i> Technology Research Agent</h2>
                    <span class="close" onclick="closeModal()">&times;</span>
                </div>
                
                <div class="research-interface">
                    <div class="input-section" id="input-section">
                        ${this.renderInputForm()}
                    </div>
                    
                    <div class="progress-section" id="research-progress" style="display: none;">
                        <!-- Progress content will be populated by orchestrator -->
                    </div>
                    
                    <div class="results-section" id="research-results" style="display: none;">
                        <!-- Results content will be populated by orchestrator -->
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.addCustomStyles();
    }

    // Render input form
    renderInputForm() {
        return `
            <div class="input-form">
                <div class="form-header">
                    <h3>Enterprise Technology Analysis</h3>
                    <p>Comprehensive analysis including market trends, vendor landscape, maturity assessment, and 5-year strategic forecast.</p>
                </div>
                
                <div class="form-group">
                    <label for="technology-input">Technology Area</label>
                    <input type="text" 
                           id="technology-input" 
                           placeholder="e.g., Zero Trust Security, AIOps, Edge Computing" 
                           class="form-input"
                           autocomplete="off">
                    <div class="input-help">Enter the technology or solution area you want to analyze</div>
                </div>
                
                <div class="analysis-options">
                    <h4>Analysis Modules</h4>
                    <div class="options-grid">
                        <div class="option-card">
                            <div class="option-icon"><i class="fas fa-chart-line"></i></div>
                            <div class="option-content">
                                <h5>Market Analysis</h5>
                                <p>Market size, growth trends, and industry adoption patterns</p>
                                <span class="timing">~5.3s</span>
                            </div>
                        </div>
                        <div class="option-card">
                            <div class="option-icon"><i class="fas fa-building"></i></div>
                            <div class="option-content">
                                <h5>Vendor Analysis</h5>
                                <p>Competitive landscape and vendor positioning assessment</p>
                                <span class="timing">~7.7s</span>
                            </div>
                        </div>
                        <div class="option-card">
                            <div class="option-icon"><i class="fas fa-clock"></i></div>
                            <div class="option-content">
                                <h5>Maturity Assessment</h5>
                                <p>Hype cycle positioning and implementation readiness</p>
                                <span class="timing">~4.9s</span>
                            </div>
                        </div>
                        <div class="option-card">
                            <div class="option-icon"><i class="fas fa-road"></i></div>
                            <div class="option-content">
                                <h5>5-Year Forecast</h5>
                                <p>Strategic roadmap and future evolution projections</p>
                                <span class="timing">~8.7s</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-summary">
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-label">Total Modules:</span>
                            <span class="stat-value">4</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Expected Time:</span>
                            <span class="stat-value">~26 seconds</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Artifacts:</span>
                            <span class="stat-value">6-8 files</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button id="start-research-btn" 
                            class="primary-button" 
                            onclick="researchInterface.startResearch()">
                        <i class="fas fa-play"></i>
                        Start Enterprise Analysis
                    </button>
                    <button class="secondary-button" onclick="closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        const technologyInput = document.getElementById('technology-input');
        if (technologyInput) {
            technologyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isResearchActive) {
                    this.startResearch();
                }
            });
            
            technologyInput.addEventListener('input', (e) => {
                this.validateInput();
            });
        }
    }

    // Validate input
    validateInput() {
        const technologyInput = document.getElementById('technology-input');
        const startButton = document.getElementById('start-research-btn');
        
        if (technologyInput && startButton) {
            const technology = technologyInput.value.trim();
            
            if (technology.length >= 3) {
                startButton.disabled = false;
                startButton.classList.remove('disabled');
                technologyInput.classList.remove('error');
            } else {
                startButton.disabled = true;
                startButton.classList.add('disabled');
            }
        }
    }

    // Start research process
    async startResearch() {
        if (this.isResearchActive) return;
        
        const technologyInput = document.getElementById('technology-input');
        if (!technologyInput) return;
        
        const technology = technologyInput.value.trim();
        
        if (!technology || technology.length < 3) {
            this.showValidationError('Please enter a technology area (minimum 3 characters)');
            return;
        }
        
        this.isResearchActive = true;
        this.currentTechnology = technology;
        
        // Hide input form and show progress
        const inputSection = document.getElementById('input-section');
        if (inputSection) {
            inputSection.style.display = 'none';
        }
        
        try {
            // Use the orchestrator to conduct research
            await window.technologyResearch.conductResearch(technology, {
                generateArtifacts: true,
                webSummary: true
            });
            
        } catch (error) {
            console.error('Research failed:', error);
            this.showError(error.message);
        } finally {
            this.isResearchActive = false;
        }
    }

    // Show validation error
    showValidationError(message) {
        const technologyInput = document.getElementById('technology-input');
        if (technologyInput) {
            technologyInput.classList.add('error');
            
            // Remove existing error message
            const existingError = technologyInput.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            technologyInput.parentNode.appendChild(errorDiv);
            
            // Remove error after 3 seconds
            setTimeout(() => {
                technologyInput.classList.remove('error');
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 3000);
        }
    }

    // Show error state
    showError(errorMessage) {
        const inputSection = document.getElementById('input-section');
        const progressSection = document.getElementById('research-progress');
        const resultsSection = document.getElementById('research-results');
        
        if (inputSection) inputSection.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
        
        const errorHTML = `
            <div class="error-section">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-content">
                    <h3>Analysis Failed</h3>
                    <p>${errorMessage}</p>
                    <div class="error-details">
                        <p>This could be due to:</p>
                        <ul>
                            <li>Temporary API service unavailability</li>
                            <li>Network connectivity issues</li>
                            <li>Invalid technology specification</li>
                        </ul>
                    </div>
                </div>
                <div class="error-actions">
                    <button class="primary-button" onclick="researchInterface.resetInterface()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="secondary-button" onclick="closeModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        const modalContent = document.querySelector('.research-interface');
        if (modalContent) {
            modalContent.innerHTML = errorHTML;
        }
    }

    // Reset interface to initial state
    resetInterface() {
        this.isResearchActive = false;
        this.currentTechnology = null;
        this.initializeInterface();
    }

    // Add custom styles
    addCustomStyles() {
        if (document.getElementById('research-interface-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'research-interface-styles';
        styles.textContent = `
            .research-modal {
                max-width: 900px;
                width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .research-interface {
                padding: 0;
            }
            
            .input-form {
                padding: 30px;
            }
            
            .form-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .form-header h3 {
                color: #2c3e50;
                margin-bottom: 10px;
                font-size: 24px;
            }
            
            .form-header p {
                color: #7f8c8d;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .form-group {
                margin-bottom: 25px;
            }
            
            .form-group label {
                display: block;
                font-weight: 600;
                margin-bottom: 8px;
                color: #2c3e50;
            }
            
            .form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #3498db;
            }
            
            .form-input.error {
                border-color: #e74c3c;
            }
            
            .input-help {
                margin-top: 5px;
                font-size: 14px;
                color: #7f8c8d;
            }
            
            .error-message {
                color: #e74c3c;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .analysis-options {
                margin: 30px 0;
            }
            
            .analysis-options h4 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 18px;
            }
            
            .options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .option-card {
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
                background: #ffffff;
            }
            
            .option-card.vendor-specific {
                border-color: #f39c12;
                background: linear-gradient(135deg, #fff 0%, #fdf6e3 100%);
            }
            
            .option-card.vendor-specific:hover {
                border-color: #e67e22;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(243, 156, 18, 0.15);
            }
            
            .option-card.vendor-specific .option-icon {
                color: #f39c12;
            }
            
            .option-icon {
                color: #3498db;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .option-content h5 {
                color: #2c3e50;
                margin-bottom: 5px;
                font-size: 16px;
            }
            
            .option-content p {
                color: #7f8c8d;
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 8px;
            }
            
            .timing {
                background: #ecf0f1;
                color: #2c3e50;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .analysis-summary {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .summary-stats {
                display: flex;
                justify-content: space-around;
                text-align: center;
            }
            
            .stat {
                flex: 1;
            }
            
            .stat-label {
                display: block;
                color: #7f8c8d;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .stat-value {
                display: block;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }
            
            .primary-button {
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 200px;
            }
            
            .primary-button:hover {
                background: linear-gradient(45deg, #2980b9, #1f4e79);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            }
            
            .primary-button:disabled,
            .primary-button.disabled {
                background: #bdc3c7;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .secondary-button {
                background: transparent;
                color: #7f8c8d;
                border: 2px solid #e1e8ed;
                padding: 10px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .secondary-button:hover {
                border-color: #3498db;
                color: #3498db;
            }
            
            /* Progress Section Styles */
            .progress-header {
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
                padding: 20px 30px;
                margin: 0 -30px 30px -30px;
            }
            
            .progress-header h3 {
                margin: 0 0 10px 0;
                font-size: 20px;
            }
            
            .progress-summary {
                display: flex;
                gap: 30px;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .progress-steps {
                margin-bottom: 30px;
            }
            
            .progress-step {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-left: 3px solid #e1e8ed;
                position: relative;
                margin-left: 20px;
                transition: all 0.3s ease;
            }
            
            .progress-step.active {
                border-left-color: #f39c12;
            }
            
            .progress-step.completed {
                border-left-color: #27ae60;
            }
            
            .progress-step.error {
                border-left-color: #e74c3c;
            }
            
            .step-number {
                position: absolute;
                left: -12px;
                background: #e1e8ed;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .progress-step.active .step-number {
                background: #f39c12;
            }
            
            .progress-step.completed .step-number {
                background: #27ae60;
            }
            
            .progress-step.error .step-number {
                background: #e74c3c;
            }
            
            .step-content {
                margin-left: 30px;
                flex: 1;
            }
            
            .step-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 3px;
            }
            
            .step-description {
                color: #7f8c8d;
                font-size: 14px;
            }
            
            .step-time {
                color: #27ae60;
                font-size: 12px;
                font-weight: 600;
                margin-top: 5px;
            }
            
            .progress-bar-container {
                margin-top: 20px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e1e8ed;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(45deg, #3498db, #2980b9);
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .progress-text {
                text-align: center;
                margin-top: 10px;
                color: #7f8c8d;
                font-size: 14px;
            }
            
            /* Web Summary Styles */
            .web-summary {
                padding: 30px;
            }
            
            .summary-header {
                border-bottom: 2px solid #e1e8ed;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .summary-header h2 {
                color: #2c3e50;
                margin-bottom: 10px;
                font-size: 28px;
            }
            
            .summary-meta {
                display: flex;
                gap: 30px;
                color: #7f8c8d;
                font-size: 14px;
            }
            
            .summary-meta i {
                margin-right: 5px;
                color: #3498db;
            }
            
            .executive-overview {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin-bottom: 30px;
            }
            
            .executive-overview h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 20px;
            }
            
            .executive-overview p {
                color: #34495e;
                line-height: 1.6;
                font-size: 16px;
            }
            
            .key-metrics-grid h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 20px;
            }
            
            .metrics-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .metric-card {
                background: white;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }
            
            .metric-card:hover {
                border-color: #3498db;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
            }
            
            .metric-label {
                color: #7f8c8d;
                font-size: 14px;
                margin-bottom: 8px;
                text-transform: uppercase;
                font-weight: 600;
            }
            
            .metric-value {
                color: #2c3e50;
                font-size: 24px;
                font-weight: 700;
            }
            
            .strategic-recommendations {
                margin-bottom: 30px;
            }
            
            .strategic-recommendations h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 20px;
            }
            
            .strategic-recommendations ul {
                list-style: none;
                padding: 0;
            }
            
            .strategic-recommendations li {
                background: #ecf0f1;
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 6px;
                border-left: 4px solid #3498db;
                color: #2c3e50;
            }
            
            .module-results h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 20px;
            }
            
            .module-result-card {
                background: white;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                transition: all 0.3s ease;
            }
            
            .module-result-card:hover {
                border-color: #3498db;
                box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
            }
            
            .module-header {
                display: flex;
                justify-content: between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .module-header h4 {
                color: #2c3e50;
                margin: 0;
                font-size: 18px;
            }
            
            .module-time {
                color: #27ae60;
                font-size: 14px;
                font-weight: 600;
                background: #d5f5d0;
                padding: 4px 8px;
                border-radius: 12px;
            }
            
            .module-summary {
                color: #34495e;
                line-height: 1.5;
            }
            
            .artifacts-section {
                border-top: 2px solid #e1e8ed;
                padding-top: 30px;
                margin-top: 30px;
            }
            
            .artifacts-section h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 20px;
            }
            
            .artifacts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .artifact-card {
                background: white;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
            }
            
            .artifact-card:hover {
                border-color: #3498db;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
            }
            
            .artifact-icon {
                color: #3498db;
                font-size: 24px;
                width: 40px;
                text-align: center;
            }
            
            .artifact-info {
                flex: 1;
            }
            
            .artifact-info h4 {
                color: #2c3e50;
                margin: 0 0 5px 0;
                font-size: 16px;
            }
            
            .artifact-info p {
                color: #7f8c8d;
                margin: 0;
                font-size: 14px;
            }
            
            .download-btn {
                background: #27ae60;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .download-btn:hover {
                background: #219a52;
                transform: translateY(-1px);
            }
            
            /* Error Section Styles */
            .error-section {
                text-align: center;
                padding: 50px 30px;
            }
            
            .error-icon {
                color: #e74c3c;
                font-size: 48px;
                margin-bottom: 20px;
            }
            
            .error-content h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 24px;
            }
            
            .error-content p {
                color: #7f8c8d;
                margin-bottom: 20px;
                font-size: 16px;
            }
            
            .error-details {
                background: #fdf2f2;
                border: 1px solid #fecdd3;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .error-details p {
                color: #991b1b;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .error-details ul {
                color: #7f1d1d;
                margin: 0;
            }
            
            .error-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }
            
            @media (max-width: 768px) {
                .research-modal {
                    width: 95vw;
                    max-height: 90vh;
                }
                
                .options-grid {
                    grid-template-columns: 1fr;
                }
                
                .summary-stats {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .summary-meta {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
                .artifacts-grid {
                    grid-template-columns: 1fr;
                }
                
                .artifact-card {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize interface
const researchInterface = new TechnologyResearchInterface();

// Export for global access
window.researchInterface = researchInterface;