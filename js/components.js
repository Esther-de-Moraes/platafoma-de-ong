// Component System with Lifecycle Management
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.instances = new Map();
        this.init();
    }

    init() {
        this.setupMutationObserver();
    }

    // Component Registration
    register(name, ComponentClass) {
        this.components.set(name, ComponentClass);
        
        // Auto-initialize existing components
        this.initializeComponents(name);
    }

    // Component Initialization
    initializeComponents(componentName = null) {
        const componentsToInitialize = componentName ? 
            [componentName] : Array.from(this.components.keys());

        componentsToInitialize.forEach(name => {
            const selector = `[data-component="${name}"]`;
            const elements = document.querySelectorAll(selector);
            
            elements.forEach((element, index) => {
                const instanceId = `${name}-${index}`;
                
                // Skip if already initialized
                if (this.instances.has(instanceId)) return;

                const ComponentClass = this.components.get(name);
                if (ComponentClass) {
                    const instance = new ComponentClass(element);
                    this.instances.set(instanceId, instance);
                    
                    // Initialize if method exists
                    if (typeof instance.init === 'function') {
                        instance.init();
                    }
                }
            });
        });
    }

    initializeAll() {
        this.initializeComponents();
    }

    // Dynamic Component Handling
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.handleNewNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleNewNode(node) {
        // Check if node has component attribute
        if (node.hasAttribute && node.hasAttribute('data-component')) {
            const componentName = node.getAttribute('data-component');
            this.initializeComponents(componentName);
        }

        // Check children for components
        const componentElements = node.querySelectorAll ? 
            node.querySelectorAll('[data-component]') : [];
        
        componentElements.forEach(element => {
            const componentName = element.getAttribute('data-component');
            this.initializeComponents(componentName);
        });
    }

    // Component Rendering
    render(componentName, data = {}) {
        const ComponentClass = this.components.get(componentName);
        if (!ComponentClass) {
            console.error(`Component ${componentName} not registered`);
            return '';
        }

        // Use template engine if available
        if (window.TemplateEngine && ComponentClass.template) {
            return window.TemplateEngine.render(componentName, data);
        }

        // Fallback to component's render method
        const tempElement = document.createElement('div');
        const instance = new ComponentClass(tempElement);
        
        if (typeof instance.render === 'function') {
            return instance.render(data);
        }

        return `<div data-component="${componentName}"></div>`;
    }

    // Component Destruction
    destroyComponent(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
        this.instances.delete(instanceId);
    }

    // Utility Methods
    getInstance(componentName, index = 0) {
        const instanceId = `${componentName}-${index}`;
        return this.instances.get(instanceId);
    }

    getAllInstances(componentName) {
        return Array.from(this.instances.entries())
            .filter(([key]) => key.startsWith(componentName))
            .map(([, instance]) => instance);
    }
}

// Base Component Class
class BaseComponent {
    constructor(element) {
        this.element = element;
        this.data = {};
        this.events = {};
    }

    // Lifecycle Methods
    init() {
        this.bindEvents();
        this.render();
    }

    destroy() {
        this.unbindEvents();
    }

    // Event Handling
    bindEvents() {
        // To be implemented by child components
    }

    unbindEvents() {
        Object.values(this.events).forEach(unbind => unbind());
        this.events = {};
    }

    on(event, selector, handler) {
        const boundedHandler = (e) => {
            if (e.target.matches(selector) || e.target.closest(selector)) {
                handler.call(this, e);
            }
        };

        this.element.addEventListener(event, boundedHandler);
        
        // Store for cleanup
        const eventKey = `${event}-${selector}`;
        this.events[eventKey] = () => {
            this.element.removeEventListener(event, boundedHandler);
        };
    }

    // Data Management
    setData(newData) {
        this.data = { ...this.data, ...newData };
        this.render();
    }

    updateData(updater) {
        this.data = updater(this.data);
        this.render();
    }

    // Rendering
    render() {
        // To be implemented by child components
    }

    // Utility Methods
    query(selector) {
        return this.element.querySelector(selector);
    }

    queryAll(selector) {
        return this.element.querySelectorAll(selector);
    }

    emit(eventName, detail) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail
        });
        this.element.dispatchEvent(event);
    }
}

// Specific Component Implementations
class NavigationComponent extends BaseComponent {
    init() {
        super.init();
        this.setupMobileNavigation();
        this.updateActiveState();
    }

    bindEvents() {
        this.on('click', '[data-route]', this.handleRouteClick.bind(this));
        this.on('click', '.mobile-menu-btn', this.toggleMobileMenu.bind(this));
    }

    handleRouteClick(e) {
        e.preventDefault();
        const route = e.target.closest('[data-route]').getAttribute('data-route');
        
        if (window.nexusApp) {
            window.nexusApp.navigate(`/${route}`);
        }
    }

