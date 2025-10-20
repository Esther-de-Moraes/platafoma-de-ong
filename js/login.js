// Sistema de Login Interativo
class LoginSystem {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.personaOptions = document.querySelectorAll('.persona-option');
        this.currentPersona = 'admin';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPersonaSelection();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Toggle de visibilidade da senha
        this.passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Efeitos de foco nos inputs
        const inputs = this.form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });

        // Validação em tempo real
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.clearAlerts();
            });
        });
    }

    setupPersonaSelection() {
        this.personaOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectPersona(option);
            });
        });
    }

    setupAnimations() {
        // Adicionar animações de entrada
        const elements = document.querySelectorAll('.fade-in-up');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });

        // Efeito de floating para elementos
        document.querySelectorAll('.floating').forEach(el => {
            el.style.animationDelay = `${Math.random() * 2}s`;
        });
    }

    selectPersona(option) {
        // Remove active de todas as opções
        this.personaOptions.forEach(opt => opt.classList.remove('active'));
        
        // Adiciona active à opção clicada
        option.classList.add('active');
        
        // Atualiza persona atual
        this.currentPersona = option.getAttribute('data-persona');
        
        // Atualiza interface baseado na persona
        this.updateInterfaceForPersona();
    }

    updateInterfaceForPersona() {
        const header = document.querySelector('.form-header h2');
        const submitButton = document.getElementById('loginButton');
        
        const personas = {
            'admin': {
                title: 'Acesse como Administrador',
                buttonText: 'Acessar Dashboard'
            },
            'volunteer': {
                title: 'Acesse como Voluntário',
                buttonText: 'Ver Oportunidades'
            },
            'donor': {
                title: 'Acesse como Doador',
                buttonText: 'Acompanhar Doações'
            }
        };

        const personaConfig = personas[this.currentPersona];
        if (personaConfig) {
            header.textContent = personaConfig.title;
            submitButton.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${personaConfig.buttonText}`;
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const icon = this.passwordToggle.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validação básica
        if (!this.validateForm(email, password)) {
            return;
        }

        // Mostrar estado de loading
        this.setLoadingState(true);

        try {
            // Simular chamada API
            const userData = await this.mockLoginAPI(email, password, rememberMe);
            
            // Sucesso
            this.showAlert('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Salvar dados do usuário
            this.saveUserData(userData);
            
            // Redirecionar após breve delay
            setTimeout(() => {
                this.redirectToDashboard();
            }, 2000);

        } catch (error) {
            // Erro
            this.showAlert(error.message, 'error');
            this.setLoadingState(false);
        }
    }

    validateForm(email, password) {
        this.clearAlerts();

        if (!email || !password) {
            this.showAlert('Por favor, preencha todos os campos.', 'error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('Por favor, insira um e-mail válido.', 'error');
            return false;
        }

        if (password.length < 6) {
            this.showAlert('A senha deve ter pelo menos 6 caracteres.', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async mockLoginAPI(email, password, rememberMe) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulação de credenciais válidas
                const validCredentials = [
                    'admin@nexusong.org',
                    'volunteer@nexusong.org', 
                    'donor@nexusong.org'
                ];

                if (validCredentials.includes(email.toLowerCase()) && password === '123456') {
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 1,
                            name: 'João Silva',
                            email: email,
                            persona: this.currentPersona,
                            organization: 'ONG Esperança',
                            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
                        },
                        rememberMe: rememberMe
                    });
                } else {
                    reject(new Error('E-mail ou senha incorretos. Tente novamente.'));
                }
            }, 1500);
        });
    }

    saveUserData(userData) {
        // Salvar no localStorage
        localStorage.setItem('userToken', userData.token);
        localStorage.setItem('userData', JSON.stringify(userData.user));
        
        // Se "Lembrar-me" estiver marcado, salvar por mais tempo
        if (userData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
    }

    setLoadingState(loading) {
        const button = document.getElementById('loginButton');
        const inputs = this.form.querySelectorAll('input, button');
        
        if (loading) {
            button.classList.add('loading');
            inputs.forEach(input => {
                if (input !== button) {
                    input.disabled = true;
                }
            });
        } else {
            button.classList.remove('loading');
            inputs.forEach(input => input.disabled = false);
        }
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            ${message}
        `;

        alertContainer.appendChild(alert);

        // Auto-remover após 5 segundos para sucesso, manter erro até interação
        if (type === 'success') {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    clearAlerts() {
        const alertContainer = document.getElementById('alertContainer');
        const alerts = alertContainer.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (alert.classList.contains('alert-error')) {
                alert.remove();
            }
        });
    }

    redirectToDashboard() {
        // Redirecionar baseado na persona
        const routes = {
            'admin': '/dashboard',
            'volunteer': '/projetos',
            'donor': '/projetos'
        };

        const targetRoute = routes[this.currentPersona] || '/';
        window.location.href = targetRoute;
    }

    // Métodos utilitários adicionais
    prefillDemoCredentials() {
        // Método para preencher credenciais de demo (apenas para desenvolvimento)
        if (window.location.search.includes('demo=true')) {
            document.getElementById('email').value = 'admin@nexusong.org';
            document.getElementById('password').value = '123456';
            document.getElementById('rememberMe').checked = true;
        }
    }

    handleSocialLogin(provider) {
        // Simulação de login social
        this.showAlert(`Redirecionando para login com ${provider}...`, 'success');
        
        // Em uma implementação real, aqui seria o redirecionamento para OAuth
        setTimeout(() => {
            this.showAlert(`Login com ${provider} não implementado em demonstração.`, 'error');
        }, 2000);
    }

    handleForgotPassword() {
        // Simulação de recuperação de senha
        const email = document.getElementById('email').value;
        
        if (!email || !this.isValidEmail(email)) {
            this.showAlert('Por favor, insira um e-mail válido para recuperar sua senha.', 'error');
            return;
        }

        this.showAlert(`Instruções de recuperação enviadas para ${email}`, 'success');
        
        // Simular envio de email
        setTimeout(() => {
            this.showAlert('Verifique sua caixa de entrada (demonstração).', 'success');
        }, 1000);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const loginSystem = new LoginSystem();
    
    // Tornar a instância global para acesso via console (apenas desenvolvimento)
    window.loginSystem = loginSystem;
    
    // Setup adicional após inicialização
    setupAdditionalFeatures();
});

