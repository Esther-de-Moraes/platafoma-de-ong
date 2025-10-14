// Advanced Template System with Compilation and Caching
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.compiledTemplates = new Map();
        this.partials = new Map();
        this.delimiters = { start: '{{', end: '}}' };
        this.init();
    }

    init() {
        this.registerHelpers();
        this.preloadPartials();
    }

    // Template Registration
    register(name, template) {
        this.templates.set(name, template);
        this.compileTemplate(name, template);
    }

    registerPartial(name, partial) {
        this.partials.set(name, partial);
    }

    // Template Compilation
    compileTemplate(name, template) {
        const compiled = this.compile(template);
        this.compiledTemplates.set(name, compiled);
        return compiled;
    }

    compile(template) {
        // Convert template to executable function
        const tokens = this.parse(template);
        const code = this.generateCode(tokens);
        
        return new Function('data', `with(data){return ${code}}`);
    }

    parse(template) {
        const tokens = [];
        let position = 0;
        const { start, end } = this.delimiters;
        const startLength = start.length;
        const endLength = end.length;

        while (position < template.length) {
            const startIndex = template.indexOf(start, position);
            
            if (startIndex === -1) {
                // No more templates, add remaining text
                tokens.push({
                    type: 'text',
                    value: template.slice(position)
                });
                break;
            }

            // Add text before template
            if (startIndex > position) {
                tokens.push({
                    type: 'text',
                    value: template.slice(position, startIndex)
                });
            }

            const endIndex = template.indexOf(end, startIndex + startLength);
            if (endIndex === -1) {
                throw new Error('Unclosed template');
            }

            const expression = template.slice(startIndex + startLength, endIndex).trim();
            tokens.push({
                type: 'expression',
                value: expression
            });

            position = endIndex + endLength;
        }

        return tokens;
    }

    generateCode(tokens) {
        let code = '`';
        
        tokens.forEach(token => {
            if (token.type === 'text') {
                code += this.escapeString(token.value);
            } else if (token.type === 'expression') {
                code += '${' + this.processExpression(token.value) + '}';
            }
        });

        code += '`';
        return code;
    }

    processExpression(expression) {
        // Handle different expression types
        if (expression.startsWith('#')) {
            return this.processHelper(expression.slice(1));
        } else if (expression.startsWith('>')) {
            return this.processPartial(expression.slice(1).trim());
        } else if (expression.startsWith('each ')) {
            return this.processEach(expression.slice(5));
        } else if (expression.startsWith('if ')) {
            return this.processIf(expression.slice(3));
        } else {
            return this.processVariable(expression);
        }
    }

    processVariable(expression) {
        // Handle safe output (escape HTML)
        if (expression.endsWith('}}')) {
            expression = expression.slice(0, -2).trim();
            return `this.escape(${expression})`;
        }
        return expression;
    }

    processHelper(helperExpression) {
        const [helperName, ...args] = helperExpression.split(' ');
        return `this.helpers.${helperName}(${args.join(', ')})`;
    }

    processPartial(partialName) {
        return `this.renderPartial('${partialName}', data)`;
    }

    processEach(eachExpression) {
        const [variable, , collection] = eachExpression.split(' ');
        return `this.helpers.each(${collection}, function(${variable}) { return \`...\` })`;
    }

    processIf(ifExpression) {
        return `this.helpers.if(${ifExpression}, function() { return \`...\` })`;
    }

    escapeString(str) {
        return str.replace(/`/g, '\\`')
                  .replace(/\$/g, '\\$')
                  .replace(/\\(?!`)/g, '\\\\');
    }

    // Template Rendering
    render(name, data = {}) {
        const compiled = this.compiledTemplates.get(name);
        if (!compiled) {
            throw new Error(`Template "${name}" not found`);
        }

        try {
            const context = {
                ...data,
                helpers: this.helpers,
                escape: this.escape.bind(this),
                renderPartial: this.renderPartial.bind(this)
            };

            return compiled.call(context, context);
        } catch (error) {
            console.error('Template rendering error:', error);
            return `<div class="template-error">Erro ao renderizar template: ${name}</div>`;
        }
    }

    renderPartial(name, data) {
        const partial = this.partials.get(name);
        if (!partial) {
            return `<!-- Partial ${name} not found -->`;
        }

        const compiled = this.compileTemplate(`partial_${name}`, partial);
        return compiled.call(data, data);
    }

    // Helpers Registration
    registerHelpers() {
        this.helpers = {
            // Conditional helpers
            if: (condition, fn) => condition ? fn() : '',
            unless: (condition, fn) => !condition ? fn() : '',
            
            // Looping helpers
            each: (collection, fn) => {
                if (!Array.isArray(collection)) return '';
                return collection.map(fn).join('');
            },
            
            // String helpers
            uppercase: (str) => String(str).toUpperCase(),
            lowercase: (str) => String(str).toLowerCase(),
            capitalize: (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1),
            truncate: (str, length) => {
                str = String(str);
                return str.length > length ? str.slice(0, length) + '...' : str;
            },
            
            // Number helpers
            formatCurrency: (amount) => {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(amount);
            },
            
            formatNumber: (number) => {
                return new Intl.NumberFormat('pt-BR').format(number);
            },
            
            // Date helpers
            formatDate: (date) => {
                return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
            },
            
            // Comparison helpers
            eq: (a, b) => a === b,
            gt: (a, b) => a > b,
            lt: (a, b) => a < b,
            gte: (a, b) => a >= b,
            lte: (a, b) => a <= b,
            
            // Math helpers
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            multiply: (a, b) => a * b,
            divide: (a, b) => a / b,
            
            // Array helpers
            length: (array) => Array.isArray(array) ? array.length : 0,
            first: (array) => Array.isArray(array) ? array[0] : '',
            last: (array) => Array.isArray(array) ? array[array.length - 1] : '',
            
            // Object helpers
            json: (obj) => JSON.stringify(obj),
            
            // Custom helpers for our app
            progressBar: (percentage) => {
                return `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                `;
            },
            
            projectStatus: (status) => {
                const statusMap = {
                    'active': 'Ativo',
                    'completed': 'Concluído',
                    'planning': 'Planejamento'
                };
                return statusMap[status] || status;
            },
            
            projectCategory: (category) => {
                const categoryMap = {
                    'education': 'Educação',
                    'health': 'Saúde',
                    'environment': 'Meio Ambiente',
                    'development': 'Desenvolvimento'
                };
                return categoryMap[category] || category;
            }
        };
    }

    // Security
    escape(html) {
        if (typeof html !== 'string') return html;
        
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Preloading
    async preloadPartials() {
        const partials = ['header', 'footer', 'navigation'];
        
        for (const partial of partials) {
            try {
                const response = await fetch(`/templates/partials/${partial}.html`);
                if (response.ok) {
                    const content = await response.text();
                    this.registerPartial(partial, content);
                }
            } catch (error) {
                console.warn(`Could not load partial: ${partial}`);
            }
        }
    }

    // Batch Registration
    async registerTemplates(templateMap) {
        for (const [name, url] of Object.entries(templateMap)) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const template = await response.text();
                    this.register(name, template);
                }
            } catch (error) {
                console.error(`Failed to load template: ${name}`, error);
            }
        }
    }

    // Template Inheritance (Advanced)
    extend(baseTemplate, blockName, content) {
        // Implement template inheritance similar to Django/Jinja2
        const base = this.templates.get(baseTemplate);
        if (!base) return content;

        return base.replace(new RegExp(`{% block ${blockName} %}.*?{% endblock %}`, 's'), 
                           `{% block ${blockName} %}${content}{% endblock %}`);
    }
}

// Component Template System
class ComponentTemplates {
    constructor() {
        this.templates = new Map();
    }

    registerComponent(name, template, styles = '', scripts = '') {
        this.templates.set(name, {
            template,
            styles,
            scripts
        });

        // Inject styles if provided
        if (styles) {
            this.injectStyles(name, styles);
        }
    }

    injectStyles(componentName, css) {
        const styleId = `style-${componentName}`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    renderComponent(name, data = {}) {
        const component = this.templates.get(name);
        if (!component) {
            return `<div class="component-error">Component ${name} not found</div>`;
        }

        const engine = new TemplateEngine();
        const rendered = engine.render(name, data);

        // Schedule script execution for next tick
        if (component.scripts) {
            setTimeout(() => {
                this.executeScripts(component.scripts, data);
            }, 0);
        }

        return rendered;
    }

    executeScripts(script, data) {
        try {
            // Create a function with data context
            const func = new Function('data', 'component', script);
            func(data, this);
        } catch (error) {
            console.error('Component script error:', error);
        }
    }
}

// Initialize Template System
const templateEngine = new TemplateEngine();
const componentTemplates = new ComponentTemplates();

// Predefined Templates
const predefinedTemplates = {
    // Project Card Template
    'project-card': `
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
    `,

    // Stat Card Template
    'stat-card': `
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
    `,

    // User Profile Template
    'user-profile': `
        <div class="user-profile">
            <div class="user-avatar">
                <img src="{{ avatar }}" alt="{{ name }}">
            </div>
            <div class="user-info">
                <strong>{{ name }}</strong>
                <span>{{ role }} - {{ organization }}</span>
            </div>
            <div class="user-actions">
                <button class="btn btn-outline btn-sm" data-action="edit-profile">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `
};

// Register predefined templates
Object.entries(predefinedTemplates).forEach(([name, template]) => {
    templateEngine.register(name, template);
});

// Export for global use
window.TemplateEngine = templateEngine;
window.ComponentTemplates = componentTemplates;

// CSS for components
const componentStyles = `
    .template-error {
        background: #fee;
        border: 1px solid #fcc;
        padding: 1rem;
        border-radius: 4px;
        color: #c00;
    }

    .component-error {
        background: #ffeaa7;
        border: 1px solid #fdcb6e;
        padding: 0.5rem;
        border-radius: 4px;
        color: #e17055;
    }

    .global-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .loader-content {
        text-align: center;
    }

    .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .global-error {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 10001;
        max-width: 400px;
    }

    .error-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .error-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
    }
`;

// Inject global styles
const style = document.createElement('style');
style.textContent = componentStyles;
document.head.appendChild(style);