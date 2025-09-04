// Research Interface Helper - UI interactions and utilities
class ResearchInterface {
    constructor() {
        this.currentSession = null;
        this.downloadQueue = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDownloadManager();
        console.log('Research Interface Helper initialized');
    }

    // Set up event listeners for research interface
    setupEventListeners() {
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'research-form') {
                e.preventDefault();
                this.handleResearchSubmission(e.target);
            }
        });

        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const activeForm = document.getElementById('research-form');
                if (activeForm && activeForm.style.display !== 'none') {
                    this.handleResearchSubmission(activeForm);
                }
            }
        });

        // Auto-save form data
        this.setupAutoSave();
    }

    // Handle research form submission
    async handleResearchSubmission(form) {
        const formData = this.extractFormData(form);
        
        if (!this.validateFormData(formData)) {
            return;
        }

        try {
            // Start research process
            await this.startResearch(formData);
        } catch (error) {
            console.error('Research submission failed:', error);
            this.showError('Failed to start research. Please try again.');
        }
    }

    // Extract form data
    extractFormData(form) {
        return {
            technologyArea: form.querySelector('#technology-area')?.value?.trim(),
            includeMarketResearch: form.querySelector('#include-market')?.checked ?? true,
            includeVendorAnalysis: form.querySelector('#include-vendor')?.checked ?? true,
            includeHypeCycle: form.querySelector('#include-hype')?.checked ?? true,
            includeStrategicSummary: form.querySelector('#include-strategic')?.checked ?? true,
            analysisDepth: form.querySelector('#analysis-depth')?.value || 'comprehensive'
        };
    }

    // Validate form data
    validateFormData(data) {
        if (!data.technologyArea) {
            this.showError('Please enter a technology area to analyze');
            document.getElementById('technology-area')?.focus();
            return false;
        }

        if (data.technologyArea.length < 3) {
            this.showError('Technology area must be at least 3 characters long');
            document.getElementById('technology-area')?.focus();
            return false;
        }

        // Check if at least one analysis type is selected
        const hasAnalysisSelected = data.includeMarketResearch || 
                                   data.includeVendorAnalysis || 
                                   data.includeHypeCycle || 
                                   data.includeStrategicSummary;

        if (!hasAnalysisSelected) {
            this.showError('Please select at least one type of analysis');
            return false;
        }

        return true;
    }

    // Start research process
    async startResearch(formData) {
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date(),
            formData: formData,
            status: 'running'
        };

        // Show progress interface
        this.showProgressInterface();

        // Store session for recovery
        this.saveSession();

        try {
            // Call the technology research agent
            const result = await window.technologyResearch.conductResearch(
                formData.technologyArea,
                {
                    includeMarketResearch: formData.includeMarketResearch,
                    includeVendorAnalysis: formData.includeVendorAnalysis,
                    includeHypeCycle: formData.includeHypeCycle,
                    includeStrategicSummary: formData.includeStrategicSummary,
                    analysisDepth: formData.analysisDepth,
                    generateArtifacts: true
                }
            );

            this.currentSession.result = result;
            this.currentSession.status = 'completed';
            this.currentSession.endTime = new Date();

            // Show success message
            this.showSuccess('Research completed successfully!');

        } catch (error) {
            this.currentSession.status = 'failed';
            this.currentSession.error = error.message;
            throw error;
        } finally {
            this.saveSession();
        }
    }

    // Show progress interface
    showProgressInterface() {
        const formContainer = document.getElementById('research-form');
        const progressContainer = document.getElementById('research-progress');

        if (formContainer) formContainer.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'block';

        // Reset progress indicators
        this.resetProgressIndicators();
    }

    // Reset progress indicators
    resetProgressIndicators() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = 'Initializing research...';

        // Reset step indicators
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }

    // Setup download manager
    setupDownloadManager() {
        // Handle artifact downloads
        document.addEventListener('click', (e) => {
            if (e.target.closest('.artifact-card')) {
                const card = e.target.closest('.artifact-card');
                const downloadUrl = card.dataset.downloadUrl;
                const fileName = card.dataset.fileName;

                if (downloadUrl && fileName) {
                    this.downloadArtifact(downloadUrl, fileName);
                }
            }
        });
    }

    // Download artifact
    downloadArtifact(url, fileName) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess(`Downloaded: ${fileName}`);
            
            // Track download
            this.trackDownload(fileName);

        } catch (error) {
            console.error('Download failed:', error);
            this.showError(`Failed to download: ${fileName}`);
        }
    }

    // Track downloads for analytics
    trackDownload(fileName) {
        const downloads = this.getStoredDownloads();
        downloads.push({
            fileName: fileName,
            timestamp: new Date().toISOString(),
            sessionId: this.currentSession?.id
        });

        // Keep only last 100 downloads
        if (downloads.length > 100) {
            downloads.splice(0, downloads.length - 100);
        }

        localStorage.setItem('ea_research_downloads', JSON.stringify(downloads));
    }

    // Get stored downloads
    getStoredDownloads() {
        try {
            const stored = localStorage.getItem('ea_research_downloads');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading download history:', error);
            return [];
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        const inputs = ['technology-area', 'analysis-depth'];
        const checkboxes = ['include-market', 'include-vendor', 'include-hype', 'include-strategic'];

        // Save form data as user types
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.autoSaveForm());
            }
        });

        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.autoSaveForm());
            }
        });

        // Load saved form data
        this.loadSavedForm();
    }

    // Auto-save form data
    autoSaveForm() {
        const formData = {
            technologyArea: document.getElementById('technology-area')?.value || '',
            includeMarketResearch: document.getElementById('include-market')?.checked ?? true,
            includeVendorAnalysis: document.getElementById('include-vendor')?.checked ?? true,
            includeHypeCycle: document.getElementById('include-hype')?.checked ?? true,
            includeStrategicSummary: document.getElementById('include-strategic')?.checked ?? true,
            analysisDepth: document.getElementById('analysis-depth')?.value || 'comprehensive',
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('ea_research_form_draft', JSON.stringify(formData));
    }

    // Load saved form data
    loadSavedForm() {
        try {
            const saved = localStorage.getItem('ea_research_form_draft');
            if (!saved) return;

            const formData = JSON.parse(saved);
            
            // Don't load if saved more than 24 hours ago
            const savedTime = new Date(formData.savedAt);
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (savedTime < dayAgo) return;

            // Restore form values
            const technologyInput = document.getElementById('technology-area');
            if (technologyInput && formData.technologyArea) {
                technologyInput.value = formData.technologyArea;
            }

            const depthSelect = document.getElementById('analysis-depth');
            if (depthSelect && formData.analysisDepth) {
                depthSelect.value = formData.analysisDepth;
            }

            // Restore checkboxes
            const checkboxes = {
                'include-market': formData.includeMarketResearch,
                'include-vendor': formData.includeVendorAnalysis,
                'include-hype': formData.includeHypeCycle,
                'include-strategic': formData.includeStrategicSummary
            };

            Object.entries(checkboxes).forEach(([id, checked]) => {
                const checkbox = document.getElementById(id);
                if (checkbox && typeof checked === 'boolean') {
                    checkbox.checked = checked;
                }
            });

        } catch (error) {
            console.error('Error loading saved form:', error);
        }
    }

    // Save current session
    saveSession() {
        if (!this.currentSession) return;

        try {
            const sessions = this.getStoredSessions();
            
            // Update or add current session
            const existingIndex = sessions.findIndex(s => s.id === this.currentSession.id);
            if (existingIndex >= 0) {
                sessions[existingIndex] = { ...this.currentSession };
            } else {
                sessions.unshift(this.currentSession);
            }

            // Keep only last 20 sessions
            if (sessions.length > 20) {
                sessions.splice(20);
            }

            localStorage.setItem('ea_research_sessions', JSON.stringify(sessions));

        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    // Get stored sessions
    getStoredSessions() {
        try {
            const stored = localStorage.getItem('ea_research_sessions');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    }

    // Recover interrupted session
    recoverSession() {
        const sessions = this.getStoredSessions();
        const runningSession = sessions.find(s => s.status === 'running');

        if (runningSession) {
            const timeSinceStart = Date.now() - new Date(runningSession.startTime).getTime();
            
            // If session started less than 10 minutes ago, offer to recover
            if (timeSinceStart < 10 * 60 * 1000) {
                this.offerSessionRecovery(runningSession);
            }
        }
    }

    // Offer session recovery
    offerSessionRecovery(session) {
        const shouldRecover = confirm(
            `Found an interrupted research session for "${session.formData.technologyArea}". Would you like to continue?`
        );

        if (shouldRecover) {
            this.currentSession = session;
            this.restoreFormData(session.formData);
            this.showInfo('Session recovered. You can continue or start a new research.');
        }
    }

    // Restore form data from session
    restoreFormData(formData) {
        const technologyInput = document.getElementById('technology-area');
        if (technologyInput) technologyInput.value = formData.technologyArea;

        const depthSelect = document.getElementById('analysis-depth');
        if (depthSelect) depthSelect.value = formData.analysisDepth;

        // Restore checkboxes
        if (document.getElementById('include-market')) {
            document.getElementById('include-market').checked = formData.includeMarketResearch;
        }
        if (document.getElementById('include-vendor')) {
            document.getElementById('include-vendor').checked = formData.includeVendorAnalysis;
        }
        if (document.getElementById('include-hype')) {
            document.getElementById('include-hype').checked = formData.includeHypeCycle;
        }
        if (document.getElementById('include-strategic')) {
            document.getElementById('include-strategic').checked = formData.includeStrategicSummary;
        }
    }

    // Generate session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Utility methods for messaging
    showError(message) {
        if (window.eaApp) {
            window.eaApp.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    showSuccess(message) {
        if (window.eaApp) {
            window.eaApp.showToast(message, 'success');
        } else {
            console.log(message);
        }
    }

    showInfo(message) {
        if (window.eaApp) {
            window.eaApp.showToast(message, 'info');
        } else {
            console.info(message);
        }
    }

    // Get research statistics
    getResearchStats() {
        const sessions = this.getStoredSessions();
        const downloads = this.getStoredDownloads();

        return {
            totalSessions: sessions.length,
            completedSessions: sessions.filter(s => s.status === 'completed').length,
            failedSessions: sessions.filter(s => s.status === 'failed').length,
            totalDownloads: downloads.length,
            lastActivity: sessions.length > 0 ? sessions[0].startTime : null,
            averageSessionDuration: this.calculateAverageSessionDuration(sessions)
        };
    }

    // Calculate average session duration
    calculateAverageSessionDuration(sessions) {
        const completedSessions = sessions.filter(s => s.status === 'completed' && s.endTime);
        
        if (completedSessions.length === 0) return 0;

        const totalDuration = completedSessions.reduce((sum, session) => {
            const duration = new Date(session.endTime) - new Date(session.startTime);
            return sum + duration;
        }, 0);

        return Math.round(totalDuration / completedSessions.length / 1000); // Return in seconds
    }

    // Clear all stored data
    clearStoredData() {
        const confirm = window.confirm(
            'This will clear all saved research data, sessions, and downloads. Are you sure?'
        );

        if (confirm) {
            localStorage.removeItem('ea_research_form_draft');
            localStorage.removeItem('ea_research_sessions');
            localStorage.removeItem('ea_research_downloads');
            
            this.showSuccess('All research data cleared successfully');
        }
    }
}

// Initialize the Research Interface Helper
window.researchInterface = new ResearchInterface();

// Initialize session recovery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Delay recovery check to ensure other components are loaded
    setTimeout(() => {
        window.researchInterface.recoverSession();
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResearchInterface;
}