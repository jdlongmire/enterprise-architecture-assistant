// Enterprise Architecture Assistant - Main Application
class EAAssistant {
    constructor() {
        this.settings = this.loadSettings();
        this.history = this.loadHistory();
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.updateStatusIndicator();
        this.loadRecentActivity();
        
        // Auto-save settings periodically
        setInterval(() => {
            this.autoSave();
        }, EA_CONFIG.ui.autoSaveInterval);

        console.log(`${EA_CONFIG.name} v${EA_CONFIG.version} initialized`);
    }

    // Set up event listeners
    setupEventListeners() {
        // Settings form elements
        const apiKeyInput = document.getElementById('claude-api-key');
        const searchProviderSelect = document.getElementById('search-provider');
        const organizationInput = document.getElementById('organization-name');
        const industrySelect = document.getElementById('industry-sector');

        if (apiKeyInput) {
            apiKeyInput.value = this.settings.claudeApiKey || '';
            apiKeyInput.addEventListener('input', () => this.updateSetting('claudeApiKey', apiKeyInput.value));
        }

        if (searchProviderSelect) {
            searchProviderSelect.value = this.settings.searchProvider || 'bing';
            searchProviderSelect.addEventListener('change', () => this.updateSetting('searchProvider', searchProviderSelect.value));
        }

        if (organizationInput) {
            organizationInput.value = this.settings.organizationName || '';
            organizationInput.addEventListener('input', () => this.updateSetting('organizationName', organizationInput.value));
        }

        if (industrySelect) {
            industrySelect.value = this.settings.industrySector || '';
            industrySelect.addEventListener('change', () => this.updateSetting('industrySector', industrySelect.value));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSettings();
            }
        });
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const stored = localStorage.getItem(EA_CONFIG.storage.settings);
            return stored ? JSON.parse(stored) : {
                claudeApiKey: '',
                searchProvider: 'bing',
                organizationName: '',
                industrySector: '',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            this.settings.lastUpdated = new Date().toISOString();
            localStorage.setItem(EA_CONFIG.storage.settings, JSON.stringify(this.settings));
            this.showToast(EA_CONFIG.success.settingsSaved, 'success');
            this.updateStatusIndicator();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    // Update a single setting
    updateSetting(key, value) {
        this.settings[key] = value;
        this.settings.lastUpdated = new Date().toISOString();
    }

    // Auto-save settings
    autoSave() {
        if (this.settings.lastUpdated) {
            localStorage.setItem(EA_CONFIG.storage.settings, JSON.stringify(this.settings));
        }
    }

    // Load analysis history
    loadHistory() {
        try {
            const stored = localStorage.getItem(EA_CONFIG.storage.history);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    // Save analysis to history
    saveToHistory(analysis) {
        try {
            this.history.unshift(analysis);
            
            // Limit history size
            if (this.history.length > EA_CONFIG.ui.maxHistoryItems) {
                this.history = this.history.slice(0, EA_CONFIG.ui.maxHistoryItems);
            }
            
            localStorage.setItem(EA_CONFIG.storage.history, JSON.stringify(this.history));
            this.loadRecentActivity();
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    // Load recent activity display
    loadRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        if (this.history.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>No recent analysis. Start with the Technology Research Agent to generate your first strategic report.</span>
                </div>
            `;
            return;
        }

        activityList.innerHTML = this.history.slice(0, 5).map(item => `
            <div class="activity-item" onclick="eaApp.viewAnalysis('${item.id}')">
                <i class="fas fa-${this.getActivityIcon(item.type)}"></i>
                <div>
                    <strong>${item.technology || item.title}</strong>
                    <small>Generated ${this.formatDate(item.timestamp)}</small>
                </div>
            </div>
        `).join('');
    }

    // Get icon for activity type
    getActivityIcon(type) {
        const icons = {
            'technology-research': 'search',
            'strategic-analysis': 'chess',
            'supplier-evaluation': 'balance-scale',
            'roadmap-planning': 'road',
            'adr-agent': 'file-contract'
        };
        return icons[type] || 'file-alt';
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Update status indicator
    updateStatusIndicator() {
        const statusElement = document.getElementById('status-text');
        const statusIcon = document.querySelector('.status-indicator i');
        
        if (!statusElement || !statusIcon) return;

        // Check if basic settings are configured
        const hasApiKey = this.settings.claudeApiKey && this.settings.claudeApiKey.length > 0;
        
        if (hasApiKey) {
            statusElement.textContent = 'System Ready';
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = '#2ecc71';
        } else {
            statusElement.textContent = 'Configure API Key';
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = '#f39c12';
        }
    }

    // Test connection to backend
    async testConnection() {
        const testButton = document.querySelector('[onclick="testConnection()"]');
        if (testButton) {
            testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
            testButton.disabled = true;
        }

        try {
            const response = await fetch(EA_CONFIG.api.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'test',
                    message: 'Connection test'
                })
            });

            if (response.ok) {
                this.showToast(EA_CONFIG.success.connectionTested, 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showToast('Connection test failed. Check your configuration.', 'error');
        } finally {
            if (testButton) {
                testButton.innerHTML = '<i class="fas fa-wifi"></i> Test Connection';
                testButton.disabled = false;
            }
        }
    }

    // Open settings sidebar
    openSettings() {
        const sidebar = document.getElementById('settings-sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    // Close settings sidebar
    closeSettings() {
        const sidebar = document.getElementById('settings-sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // Open agent modal
    openAgent(agentType) {
        const agent = EA_CONFIG.agents[agentType];
        if (!agent) {
            this.showToast('Agent not found', 'error');
            return;
        }

        if (agent.status !== 'ready') {
            this.showToast(`${agent.name} is coming soon!`, 'info');
            return;
        }

        const modal = document.getElementById('agent-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const overlay = document.getElementById('overlay');

        if (modalTitle) modalTitle.textContent = agent.name;
        
        if (modalBody) {
            modalBody.innerHTML = this.getAgentInterface(agentType);
        }

        if (modal) modal.classList.add('active');
        if (overlay) overlay.classList.add('active');

        // Initialize agent-specific functionality
        this.initializeAgent(agentType);
    }

    // Get agent interface HTML
    getAgentInterface(agentType) {
        switch (agentType) {
            case 'technology-research':
                return this.getTechnologyResearchInterface();
            default:
                return `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-cog fa-spin" style="font-size: 3rem; color: #667eea; margin-bottom: 20px;"></i>
                        <h3>Agent Interface Loading...</h3>
                        <p style="color: #7f8c8d;">Full ${EA_CONFIG.agents[agentType].name} interface coming soon!</p>
                        <button class="btn-primary" onclick="eaApp.closeModal()" style="margin-top: 20px;">Close</button>
                    </div>
                `;
        }
    }

    // Get Technology Research Agent interface
    getTechnologyResearchInterface() {
        return `
            <div class="research-interface">
                <div class="interface-header">
                    <h4><i class="fas fa-search"></i> Technology Research Configuration</h4>
                    <p>Enter a technology area to generate comprehensive market analysis, vendor evaluation, and strategic recommendations.</p>
                </div>

                <form id="research-form" class="research-form">
                    <div class="form-group">
                        <label for="technology-area">Technology Area *</label>
                        <input type="text" id="technology-area" placeholder="e.g., Zero Trust Security, AIOps, Data Mesh" required>
                        <small>Enter the technology or solution domain you want to analyze</small>
                    </div>

                    <div class="form-group">
                        <label>Research Scope</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-market" checked>
                                <span>Market Research & Trends</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-vendor" checked>
                                <span>Vendor Landscape Analysis</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-hype" checked>
                                <span>Hype Cycle Positioning</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-strategic" checked>
                                <span>Strategic Recommendations</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="analysis-depth">Analysis Depth</label>
                        <select id="analysis-depth">
                            <option value="overview">Overview (Quick insights)</option>
                            <option value="comprehensive" selected>Comprehensive (Full analysis)</option>
                            <option value="detailed">Detailed (In-depth research)</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="eaApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-rocket"></i> Start Research
                        </button>
                    </div>
                </form>

                <div id="research-progress" class="research-progress" style="display: none;">
                    <div class="progress-header">
                        <h4><i class="fas fa-cogs"></i> Research in Progress</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="progress-text" id="progress-text">Initializing research...</div>
                    </div>
                    
                    <div class="progress-steps">
                        <div class="step" id="step-search">
                            <i class="fas fa-search"></i>
                            <span>Web Search</span>
                        </div>
                        <div class="step" id="step-market">
                            <i class="fas fa-chart-line"></i>
                            <span>Market Analysis</span>
                        </div>
                        <div class="step" id="step-vendor">
                            <i class="fas fa-building"></i>
                            <span>Vendor Analysis</span>
                        </div>
                        <div class="step" id="step-strategic">
                            <i class="fas fa-lightbulb"></i>
                            <span>Strategic Synthesis</span>
                        </div>
                        <div class="step" id="step-artifacts">
                            <i class="fas fa-file-pdf"></i>
                            <span>Generate Artifacts</span>
                        </div>
                    </div>
                </div>

                <div id="research-results" class="research-results" style="display: none;">
                    <div class="results-header">
                        <h4><i class="fas fa-check-circle"></i> Research Complete</h4>
                        <p>Your technology analysis has been generated successfully.</p>
                    </div>
                    
                    <div class="artifact-grid" id="artifact-grid">
                        <!-- Artifacts will be populated here -->
                    </div>
                    
                    <div class="results-actions">
                        <button class="btn-secondary" onclick="eaApp.startNewResearch()">
                            <i class="fas fa-plus"></i> New Research
                        </button>
                        <button class="btn-primary" onclick="eaApp.closeModal()">
                            <i class="fas fa-check"></i> Done
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .research-interface { max-width: 100%; }
                .interface-header { margin-bottom: 2rem; text-align: center; }
                .interface-header h4 { color: #2c3e50; margin-bottom: 0.5rem; }
                .interface-header p { color: #7f8c8d; }
                
                .research-form .form-group { margin-bottom: 1.5rem; }
                .research-form label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50; }
                .research-form input, .research-form select { 
                    width: 100%; padding: 0.75rem; border: 2px solid #e1e8ed; 
                    border-radius: 8px; font-size: 1rem; 
                }
                .research-form input:focus, .research-form select:focus { 
                    outline: none; border-color: #667eea; 
                }
                .research-form small { display: block; margin-top: 0.5rem; color: #7f8c8d; font-size: 0.9rem; }
                
                .checkbox-group { display: flex; flex-direction: column; gap: 0.75rem; }
                .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
                .checkbox-label input[type="checkbox"] { margin: 0; }
                
                .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
                .form-actions button { flex: 1; }
                
                .research-progress { text-align: center; }
                .progress-header h4 { color: #2c3e50; margin-bottom: 1rem; }
                .progress-text { margin-top: 1rem; color: #7f8c8d; }
                
                .progress-steps { 
                    display: flex; justify-content: space-between; margin-top: 2rem; 
                    flex-wrap: wrap; gap: 1rem;
                }
                .step { 
                    display: flex; flex-direction: column; align-items: center; gap: 0.5rem; 
                    padding: 1rem; border-radius: 8px; background: #f8f9fa;
                    min-width: 100px; flex: 1;
                }
                .step.active { background: #667eea; color: white; }
                .step.completed { background: #2ecc71; color: white; }
                .step i { font-size: 1.5rem; }
                
                .research-results { text-align: center; }
                .results-header { margin-bottom: 2rem; }
                .results-header h4 { color: #2ecc71; margin-bottom: 0.5rem; }
                
                .artifact-grid { 
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 1rem; margin-bottom: 2rem; 
                }
                .artifact-card { 
                    background: #f8f9fa; border-radius: 8px; padding: 1.5rem; 
                    border: 2px solid #e1e8ed; cursor: pointer; transition: all 0.3s ease;
                }
                .artifact-card:hover { border-color: #667eea; transform: translateY(-2px); }
                .artifact-card i { font-size: 2rem; color: #667eea; margin-bottom: 1rem; }
                .artifact-card h5 { margin-bottom: 0.5rem; color: #2c3e50; }
                .artifact-card p { color: #7f8c8d; font-size: 0.9rem; }
                
                .results-actions { display: flex; gap: 1rem; }
                .results-actions button { flex: 1; }
                
                @media (max-width: 768px) {
                    .progress-steps { flex-direction: column; }
                    .step { min-width: auto; }
                    .form-actions, .results-actions { flex-direction: column; }
                }
            </style>
        `;
    }

    // Initialize agent-specific functionality
    initializeAgent(agentType) {
        if (agentType === 'technology-research') {
            this.initializeTechnologyResearch();
        }
    }

    // Initialize Technology Research Agent
    initializeTechnologyResearch() {
        const form = document.getElementById('research-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startTechnologyResearch();
            });
        }
    }

    // Start Technology Research
    async startTechnologyResearch() {
        const technologyArea = document.getElementById('technology-area').value.trim();
        
        if (!technologyArea) {
            this.showToast('Please enter a technology area', 'error');
            return;
        }

        // Show progress view
        document.getElementById('research-form').style.display = 'none';
        document.getElementById('research-progress').style.display = 'block';

        try {
            // This will be implemented when we create the research agent
            await window.technologyResearch.conductResearch(technologyArea, {
                includeMarketResearch: document.getElementById('include-market').checked,
                includeVendorAnalysis: document.getElementById('include-vendor').checked,
                includeHypeCycle: document.getElementById('include-hype').checked,
                includeStrategicSummary: document.getElementById('include-strategic').checked,
                analysisDepth: document.getElementById('analysis-depth').value
            });
        } catch (error) {
            console.error('Research failed:', error);
            this.showToast('Research failed. Please try again.', 'error');
            this.resetResearchInterface();
        }
    }

    // Reset research interface
    resetResearchInterface() {
        document.getElementById('research-form').style.display = 'block';
        document.getElementById('research-progress').style.display = 'none';
        document.getElementById('research-results').style.display = 'none';
    }

    // Start new research
    startNewResearch() {
        this.resetResearchInterface();
        document.getElementById('research-form').reset();
        document.getElementById('technology-area').focus();
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('agent-modal');
        const overlay = document.getElementById('overlay');
        
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        // Reset any agent interfaces
        setTimeout(() => {
            const modalBody = document.getElementById('modal-body');
            if (modalBody) modalBody.innerHTML = '';
        }, 300);
    }

    // View previous analysis
    viewAnalysis(analysisId) {
        const analysis = this.history.find(item => item.id === analysisId);
        if (analysis) {
            // This could open a detailed view of the analysis
            console.log('Viewing analysis:', analysis);
            this.showToast('Analysis viewer coming soon!', 'info');
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getToastColor(type),
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: '9999',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, EA_CONFIG.ui.toastDuration);
    }

    // Get toast icon
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Get toast color
    getToastColor(type) {
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Global functions for HTML onclick handlers
function openSettings() {
    eaApp.openSettings();
}

function closeSettings() {
    eaApp.closeSettings();
}

function saveSettings() {
    eaApp.saveSettings();
}

function testConnection() {
    eaApp.testConnection();
}

function openAgent(agentType) {
    eaApp.openAgent(agentType);
}

function closeModal() {
    eaApp.closeModal();
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eaApp = new EAAssistant();
});