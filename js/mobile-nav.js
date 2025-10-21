// Mobile Navigation System
class MobileNavigation {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.navMenu = document.querySelector('.nav-menu');
        this.navOverlay = this.createOverlay();
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.handleResize();
    }

    setupEventListeners() {
        // Toggle do menu mobile
        this.menuBtn.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Fechar menu ao clicar em links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Fechar menu ao clicar no overlay
        this.navOverlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Fechar menu com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Lidar com redimensionamento da tela
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Prevenir scroll quando menu está aberto
        this.preventBodyScroll();
    }

    setupAccessibility() {
        // ARIA attributes
        this.menuBtn.setAttribute('aria-expanded', 'false');
        this.menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
        this.navMenu.setAttribute('aria-hidden', 'true');
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        
        // Ativar elementos visuais
        this.menuBtn.classList.add('active');
        this.navMenu.classList.add('active');
        this.navOverlay.classList.add('active');
        
        // Atualizar acessibilidade
        this.menuBtn.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Travar foco dentro do menu
        this.trapFocus();
        
        // Disparar evento customizado
        this.dispatchEvent('mobileMenuOpen');
    }

    closeMenu() {
        this.isOpen = false;
        
        // Desativar elementos visuais
        this.menuBtn.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.navOverlay.classList.remove('active');
        
        // Atualizar acessibilidade
        this.menuBtn.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        // Liberar foco
        this.releaseFocus();
        
        // Disparar evento customizado
        this.dispatchEvent('mobileMenuClose');
    }

    trapFocus() {
        // Encontrar todos os elementos focáveis no menu
        const focusableElements = this.navMenu.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            this.firstFocusableElement = focusableElements[0];
            this.lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Adicionar event listener para trap de foco
            this.navMenu.addEventListener('keydown', this.handleTabKey.bind(this));
            
            // Focar no primeiro elemento
            setTimeout(() => {
                this.firstFocusableElement.focus();
            }, 100);
        }
    }

    handleTabKey(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === this.firstFocusableElement) {
                    e.preventDefault();
                    this.lastFocusableElement.focus();
                }
            } else {
                // Tab apenas
                if (document.activeElement === this.lastFocusableElement) {
                    e.preventDefault();
                    this.firstFocusableElement.focus();
                }
            }
        }
    }

    releaseFocus() {
        // Remover event listener de trap de foco
        this.navMenu.removeEventListener('keydown', this.handleTabKey.bind(this));
        
        // Retornar foco para o botão do menu
        this.menuBtn.focus();
    }

    preventBodyScroll() {
        // Observar mudanças no estado do menu para prevenir scroll
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (this.navMenu.classList.contains('active')) {
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                    }
                }
            });
        });

        observer.observe(this.navMenu, { attributes: true });
    }

    handleResize() {
        // Fechar menu ao redimensionar para desktop
        if (window.innerWidth > 768 && this.isOpen) {
            this.closeMenu();
        }
    }

    dispatchEvent(eventName) {
        const event = new CustomEvent(eventName, {
            detail: { isOpen: this.isOpen }
        });
        document.dispatchEvent(event);
    }

    // Métodos públicos para controle externo
    open() {
        this.openMenu();
    }

    close() {
        this.closeMenu();
    }

    // Destruir instância (para SPA)
    destroy() {
        this.menuBtn.removeEventListener('click', this.toggleMenu);
        this.navOverlay.remove();
        document.removeEventListener('keydown', this.handleKeydown);
    }
}

// Enhanced Touch Handling
class TouchNavigation {
    constructor() {
        this.startX = 0;
        this.currentX = 0;
        this.isSwiping = false;
        this.init();
    }

    init() {
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        // Swipe para abrir/fechar menu
        document.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.isSwiping = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isSwiping) return;
            
            this.currentX = e.touches[0].clientX;
            const diff = this.startX - this.currentX;

            // Swipe da direita para esquerda para abrir menu
            if (diff > 50 && this.startX < 50) {
                mobileNav.open();
                this.isSwiping = false;
            }
            
            // Swipe da esquerda para direita para fechar menu
            if (diff < -50 && mobileNav.isOpen) {
                mobileNav.close();
                this.isSwiping = false;
            }
        });

        document.addEventListener('touchend', () => {
            this.isSwiping = false;
        });
    }
}

// Inicialização
let mobileNav;

document.addEventListener('DOMContentLoaded', () => {
    mobileNav = new MobileNavigation();
    
    // Inicializar touch navigation apenas em dispositivos touch
    if ('ontouchstart' in window) {
        new TouchNavigation();
    }
});

// Export para uso global
window.MobileNavigation = MobileNavigation;

// Utilitários para outras partes da aplicação
window.mobileNavUtils = {
    openMenu: () => mobileNav?.open(),
    closeMenu: () => mobileNav?.close(),
    isMenuOpen: () => mobileNav?.isOpen || false
};