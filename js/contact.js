// Contact Form Handling

class ContactManager {
    constructor() {
        this.forms = {
            consultation: document.getElementById('consultationForm'),
            general: document.getElementById('generalForm')
        };
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFormSubmissions();
        this.handleURLParams();
        console.log('Contact Manager initialized');
    }

    setupFormValidation() {
        Object.values(this.forms).forEach(form => {
            if (!form) return;

            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    validateField(field) {
        const isValid = this.checkFieldValidity(field);
        this.updateFieldDisplay(field, isValid);
        return isValid;
    }

    checkFieldValidity(field) {
        if (!field.value.trim()) {
            field.errorMessage = 'This field is required';
            return false;
        }

        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.errorMessage = 'Please enter a valid email address';
                return false;
            }
        }

        if (field.type === 'tel') {
            const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
            if (field.value && !phoneRegex.test(field.value)) {
                field.errorMessage = 'Please enter a valid phone number';
                return false;
            }
        }

        return true;
    }

    updateFieldDisplay(field, isValid) {
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }

        field.classList.remove('error', 'valid');

        if (!isValid) {
            field.classList.add('error');
            const error = document.createElement('span');
            error.className = 'field-error';
            error.textContent = field.errorMessage || 'Invalid input';
            field.parentNode.appendChild(error);
        } else if (field.value.trim()) {
            field.classList.add('valid');
        }
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }

    setupFormSubmissions() {
        if (this.forms.consultation) {
            this.forms.consultation.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleConsultationSubmission(e.target);
            });
        }

        if (this.forms.general) {
            this.forms.general.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGeneralSubmission(e.target);
            });
        }
    }

    async handleConsultationSubmission(form) {
        if (!this.validateForm(form)) {
            this.showFormError('Please correct the errors above');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        this.setSubmitState(submitButton, true);

        try {
            const formData = this.collectFormData(form);
            const result = await this.submitConsultation(formData);

            if (result.success) {
                this.showSuccessMessage('Consultation request submitted! We\'ll contact you within 24 hours.');
                form.reset();
                this.clearFormErrors(form);
                
                // Track conversion
                this.trackConversion('consultation_request', formData);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Consultation submission error:', error);
            this.showFormError('Error submitting request. Please try again or call us directly.');
        } finally {
            this.setSubmitState(submitButton, false, originalText);
        }
    }

    async handleGeneralSubmission(form) {
        if (!this.validateForm(form)) {
            this.showFormError('Please correct the errors above');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        this.setSubmitState(submitButton, true);

        try {
            const formData = this.collectFormData(form);
            const result = await this.submitGeneralInquiry(formData);

            if (result.success) {
                this.showSuccessMessage('Message sent successfully! We\'ll respond within 4 hours during business days.');
                form.reset();
                this.clearFormErrors(form);
                
                // Track engagement
                this.trackConversion('general_inquiry', formData);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('General inquiry submission error:', error);
            this.showFormError('Error sending message. Please try again or call us directly.');
        } finally {
            this.setSubmitState(submitButton, false, originalText);
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add metadata
        data.timestamp = new Date().toISOString();
        data.source = 'website_contact_form';
        data.userAgent = navigator.userAgent;
        data.page = window.location.pathname;

        return data;
    }

    async submitConsultation(data) {
        // Simulate API call - replace with actual Firebase/backend integration
        console.log('Submitting consultation request:', data);
        
        // Simulate processing time
        await this.delay(1500);
        
        // For now, always return success
        return { 
            success: true, 
            id: 'consult_' + Date.now(),
            message: 'Consultation request received'
        };
    }

    async submitGeneralInquiry(data) {
        // Simulate API call - replace with actual Firebase/backend integration
        console.log('Submitting general inquiry:', data);
        
        // Simulate processing time
        await this.delay(1200);
        
        // For now, always return success
        return { 
            success: true, 
            id: 'inquiry_' + Date.now(),
            message: 'General inquiry received'
        };
    }

    setSubmitState(button, isSubmitting, originalText = '') {
        if (isSubmitting) {
            button.disabled = true;
            button.innerHTML = '<div class="loading"></div> Submitting...';
        } else {
            button.disabled = false;
            button.textContent = originalText || button.textContent;
        }
    }

    showSuccessMessage(message) {
        if (window.mhApp) {
            window.mhApp.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showFormError(message) {
        if (window.mhApp) {
            window.mhApp.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    clearFormErrors(form) {
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const projectType = urlParams.get('type');

        if (action === 'consultation') {
            // Scroll to consultation form
            const consultForm = document.querySelector('#consultationForm');
            if (consultForm) {
                consultForm.scrollIntoView({ behavior: 'smooth' });
                consultForm.querySelector('input').focus();
            }
        }

        if (projectType && this.forms.consultation) {
            const projectSelect = this.forms.consultation.querySelector('#project-type');
            if (projectSelect) {
                projectSelect.value = projectType;
            }
        }
    }

    trackConversion(eventName, data) {
        // Google Analytics tracking
        if (window.gtag) {
            gtag('event', eventName, {
                event_category: 'contact',
                event_label: data.projectType || data.inquiryType || 'general',
                value: 1
            });
        }

        // Facebook Pixel tracking
        if (window.fbq) {
            fbq('track', 'Lead', {
                content_category: data.projectType || 'general',
                source: 'website_form'
            });
        }

        console.log('Conversion tracked:', eventName, data);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.contact-form')) {
        window.contactManager = new ContactManager();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactManager;
}
