// SPA Router and Core Application
class NexusSPA {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.templateManager = new TemplateManager();
        this.components = new ComponentManager();
        this.init();
    }

    init() {
        this.setupRouter();
        this.setupEventListeners();
        this.setupComponents();
        this.loadInitialRoute();
    }

    // Router Configuration
    setupRouter() {
        this.routes = {
            '/': {
                template: 'home',
                title: 'NexusONG - Plataforma Inteligente para Impacto Social',
                controller: this.homeController.bind(this)
            },
            '/projetos': {
                template: 'projects',
                title: 'Projetos Sociais - NexusONG',
                controller: this.projectsController.bind(this)
            },
            '/cadastro': {
                template: 'registration',
                title: 'Cadastro - NexusONG',
                controller: this.registrationController.bind(this)
            },
            '/dashboard': {
                template: 'dashboard',
                title: 'Dashboard - NexusONG',
                controller: this.dashboardController.bind(this),
                auth: true
            },
            '/login': {
                template: 'login',
                title: 'Login - NexusONG',
                controller: this.loginController.bind(this)
            }
        };
    }

    // Event Listeners for SPA
    setupEventListeners() {
        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(window.location.pathname);
        });

        // Intercept all link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });

        // Global error handling
        window.addEventListener('error', this.handleGlobalError.bind(this));
    }

    // Component System
    setupComponents() {
        this.components.register('navigation', NavigationComponent);
        this.components.register('user-profile', UserProfileComponent);
        this.components.register('project-card', ProjectCardComponent);
        this.components.register('stat-card', StatCardComponent);
    }

    // Route Handling
    async navigate(path, data = {}) {
        if (path === window.location.pathname) return;

        // Update browser history
        window.history.pushState(data, '', path);
        await this.handleRouteChange(path);
    }

    async handleRouteChange(path) {
        const route = this.routes[path] || this.routes['/'];
        
        // Check authentication for protected routes
        if (route.auth && !this.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        try {
            // Show loading state
            this.showLoading();

            // Load template
            const template = await this.templateManager.load(route.template);
            
            // Update page content
            this.renderPage(template, route);
            
            // Update current route
            this.currentRoute = route;
            
            // Update page title
            document.title = route.title;
            
            // Call route controller
            if (route.controller) {
                await route.controller();
            }

            // Initialize components for new page
            this.components.initializeAll();

            // Hide loading
            this.hideLoading();

            // Scroll to top
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Route change error:', error);
            this.showError('Erro ao carregar a página');
        }
    }

    // Page Rendering
    renderPage(template, route) {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App container not found');
            return;
        }

        // Use DOM diffing for efficient updates
        this.updateDOM(app, template);
        
        // Update active navigation
        this.updateNavigation(route);
    }

    // Efficient DOM Updates with Diffing
    updateDOM(container, newHTML) {
        const temp = document.createElement('div');
        temp.innerHTML = newHTML;

        // Simple DOM diffing algorithm
        this.diffAndUpdate(container, temp);
    }

    diffAndUpdate(oldNode, newNode) {
        if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
            oldNode.parentNode.replaceChild(newNode.cloneNode(true), oldNode);
            return;
        }

        if (oldNode.nodeType === Node.TEXT_NODE) {
            if (oldNode.textContent !== newNode.textContent) {
                oldNode.textContent = newNode.textContent;
            }
            return;
        }

        // Update attributes
        this.updateAttributes(oldNode, newNode);

        // Update children
        this.updateChildren(oldNode, newNode);
    }

    updateAttributes(oldNode, newNode) {
        const oldAttrs = oldNode.attributes;
        const newAttrs = newNode.attributes;

        // Remove old attributes
        for (let i = oldAttrs.length - 1; i >= 0; i--) {
            const attr = oldAttrs[i];
            if (!newNode.hasAttribute(attr.name)) {
                oldNode.removeAttribute(attr.name);
            }
        }

        // Set new attributes
        for (let i = 0; i < newAttrs.length; i++) {
            const attr = newAttrs[i];
            if (oldNode.getAttribute(attr.name) !== attr.value) {
                oldNode.setAttribute(attr.name, attr.value);
            }
        }
    }

    updateChildren(oldNode, newNode) {
        const oldChildren = Array.from(oldNode.childNodes);
        const newChildren = Array.from(newNode.childNodes);
        const maxLength = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < maxLength; i++) {
            if (i >= oldChildren.length) {
                // New node to add
                oldNode.appendChild(newChildren[i].cloneNode(true));
            } else if (i >= newChildren.length) {
                // Old node to remove
                oldNode.removeChild(oldChildren[i]);
            } else {
                // Update existing node
                this.diffAndUpdate(oldChildren[i], newChildren[i]);
            }
        }
    }

    // Navigation Management
    updateNavigation(route) {
        const navLinks = document.querySelectorAll('[data-route]');
        navLinks.forEach(link => {
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === route.template) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Route Controllers
    async homeController() {
        // Initialize home page specific functionality
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            this.initializeHeroAnimations(heroSection);
        }
    }

    async projectsController() {
        // Load projects data
        const projects = await this.loadProjects();
        this.renderProjects(projects);
    }

    async registrationController() {
        // Initialize registration form
        const formHandler = new FormHandler();
        await formHandler.init();
    }

    async dashboardController() {
        // Initialize dashboard
        const dashboard = new Dashboard();
        await dashboard.init();
    }

    async loginController() {
        // Initialize login form
        this.initializeLoginForm();
    }

    // Data Loading
    async loadProjects() {
        try {
            // Simulate API call
            const response = await fetch('/api/projects');
            return await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            return this.getSampleProjects();
        }
    }

    getSampleProjects() {
        return [
            {
                id: 1,
                title: 'Educação para Todos',
                description: 'Programa de alfabetização e reforço escolar',
                category: 'education',
                progress: 75,
                stats: { beneficiaries: 500, location: 'São Paulo, SP' }
            },
            // ... more sample projects
        ];
    }

    // Rendering Methods
    renderProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const projectsHTML = projects.map(project => 
            this.components.render('project-card', project)
        ).join('');

        container.innerHTML = projectsHTML;
        this.components.initializeAll();
    }

    // Utility Methods
    showLoading() {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>Carregando...</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="error-close">&times;</button>
            </div>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);

        errorDiv.querySelector('.error-close').addEventListener('click', () => {
            errorDiv.remove();
        });
    }

    isAuthenticated() {
        return localStorage.getItem('userToken') !== null;
    }

    // Initial Load
    loadInitialRoute() {
        this.handleRouteChange(window.location.pathname);
    }

    // Animation Helpers
    initializeHeroAnimations(heroSection) {
        // Add intersection observer for hero animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        });

        const animatedElements = heroSection.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));
    }

    initializeLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(new FormData(loginForm));
            });
        }
    }

    async handleLogin(formData) {
        try {
            // Simulate login API call
            const userData = await this.mockLoginAPI(formData);
            
            // Store authentication
            localStorage.setItem('userToken', userData.token);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Redirect to dashboard
            this.navigate('/dashboard');
            
        } catch (error) {
            this.showError('Erro no login. Verifique suas credenciais.');
        }
    }

    async mockLoginAPI(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        name: 'João Silva',
                        email: formData.get('email'),
                        role: 'admin'
                    }
                });
            }, 1000);
        });
    }
}

// Template Manager
class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.cache = new Map();
    }

    async load(templateName) {
        // Check cache first
        if (this.cache.has(templateName)) {
            return this.cache.get(templateName);
        }

        try {
            const response = await fetch(`/templates/${templateName}.html`);
            if (!response.ok) throw new Error('Template not found');
            
            const template = await response.text();
            
            // Cache the template
            this.cache.set(templateName, template);
            
            return template;
        } catch (error) {
            console.error('Template loading error:', error);
            return this.getFallbackTemplate(templateName);
        }
    }

    getFallbackTemplate(templateName) {
        const fallbacks = {
            'home': `<div class="error-template"><h1>Página Inicial</h1><p>Conteúdo não disponível</p></div>`,
            'projects': `<div class="error-template"><h1>Projetos</h1><p>Conteúdo não disponível</p></div>`,
            // ... more fallbacks
        };
        return fallbacks[templateName] || `<div>Template ${templateName} não encontrado</div>`;
    }

    preload(templateNames) {
        templateNames.forEach(name => this.load(name));
    }
}

// Initialize SPA when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nexusApp = new NexusSPA();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NexusSPA, TemplateManager };
}