// Configurações adicionais
function setupAdditionalFeatures() {
    // Login social
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = button.classList[1]; // google, facebook, linkedin
            window.loginSystem.handleSocialLogin(provider);
        });
    });

    // Recuperação de senha
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.loginSystem.handleForgotPassword();
        });
    }

    // Preencher credenciais de demo se especificado na URL
    if (window.location.search.includes('demo=true')) {
        window.loginSystem.prefillDemoCredentials();
    }

    // Adicionar efeitos de hover nos cards de persona
    const personaOptions = document.querySelectorAll('.persona-option');
    personaOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            if (!option.classList.contains('active')) {
                option.style.transform = 'translateY(-5px) scale(1.02)';
            }
        });

        option.addEventListener('mouseleave', () => {
            if (!option.classList.contains('active')) {
                option.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

// Utilitários globais
window.loginUtils = {
    // Verificar se usuário está logado
    isLoggedIn: () => {
        return localStorage.getItem('userToken') !== null;
    },

    // Obter dados do usuário
    getUserData: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Fazer logout
    logout: () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberMe');
        window.location.href = '/login';
    },

    // Verificar permissões baseado na persona
    hasPermission: (requiredPersona) => {
        const userData = window.loginUtils.getUserData();
        return userData && userData.persona === requiredPersona;
    }
};

// Handler para erros não capturados
window.addEventListener('error', (e) => {
    console.error('Erro não capturado:', e.error);
});

// Handler para promises rejeitadas não tratadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada não tratada:', e.reason);
    e.preventDefault();
});