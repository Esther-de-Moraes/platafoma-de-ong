// Mobile Navigation System - CORRIGIDO
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
        
        // Garantir que o menu comece fechado
        this.closeMenu();
    }

    setupEventListeners() {
        // Toggle do menu mobile - CORRIGIDO
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Fechar menu ao clicar em links - CORRIGIDO
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Permitir que os links funcionem normalmente
                if (link.getAttribute('href') && link.getAttribute('href') !== '#') {
                    setTimeout(() => {
                        this.closeMenu();
                    }, 300);
                } else {
                    e.preventDefault();
                    this.closeMenu();
                }
            });
        });

        // Fechar menu ao clicar no overlay - CORRIGIDO
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Fechar menu com ESC - CORRIGIDO
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
        // ARIA attributes - CORRIGIDO
        if (this.menuBtn) {
            this.menuBtn.setAttribute('aria-expanded', 'false');
            this.menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
            this.menuBtn.setAttribute('aria-controls', 'nav-menu');
        }
        
        if (this.navMenu) {
            this.navMenu.setAttribute('aria-hidden', 'true');
            this.navMenu.id = 'nav-menu';
        }
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
        if (!this.navMenu || !this.menuBtn || !this.navOverlay) return;
        
        this.isOpen = true;
        
        // Ativar elementos visuais - CORRIGIDO
        this.menuBtn.classList.add('active');
        this.navMenu.classList.add('active');
        this.navOverlay.classList.add('active');
        
        // Mostrar o menu
        this.navMenu.style.display = 'flex';
        
        // Atualizar acessibilidade
        this.menuBtn.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Travar foco dentro do menu
        this.trapFocus();
        
        // Disparar evento customizado
        this.dispatchEvent('mobileMenuOpen');
        
        console.log('Menu mobile aberto');
    }

    closeMenu() {
        if (!this.navMenu || !this.menuBtn || !this.navOverlay) return;
        
        this.isOpen = false;
        
        // Desativar elementos visuais - CORRIGIDO
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
        
        console.log('Menu mobile fechado');
    }

    trapFocus() {
        if (!this.navMenu) return;
        
        // Encontrar todos os elementos focáveis no menu
        const focusableElements = this.navMenu.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            this.firstFocusableElement = focusableElements[0];
            this.lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Adicionar event listener para trap de foco
            this.boundHandleTabKey = this.handleTabKey.bind(this);
            this.navMenu.addEventListener('keydown', this.boundHandleTabKey);
            
            // Focar no primeiro elemento
            setTimeout(() => {
                if (this.firstFocusableElement) {
                    this.firstFocusableElement.focus();
                }
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
        if (this.boundHandleTabKey) {
            this.navMenu.removeEventListener('keydown', this.boundHandleTabKey);
        }
        
        // Retornar foco para o botão do menu
        if (this.menuBtn) {
            this.menuBtn.focus();
        }
    }

    preventBodyScroll() {
        // Observar mudanças no estado do menu para prevenir scroll
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (this.navMenu.classList.contains('active')) {
                        document.body.style.overflow = 'hidden';
                        document.documentElement.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }
                }
            });
        });

        if (this.navMenu) {
            observer.observe(this.navMenu, { attributes: true });
        }
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
        if (this.menuBtn) {
            this.menuBtn.removeEventListener('click', this.toggleMenu);
        }
        if (this.navOverlay) {
            this.navOverlay.remove();
        }
    }
}

// Inicialização CORRIGIDA
function initMobileNavigation() {
    // Verificar se estamos em mobile
    if (window.innerWidth <= 768) {
        const mobileNav = new MobileNavigation();
        window.mobileNav = mobileNav;
        
        // Adicionar ao escopo global para debug
        console.log('Mobile Navigation inicializado');
        
        return mobileNav;
    }
    return null;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que tudo carregou
    setTimeout(() => {
        window.mobileNavInstance = initMobileNavigation();
    }, 100);
});

// Re-inicializar quando a janela for redimensionada
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768 && !window.mobileNavInstance) {
        window.mobileNavInstance = initMobileNavigation();
    } else if (window.innerWidth > 768 && window.mobileNavInstance) {
        window.mobileNavInstance.close();
        window.mobileNavInstance = null;
    }
});

// Debug helper
window.debugMobileNav = function() {
    console.log('Mobile Nav Debug:');
    console.log('Menu Button:', document.querySelector('.mobile-menu-btn'));
    console.log('Nav Menu:', document.querySelector('.nav-menu'));
    console.log('Instance:', window.mobileNavInstance);
    console.log('Is Open:', window.mobileNavInstance?.isOpen);
};