    toggleMobileMenu() {
        const navMenu = this.query('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }

    setupMobileNavigation() {
        // Add mobile-specific functionality
        if (window.innerWidth <= 768) {
            this.element.classList.add('mobile-navigation');
        }
    }

    updateActiveState() {
        const currentPath = window.location.pathname.slice(1) || 'home';
        const navLinks = this.queryAll('[data-route]');
        
        navLinks.forEach(link => {
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    render() {
        // Navigation is mostly static, but could be dynamic based on auth state
        const isAuthenticated = localStorage.getItem('userToken');
        
        const authElements = this.queryAll('[data-auth]');
        authElements.forEach(element => {
            const shouldShow = element.getAttribute('data-auth') === 'true' ? 
                isAuthenticated : !isAuthenticated;
            
            element.style.display = shouldShow ? '' : 'none';
        });
    }
}

class ProjectCardComponent extends BaseComponent {
    static template = `
        <article class="project-card" data-project-id="{{ id }}">
            <div class="project-image">
                <img src="{{ image }}" alt="{{ title }}" loading="lazy">
                <div class="project-badge {{ category }}">{{#category category }}</div>
            </div>
            <div class="project-content">
                <h3>{{ title }}</h3>
                <p>{{ description }}</p>
                
                <div class="project-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>{{ stats.beneficiaries }}+ beneficiados</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>{{ stats.location }}</span>
                    </div>
                </div>
                
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ progress }}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>{{ progress }}% concluído</span>
                        <span>{{#formatCurrency stats.budget }}/{{#formatCurrency stats.goal }}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-primary" data-action="view-details">
                        <i class="fas fa-info-circle"></i>
                        Saber Mais
                    </button>
                    <button class="btn btn-outline" data-action="support-project">
                        <i class="fas fa-hand-holding-heart"></i>
                        Apoiar
                    </button>
                </div>
            </div>
        </article>
    `;

    bindEvents() {
        this.on('click', '[data-action="view-details"]', this.handleViewDetails.bind(this));
        this.on('click', '[data-action="support-project"]', this.handleSupport.bind(this));
    }

    handleViewDetails(e) {
        const projectId = this.element.getAttribute('data-project-id');
        this.emit('project:view', { projectId });
        
        // Show project details modal
        this.showProjectModal(projectId);
    }

    handleSupport(e) {
        const projectId = this.element.getAttribute('data-project-id');
        this.emit('project:support', { projectId });
        
        // Navigate to support page or show support modal
        if (window.nexusApp) {
            window.nexusApp.navigate(`/projetos/${projectId}/apoiar`);
        }
    }

    async showProjectModal(projectId) {
        // Implementation for project details modal
        console.log('Showing project modal for:', projectId);
    }

    render() {
        if (window.TemplateEngine) {
            this.element.innerHTML = window.TemplateEngine.render('project-card', this.data);
        }
    }
}

class UserProfileComponent extends BaseComponent {
    init() {
        super.init();
        this.loadUserData();
    }

    bindEvents() {
        this.on('click', '[data-action="edit-profile"]', this.handleEditProfile.bind(this));
    }

    async loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                this.setData(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    handleEditProfile() {
        this.emit('profile:edit');
        // Show edit profile modal or navigate to settings
    }

    render() {
        if (window.TemplateEngine) {
            this.element.innerHTML = window.TemplateEngine.render('user-profile', this.data);
        }
    }
}

class StatCardComponent extends BaseComponent {
    static template = `
        <div class="stat-card {{#if trend }}trend-{{ trend }}{{/if}}">
            <div class="stat-icon {{ type }}">
                <i class="{{ icon }}"></i>
            </div>
            <div class="stat-info">
                <h3>{{#formatNumber value }}</h3>
                <p>{{ label }}</p>
            </div>
            {{#if trend }}
            <div class="stat-trend {{ trend }}">
                <i class="fas fa-arrow-{{ trend }}"></i>
                <span>{{ change }}%</span>
            </div>
            {{/if}}
        </div>
    `;

    render() {
        if (window.TemplateEngine) {
            this.element.innerHTML = window.TemplateEngine.render('stat-card', this.data);
        }
    }
}

// Initialize Component System
const componentManager = new ComponentManager();

// Register components
componentManager.register('navigation', NavigationComponent);
componentManager.register('project-card', ProjectCardComponent);
componentManager.register('user-profile', UserProfileComponent);
componentManager.register('stat-card', StatCardComponent);

// Export for global use
window.ComponentManager = componentManager;
window.BaseComponent = BaseComponent;

// Auto-initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    componentManager.initializeAll();
});