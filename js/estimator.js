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
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.updateStepDisplay();
        console.log('Project Estimator initialized');
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
        
        // Auto-advance after selection
        setTimeout(() => {
            this.nextStep();
        }, 500);
    }

    selectTimeline(element) {
        // Remove previous selections
        document.querySelectorAll('.timeline-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection
        element.classList.add('selected');
        this.estimateData.timeline = element.dataset.timeline;
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
        const inputs = ['squareFootage', 'clientName', 'clientEmail', 'clientPhone'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.validateStep(this.currentStep);
                });
            }
        });
    }

    validateStep(step) {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = false;

        switch(step) {
            case 1:
                isValid = this.estimateData.projectType !== '';
                break;
            case 2:
                isValid = this.estimateData.location.length > 3;
                break;
            case 3:
                const sqft = document.getElementById('squareFootage').value;
                isValid = sqft && parseInt(sqft) > 0;
                break;
            case 4:
                const name = document.getElementById('clientName').value;
                const email = document.getElementById('clientEmail').value;
                const phone = document.getElementById('clientPhone').value;
                isValid = name && email && phone && this.estimateData.timeline;
                break;
            case 5:
                isValid = true;
                break;
        }

        if (nextBtn) {
            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.5';
        }

        if (submitBtn && step === 4) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
        }

        return isValid;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step
            if (!this.validateStep(this.currentStep)) {
                this.showNotification('Please complete all required fields', 'error');
                return;
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
        }
    }

    collectStepData() {
        switch(this.currentStep) {
            case 2:
                this.estimateData.location = document.getElementById('projectAddress').value;
                break;
            case 3:
                this.estimateData.squareFootage = parseInt(document.getElementById('squareFootage').value) || 0;
                this.estimateData.stories = document.getElementById('stories').value;
                this.estimateData.constructionType = document.getElementById('constructionType').value;
                this.estimateData.specialRequirements = document.getElementById('specialRequirements').value;
                break;
            case 4:
                this.estimateData.contactInfo = {
                    name: document.getElementById('clientName').value,
                    email: document.getElementById('clientEmail').value,
                    phone: document.getElementById('clientPhone').value,
                    company: document.getElementById('companyName').value
                };
                break;
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
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
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === 4) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else if (this.currentStep === 5) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    async generateEstimate() {
        // Show loading state
        const loadingElement = document.querySelector('.loading-estimate');
        const resultsElement = document.getElementById('finalResults');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (resultsElement) resultsElement.style.display = 'none';

        // Simulate AI processing time
        await this.delay(3000);

        // Calculate estimate
        const estimate = this.calculateEstimate();

        // Display results
        this.displayResults(estimate);

        // Hide loading, show results
        if (loadingElement) loadingElement.style.display = 'none';
        if (resultsElement) resultsElement.style.display = 'block';
    }

    calculateEstimate() {
        const { projectType, squareFootage, stories, constructionType, timeline } = this.estimateData;
        const factors = this.priceFactors[projectType] || this.priceFactors.commercial;
        
        // Base calculation
        let basePrice = factors.base * squareFootage * factors.multiplier;

        // Story multiplier
        if (stories > 1) {
            basePrice *= (1 + (parseInt(stories) - 1) * 0.15);
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

        // Timeline estimate
        const timelineWeeks = Math.ceil(squareFootage / 1000) * 2 + (parseInt(stories) - 1) * 2;

        return {
            low: lowEstimate,
            high: highEstimate,
            breakdown: { materials, labor, permits, management },
            timeline: `${timelineWeeks}-${timelineWeeks + 4} weeks`
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
        // Placeholder for Firebase integration
        console.log('Saving estimate data:', this.estimateData);
        
        // Simulate API call
        await this.delay(1000);
        
        return { success: true, id: 'est_' + Date.now() };
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
    window.location.href = 'contact.html?action=consultation';
}

function downloadEstimate() {
    if (window.estimator) {
        // Create and download PDF (placeholder)
        console.log('Download estimate PDF');
        window.estimator.showNotification('Estimate PDF will be sent to your email', 'success');
    }
}

function exploreProjects() {
    window.location.href = 'project-viewer.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('estimatorForm')) {
        window.estimator = new ProjectEstimator();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectEstimator;
}
