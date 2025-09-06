// AI Project Estimator Logic

class ProjectEstimator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.estimateData = {
            projectType: '',
            location: '',
            squareFootage: 0,
            stories: 1,
            constructionType: '',
            specialRequirements: '',
            timeline: '',
            contactInfo: {}
        };
        this.priceFactors = {
            commercial: { base: 150, multiplier: 1.0 },
            medical: { base: 200, multiplier: 1.3 },
            religious: { base: 120, multiplier: 0.9 },
            industrial: { base: 100, multiplier: 0.8 },
            winery: { base: 180, multiplier: 1.2 },
            custom: { base: 175, multiplier: 1.1 }
        };
        this.initialized = false;
        this.init();
    }

    init() {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.doInit());
        } else {
            this.doInit();
        }
    }

    doInit() {
        // Restore state from localStorage if available
        this.restoreState();
        
        this.setupEventListeners();
        this.updateProgress();
        this.updateStepDisplay();
        this.handleURLParams();
        this.ensureVisibility();
        
        this.initialized = true;
        console.log('Project Estimator initialized with state:', this.estimateData);
    }

    ensureVisibility() {
        // Force show the first step and ensure proper display
        const firstStep = document.querySelector('.form-step[data-step="1"]');
        const allSteps = document.querySelectorAll('.form-step');
        
        // Hide all steps first
        allSteps.forEach(step => {
            step.style.display = 'none';
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            currentStepElement.classList.add('active');
        }
        
        // Ensure navigation buttons are properly displayed
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
        }

        if (nextBtn) {
            if (this.currentStep === 4) {
                nextBtn.style.display = 'none';
            } else if (this.currentStep === 5) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'inline-block';
            }
        }

        if (submitBtn) {
            if (this.currentStep === 4) {
                submitBtn.style.display = 'inline-block';
            } else {
                submitBtn.style.display = 'none';
            }
        }
    }

    restoreState() {
        try {
            const savedState = localStorage.getItem('mhc_estimator_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.currentStep = state.currentStep || 1;
                this.estimateData = { ...this.estimateData, ...state.estimateData };
                console.log('Restored estimator state:', state);
            }
        } catch (error) {
            console.log('No saved state to restore or error parsing:', error);
            this.currentStep = 1;
        }
    }

    saveState() {
        try {
            const state = {
                currentStep: this.currentStep,
                estimateData: this.estimateData,
                timestamp: Date.now()
            };
            localStorage.setItem('mhc_estimator_state', JSON.stringify(state));
        } catch (error) {
            console.warn('Could not save estimator state:', error);
        }
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.updateStepDisplay();
        this.handleURLParams();
        this.ensureVisibility();
        console.log('Project Estimator initialized');
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectType = urlParams.get('type');
        
        if (projectType && this.priceFactors[projectType]) {
            // Pre-select project type if coming from another page
            setTimeout(() => {
                const typeElement = document.querySelector(`[data-type="${projectType}"]`);
                if (typeElement) {
                    this.selectProjectType(typeElement);
                }
            }, 500);
        }
    }

    setupEventListeners() {
        // Project type selection
        document.querySelectorAll('.project-type').forEach(type => {
            type.addEventListener('click', (e) => {
                this.selectProjectType(e.currentTarget);
            });
        });

        // Timeline selection
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTimeline(e.currentTarget);
            });
        });

        // Location input with autocomplete
        const locationInput = document.getElementById('projectAddress');
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                this.handleLocationInput(e.target.value);
            });
        }

        // Form submission
        const form = document.getElementById('estimatorForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitEstimate();
            });
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    selectProjectType(element) {
        // Remove previous selections
        document.querySelectorAll('.project-type').forEach(type => {
            type.classList.remove('selected');
        });
        
        // Add selection
        element.classList.add('selected');
        this.estimateData.projectType = element.dataset.type;
        
        // Clear any errors
        this.clearStepError();
        
        // Save state immediately
        this.saveState();
        
        // Auto-advance after selection
        setTimeout(() => {
            if (this.validateStep(this.currentStep)) {
                this.nextStep();
            }
        }, 800);
    }

    selectTimeline(element) {
        // Remove previous selections
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection
        element.classList.add('selected');
        this.estimateData.timeline = element.dataset.timeline;
        
        // Clear any errors
        this.clearStepError();
        
        // Save state immediately
        this.saveState();
        
        // Validate current step
        this.validateStep(this.currentStep);
    }

    handleLocationInput(address) {
        this.estimateData.location = address;
        
        // Simulate location factor analysis
        if (address.length > 3) {
            this.updateLocationFactors(address);
        }
    }

    updateLocationFactors(address) {
        const factorsContainer = document.getElementById('locationFactors');
        if (!factorsContainer) return;

        // Simulate regional analysis
        const regions = {
            'washington': { permitCost: 1.2, laborCost: 1.1, materialCost: 1.0 },
            'oregon': { permitCost: 1.1, laborCost: 1.0, materialCost: 1.05 },
            'idaho': { permitCost: 0.9, laborCost: 0.95, materialCost: 0.98 }
        };

        // Simple region detection
        const region = address.toLowerCase().includes('wa') || address.toLowerCase().includes('washington') ? 'washington' :
                     address.toLowerCase().includes('or') || address.toLowerCase().includes('oregon') ? 'oregon' :
                     address.toLowerCase().includes('id') || address.toLowerCase().includes('idaho') ? 'idaho' : null;

        if (region) {
            this.estimateData.locationFactors = regions[region];
            this.showLocationAnalysis(region);
        }
    }

    showLocationAnalysis(region) {
        const factorsContainer = document.getElementById('locationFactors');
        const regionData = {
            washington: {
                name: 'Washington State',
                factors: [
                    '📍 Standard WA building codes apply',
                    '🚛 Regional material suppliers available',
                    '👷 Skilled labor market (higher costs)',
                    '🌡️ Pacific Northwest weather considerations'
                ]
            },
            oregon: {
                name: 'Oregon',
                factors: [
                    '📍 Oregon building codes and permits',
                    '🚛 Good material delivery access',
                    '👷 Competitive labor market',
                    '🌡️ Mild climate advantages'
                ]
            },
            idaho: {
                name: 'Idaho',
                factors: [
                    '📍 Idaho building requirements',
                    '🚛 Lower material delivery costs',
                    '👷 Cost-effective labor market',
                    '🌡️ Continental climate considerations'
                ]
            }
        };

        if (regionData[region]) {
            factorsContainer.innerHTML = regionData[region].factors.map(factor => 
                `<div class="factor">${factor}</div>`
            ).join('');
        }
    }

    setupRealTimeValidation() {
        const inputs = [
            { id: 'projectAddress', step: 2 },
            { id: 'squareFootage', step: 3 },
            { id: 'clientName', step: 4 },
            { id: 'clientEmail', step: 4 },
            { id: 'clientPhone', step: 4 }
        ];
        
        inputs.forEach(({ id, step }) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    if (this.currentStep === step) {
                        // Add visual feedback
                        this.validateInputField(input);
                        // Validate entire step
                        setTimeout(() => this.validateStep(this.currentStep), 100);
                    }
                });

                input.addEventListener('blur', () => {
                    if (this.currentStep === step) {
                        this.validateInputField(input);
                    }
                });
            }
        });
    }

    validateInputField(input) {
        const value = input.value.trim();
        let isValid = false;

        switch(input.id) {
            case 'projectAddress':
                isValid = value.length > 3;
                break;
            case 'squareFootage':
                isValid = parseInt(value) >= 100;
                break;
            case 'clientName':
                isValid = value.length > 0;
                break;
            case 'clientEmail':
                isValid = value.includes('@') && value.includes('.');
                break;
            case 'clientPhone':
                isValid = value.replace(/\D/g, '').length >= 10;
                break;
            default:
                isValid = value.length > 0;
        }

        // Update visual state
        input.classList.remove('valid', 'invalid');
        if (value.length > 0) {
            input.classList.add(isValid ? 'valid' : 'invalid');
        }

        return isValid;
    }

    validateStep(step) {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = false;
        let errorMessage = '';

        switch(step) {
            case 1:
                isValid = this.estimateData.projectType !== '';
                if (!isValid) errorMessage = 'Please select a project type to continue.';
                break;
            case 2:
                const location = document.getElementById('projectAddress')?.value || '';
                isValid = location.length > 3;
                if (!isValid) errorMessage = 'Please enter a valid project location (at least 4 characters).';
                break;
            case 3:
                const sqft = parseInt(document.getElementById('squareFootage')?.value) || 0;
                isValid = sqft >= 100;
                if (!isValid) errorMessage = 'Please enter a valid square footage (minimum 100 sq ft).';
                break;
            case 4:
                const name = document.getElementById('clientName')?.value || '';
                const email = document.getElementById('clientEmail')?.value || '';
                const phone = document.getElementById('clientPhone')?.value || '';
                const emailValid = email.includes('@') && email.includes('.');
                const phoneValid = phone.length >= 10;
                isValid = name.length > 0 && emailValid && phoneValid && this.estimateData.timeline;
                
                if (!isValid) {
                    if (!name) errorMessage = 'Please enter your full name.';
                    else if (!emailValid) errorMessage = 'Please enter a valid email address.';
                    else if (!phoneValid) errorMessage = 'Please enter a valid phone number (10+ digits).';
                    else if (!this.estimateData.timeline) errorMessage = 'Please select a project timeline.';
                }
                break;
            case 5:
                isValid = true;
                break;
        }

        // Update button states
        if (nextBtn) {
            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.5';
            nextBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        }

        if (submitBtn && step === 4) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
            submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        }

        // Show error message if invalid
        if (!isValid && errorMessage) {
            this.showStepError(errorMessage);
        } else {
            this.clearStepError();
        }

        return isValid;
    }

    showStepError(message) {
        // Remove existing error
        this.clearStepError();
        
        const currentStepElement = document.querySelector('.form-step.active');
        if (currentStepElement) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'step-error';
            errorDiv.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span>${message}</span>
                </div>
            `;
            currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        }
    }

    clearStepError() {
        const existingError = document.querySelector('.step-error');
        if (existingError) {
            existingError.remove();
        }
    }

    collectStepData() {
        switch(this.currentStep) {
            case 1:
                // Project type already collected in selectProjectType
                break;
            case 2:
                this.estimateData.location = document.getElementById('projectAddress')?.value || '';
                break;
            case 3:
                this.estimateData.squareFootage = parseInt(document.getElementById('squareFootage')?.value) || 0;
                this.estimateData.stories = document.getElementById('stories')?.value || '1';
                this.estimateData.constructionType = document.getElementById('constructionType')?.value || 'standard';
                this.estimateData.specialRequirements = document.getElementById('specialRequirements')?.value || '';
                break;
            case 4:
                this.estimateData.contactInfo = {
                    name: document.getElementById('clientName')?.value || '',
                    email: document.getElementById('clientEmail')?.value || '',
                    phone: document.getElementById('clientPhone')?.value || '',
                    company: document.getElementById('companyName')?.value || ''
                };
                break;
        }
        console.log('Step data collected:', this.estimateData);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step
            if (!this.validateStep(this.currentStep)) {
                return; // Don't advance if validation fails
            }

            // Collect data from current step
            this.collectStepData();

            // Move to next step
            this.currentStep++;
            this.updateStepDisplay();
            this.updateProgress();

            // Special handling for final step
            if (this.currentStep === 5) {
                this.generateEstimate();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgress();
            this.clearStepError();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            currentStepElement.classList.add('active');
            
            // Force reflow to ensure visibility
            currentStepElement.offsetHeight;
        }

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Save current state
        this.saveState();
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    async generateEstimate() {
        console.log('Starting estimate generation...');
        
        // Show loading state
        const loadingElement = document.querySelector('.loading-estimate');
        const resultsElement = document.getElementById('finalResults');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (resultsElement) resultsElement.style.display = 'none';

        try {
            // Simulate AI processing time with realistic steps
            await this.simulateAIProcessing();

            // Calculate estimate
            const estimate = this.calculateEstimate();
            console.log('Estimate calculated:', estimate);

            // Save to database
            await this.saveEstimateToDatabase();

            // Display results
            this.displayResults(estimate);

            // Hide loading, show results
            if (loadingElement) loadingElement.style.display = 'none';
            if (resultsElement) resultsElement.style.display = 'block';

            // Track successful completion
            this.trackEstimateCompletion(estimate);

        } catch (error) {
            console.error('Error generating estimate:', error);
            this.showEstimateError('Error generating estimate. Please try again or contact us directly.');
            
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    async simulateAIProcessing() {
        const stages = [
            'Analyzing project requirements...',
            'Calculating material costs...',
            'Evaluating labor requirements...',
            'Applying regional factors...',
            'Finalizing estimate...'
        ];

        const thinkingElement = document.querySelector('.ai-thinking h3');
        const descriptionElement = document.querySelector('.ai-thinking p');

        for (let i = 0; i < stages.length; i++) {
            if (thinkingElement) {
                thinkingElement.textContent = stages[i];
            }
            await this.delay(600);
        }

        if (descriptionElement) {
            descriptionElement.textContent = 'Estimate complete! Preparing your results...';
        }
        await this.delay(500);
    }

    showEstimateError(message) {
        const loadingElement = document.querySelector('.loading-estimate');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="estimate-error">
                    <div class="error-icon">❌</div>
                    <h3>Estimate Generation Failed</h3>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
                        <a href="contact.html" class="btn btn-secondary">Contact Us</a>
                    </div>
                </div>
            `;
        }
    }

    trackEstimateCompletion(estimate) {
        // Track successful estimate completion
        if (window.firebaseManager) {
            window.firebaseManager.trackEvent('estimate_completed', {
                project_type: this.estimateData.projectType,
                square_footage: this.estimateData.squareFootage,
                estimated_cost: estimate.low,
                timeline: this.estimateData.timeline
            });
        }

        // Google Analytics
        if (window.gtag) {
            gtag('event', 'estimate_completed', {
                event_category: 'engagement',
                event_label: this.estimateData.projectType,
                value: Math.round(estimate.low / 1000) // Value in thousands
            });
        }
    }

    calculateEstimate() {
        const { projectType, squareFootage, stories, constructionType, timeline } = this.estimateData;
        const factors = this.priceFactors[projectType] || this.priceFactors.commercial;
        
        console.log('Calculating estimate with data:', { projectType, squareFootage, stories, constructionType, timeline });
        
        // Base calculation
        let basePrice = factors.base * squareFootage * factors.multiplier;

        // Story multiplier
        const storyCount = parseInt(stories) || 1;
        if (storyCount > 1) {
            basePrice *= (1 + (storyCount - 1) * 0.15);
        }

        // Construction type multiplier
        const typeMultipliers = {
            basic: 0.8,
            standard: 1.0,
            premium: 1.3,
            luxury: 1.6
        };
        basePrice *= typeMultipliers[constructionType] || 1.0;

        // Timeline multiplier
        const timelineMultipliers = {
            immediate: 1.2,
            '1-3months': 1.0,
            '3-6months': 0.95,
            '6months+': 0.9
        };
        basePrice *= timelineMultipliers[timeline] || 1.0;

        // Location factors
        if (this.estimateData.locationFactors) {
            const locationFactor = Object.values(this.estimateData.locationFactors).reduce((a, b) => a + b, 0) / 3;
            basePrice *= locationFactor;
        }

        // Create range (±15%)
        const lowEstimate = Math.round(basePrice * 0.85);
        const highEstimate = Math.round(basePrice * 1.15);

        // Breakdown
        const materials = Math.round(basePrice * 0.4);
        const labor = Math.round(basePrice * 0.35);
        const permits = Math.round(basePrice * 0.1);
        const management = Math.round(basePrice * 0.15);

        // Timeline estimate based on square footage and complexity
        const baseWeeks = Math.ceil(squareFootage / 1000) * 2;
        const storyWeeks = (storyCount - 1) * 2;
        const typeWeeks = constructionType === 'luxury' ? 4 : constructionType === 'premium' ? 2 : 0;
        const totalWeeks = baseWeeks + storyWeeks + typeWeeks + 8; // Base 8 weeks minimum

        return {
            low: lowEstimate,
            high: highEstimate,
            breakdown: { materials, labor, permits, management },
            timeline: `${totalWeeks}-${totalWeeks + 4} weeks`
        };
    }

    displayResults(estimate) {
        // Update cost display
        document.getElementById('costLow').textContent = this.formatCurrency(estimate.low);
        document.getElementById('costHigh').textContent = this.formatCurrency(estimate.high);

        // Update breakdown
        document.getElementById('materialsCost').textContent = this.formatCurrency(estimate.breakdown.materials);
        document.getElementById('laborCost').textContent = this.formatCurrency(estimate.breakdown.labor);
        document.getElementById('permitsCost').textContent = this.formatCurrency(estimate.breakdown.permits);
        document.getElementById('managementCost').textContent = this.formatCurrency(estimate.breakdown.management);

        // Update timeline
        document.getElementById('estimatedTimeline').textContent = estimate.timeline;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    async submitEstimate() {
        try {
            // Collect final data
            this.collectStepData();

            // Submit to Firebase (placeholder)
            const result = await this.saveEstimateToDatabase();

            if (result.success) {
                this.nextStep(); // Move to results
            } else {
                this.showNotification('Error generating estimate. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting estimate:', error);
            this.showNotification('Error generating estimate. Please try again.', 'error');
        }
    }

    async saveEstimateToDatabase() {
        try {
            if (window.firebaseManager && window.firebaseManager.initialized) {
                // Save to Firebase
                const result = await window.firebaseManager.saveEstimate({
                    ...this.estimateData,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    source: 'ai_estimator'
                });
                console.log('Estimate saved to Firebase:', result.id);
                return result;
            } else {
                // Fallback to local storage
                const estimate = {
                    ...this.estimateData,
                    id: 'est_' + Date.now(),
                    timestamp: new Date().toISOString(),
                    synced: false
                };
                
                const estimates = JSON.parse(localStorage.getItem('mh_estimates') || '[]');
                estimates.push(estimate);
                localStorage.setItem('mh_estimates', JSON.stringify(estimates));
                
                console.log('Estimate saved locally:', estimate.id);
                return { success: true, id: estimate.id };
            }
        } catch (error) {
            console.error('Error saving estimate:', error);
            return { success: false, error: error.message };
        }
    }

    showNotification(message, type = 'info') {
        if (window.mhApp) {
            window.mhApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for buttons
function nextStep() {
    if (window.estimator) {
        window.estimator.nextStep();
    }
}

function previousStep() {
    if (window.estimator) {
        window.estimator.previousStep();
    }
}

function scheduleConsultation() {
    if (window.estimator && window.estimator.estimateData.contactInfo.email) {
        // Pre-fill contact form with estimate data
        const params = new URLSearchParams({
            action: 'consultation',
            type: window.estimator.estimateData.projectType,
            source: 'ai_estimator'
        });
        window.location.href = `contact.html?${params.toString()}`;
    } else {
        window.location.href = 'contact.html?action=consultation';
    }
}

function downloadEstimate() {
    if (window.estimator) {
        // Create a simple text version of the estimate
        const estimate = window.estimator.estimateData;
        const results = document.getElementById('finalResults');
        
        if (results) {
            // In a real implementation, this would generate a PDF
            console.log('Download estimate PDF for:', estimate.contactInfo.email);
            
            // Show success message
            if (window.mhApp) {
                window.mhApp.showNotification('Estimate summary will be sent to your email shortly.', 'success');
            }
            
            // Track download attempt
            if (window.firebaseManager) {
                window.firebaseManager.trackEvent('estimate_download_requested', {
                    project_type: estimate.projectType
                });
            }
        }
    }
}

function exploreProjects() {
    if (window.estimator && window.estimator.estimateData.projectType) {
        window.location.href = `projects.html?filter=${window.estimator.estimateData.projectType}`;
    } else {
        window.location.href = 'projects.html';
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for estimator form...');
    
    if (document.getElementById('estimatorForm')) {
        // Small delay to ensure all CSS is loaded
        setTimeout(() => {
            window.estimator = new ProjectEstimator();
            console.log('Estimator initialized and available globally');
            
            // Force a refresh of the display after initialization
            setTimeout(() => {
                if (window.estimator && window.estimator.initialized) {
                    window.estimator.ensureVisibility();
                }
            }, 100);
        }, 50);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.estimator && window.estimator.initialized) {
        // Refresh display when page becomes visible
        window.estimator.ensureVisibility();
    }
});

// Handle page refresh/reload
window.addEventListener('beforeunload', () => {
    if (window.estimator) {
        window.estimator.saveState();
    }
});
