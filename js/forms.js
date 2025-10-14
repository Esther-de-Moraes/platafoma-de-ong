// Forms JavaScript - Handles form validation and interactions

class FormHandler {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupPersonaSelection();
        this.setupFormNavigation();
        this.setupInputMasks();
        this.setupValidation();
    }

    // Persona Selection
    setupPersonaSelection() {
        const personaOptions = document.querySelectorAll('.persona-option');
        
        personaOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                personaOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
                
                // Store selected persona
                this.formData.persona = option.dataset.persona;
                
                // Update form based on persona
                this.updateFormForPersona(option.dataset.persona);
            });
        });

        // Check URL parameters for persona type
        const urlParams = new URLSearchParams(window.location.search);
        const personaParam = urlParams.get('type');
        if (personaParam) {
            const targetOption = document.querySelector(`[data-persona="${personaParam}"]`);
            if (targetOption) {
                targetOption.click();
            }
        }
    }

    updateFormForPersona(persona) {
        const orgSection = document.getElementById('organization-info');
        
        switch (persona) {
            case 'admin':
                if (orgSection) orgSection.style.display = 'block';
                break;
            case 'volunteer':
            case 'donor':
                if (orgSection) orgSection.style.display = 'none';
                break;
        }
    }

    // Multi-step Form Navigation
    setupFormNavigation() {
        window.nextStep = (nextSectionId) => {
            const currentSection = document.querySelector('.form-section.active');
            const nextSection = document.getElementById(nextSectionId);
            
            if (this.validateSection(currentSection.id)) {
                currentSection.classList.remove('active');
                nextSection.classList.add('active');
                this.currentStep++;
                this.updateProgress();
            }
        };

        window.prevStep = (prevSectionId) => {
            const currentSection = document.querySelector('.form-section.active');
            const prevSection = document.getElementById(prevSectionId);
            
            currentSection.classList.remove('active');
            prevSection.classList.add('active');
            this.currentStep--;
            this.updateProgress();
        };
    }

    updateProgress() {
        const progressElement = document.querySelector('.form-progress');
        if (progressElement) {
            const progress = (this.currentStep / 4) * 100;
            progressElement.style.width = `${progress}%`;
        }
    }

    validateSection(sectionId) {
        const section = document.getElementById(sectionId);
        const inputs = section.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                this.showFieldError(input, 'Este campo é obrigatório');
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    // Input Masks
    setupInputMasks() {
        this.setupCPFMask();
        this.setupPhoneMask();
        this.setupCEPMask();
        this.setupCNPJMask();
    }

    setupCPFMask() {
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                }
                
                e.target.value = value;
            });
        }
    }

    setupPhoneMask() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 11) {
                    if (value.length <= 10) {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{4})(\d)/, '$1-$2');
                    } else {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                }
                
                e.target.value = value;
            });
        }
    }

    setupCEPMask() {
        const cepInput = document.getElementById('cep');
        if (cepInput) {
            cepInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 8) {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                
                e.target.value = value;
                
                // Auto-fill address when CEP is complete
                if (value.length === 9) {
                    this.fetchAddress(value.replace('-', ''));
                }
            });
        }
    }

    setupCNPJMask() {
        const cnpjInput = document.getElementById('cnpj');
        if (cnpjInput) {
            cnpjInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length <= 14) {
                    value = value.replace(/(\d{2})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1/$2');
                    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                }
                
                e.target.value = value;
            });
        }
    }

    // Address Auto-fill via API
    async fetchAddress(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('street').value = data.logradouro || '';
                document.getElementById('neighborhood').value = data.bairro || '';
                document.getElementById('city').value = data.localidade || '';
                document.getElementById('state').value = data.uf || '';
            } else {
                this.showNotification('CEP não encontrado. Verifique o CEP informado.', 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.showNotification('Erro ao buscar CEP. Tente novamente.', 'error');
        }
    }

    // Form Validation
    setupValidation() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm()) {
                    this.submitForm();
                }
            });
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                this.showFieldError(field, 'Este campo é obrigatório');
            }
        });

        // Validate email
        const emailField = document.getElementById('email');
        if (emailField && !this.isValidEmail(emailField.value)) {
            isValid = false;
            this.showFieldError(emailField, 'Por favor, insira um e-mail válido');
        }

        // Validate password confirmation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            isValid = false;
            this.showFieldError(confirmPassword, 'As senhas não coincidem');
        }

        // Validate terms acceptance
        const terms = document.getElementById('terms');
        if (terms && !terms.checked) {
            isValid = false;
            this.showFieldError(terms, 'Você deve aceitar os termos e condições');
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        
        if (field.type === 'email') {
            return this.isValidEmail(value);
        }
        
        if (field.type === 'checkbox') {
            return field.checked;
        }
        
        return value !== '';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.5rem';
        
        field.parentNode.appendChild(errorElement);
        field.style.borderColor = 'var(--error)';
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }

    // Form Submission
    async submitForm() {
        try {
            // Collect form data
            const formData = new FormData(document.getElementById('registrationForm'));
            const data = Object.fromEntries(formData);
            
            // Add persona data
            if (this.formData.persona) {
                data.persona = this.formData.persona;
            }

            // Simulate API call
            await this.simulateAPICall(data);
            
            this.showNotification('Cadastro realizado com sucesso!', 'success');
            
            // Redirect to appropriate page based on persona
            setTimeout(() => {
                switch (data.persona) {
                    case 'admin':
                        window.location.href = 'dashboard.html';
                        break;
                    case 'volunteer':
                        window.location.href = 'projetos.html';
                        break;
                    case 'donor':
                        window.location.href = 'projetos.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            }, 2000);

        } catch (error) {
            this.showNotification('Erro ao realizar cadastro. Tente novamente.', 'error');
        }
    }

    simulateAPICall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data submitted:', data);
                resolve();
            }, 1500);
        });
    }

    showNotification(message, type = 'success') {
        // Use the notification system from main.js if available
        if (window.nexusApp && typeof window.nexusApp.showNotification === 'function') {
            window.nexusApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});

// Make functions available globally for inline onclick handlers
window.nextStep = (step) => {
    const formHandler = new FormHandler();
    formHandler.nextStep(step);
};

window.prevStep = (step) => {
    const formHandler = new FormHandler();
    formHandler.prevStep(step);
};