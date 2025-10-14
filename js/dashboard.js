// Dashboard JavaScript - Handles dashboard functionality

class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupCharts();
        this.setupDashboardFilters();
        this.setupRealTimeUpdates();
        this.setupMobileSidebar();
    }

    // Setup Charts using Chart.js
    setupCharts() {
        this.setupRevenueChart();
        this.setupProjectsChart();
        this.setupVolunteersChart();
    }

    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Arrecadação (R$)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    setupProjectsChart() {
        const ctx = document.getElementById('projectsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Educação', 'Saúde', 'Meio Ambiente', 'Desenvolvimento'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        '#2563eb',
                        '#f59e0b',
                        '#10b981',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupVolunteersChart() {
        const ctx = document.getElementById('volunteersChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Horas Voluntárias',
                    data: [45, 52, 38, 61, 55, 72, 48],
                    backgroundColor: '#10b981',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Dashboard Filters and Interactions
    setupDashboardFilters() {
        // Time period filter
        const periodFilter = document.querySelector('.chart-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.updateDashboardData(e.target.value);
            });
        }

        // Quick action buttons
        this.setupQuickActions();
    }

    updateDashboardData(period) {
        // Simulate data update based on selected period
        console.log('Updating dashboard data for period:', period);
        
        // Show loading state
        this.showLoadingState();
        
        // Simulate API call
        setTimeout(() => {
            this.hideLoadingState();
            this.showNotification('Dados atualizados com sucesso!', 'success');
        }, 1000);
    }

    setupQuickActions() {
        // New project button
        const newProjectBtn = document.querySelector('.btn-primary');
        if (newProjectBtn && newProjectBtn.textContent.includes('Novo Projeto')) {
            newProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }
    }

    openProjectModal() {
        // Create and show modal for new project
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Projeto</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="newProjectForm">
                        <div class="form-group">
                            <label for="projectName">Nome do Projeto</label>
                            <input type="text" id="projectName" required>
                        </div>
                        <div class="form-group">
                            <label for="projectCategory">Categoria</label>
                            <select id="projectCategory" required>
                                <option value="">Selecione...</option>
                                <option value="education">Educação</option>
                                <option value="health">Saúde</option>
                                <option value="environment">Meio Ambiente</option>
                                <option value="development">Desenvolvimento</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="projectDescription">Descrição</label>
                            <textarea id="projectDescription" rows="3" required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Criar Projeto</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles
        this.addModalStyles();

        // Setup modal functionality
        this.setupModalFunctionality(modal);
    }

    addModalStyles() {
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .modal-content {
                    background: white;
                    border-radius: var(--border-radius);
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--gray-light);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--gray);
                }
                .modal-body {
                    margin-bottom: 1.5rem;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    setupModalFunctionality(modal) {
        // Close modal on X click
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Handle form submission
        const form = modal.querySelector('#newProjectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewProject(new FormData(form));
                modal.remove();
            });
        }
    }

    createNewProject(formData) {
        // Simulate project creation
        console.log('Creating new project:', Object.fromEntries(formData));
        this.showNotification('Projeto criado com sucesso!', 'success');
        
        // Refresh projects data
        setTimeout(() => {
            this.updateProjectsList();
        }, 1000);
    }

    updateProjectsList() {
        // This would typically refresh the projects list from the server
        console.log('Updating projects list...');
    }

    // Real-time Updates
    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateLiveStats();
        }, 30000);
    }

    updateLiveStats() {
        // Simulate live data updates
        const stats = document.querySelectorAll('.stat-info h3');
        stats.forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(/\D/g, ''));
            const randomChange = Math.floor(Math.random() * 10) + 1;
            const newValue = currentValue + randomChange;
            
            // Animate the number change
            this.animateValue(stat, currentValue, newValue, 1000);
        });
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = this.formatNumber(value);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    formatNumber(num) {
        if (num >= 1000) {
            return 'R$ ' + (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Mobile Sidebar
    setupMobileSidebar() {
        const sidebarToggle = document.createElement('button');
        sidebarToggle.className = 'sidebar-toggle';
        sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
        sidebarToggle.style.display = 'none';

        const dashboardHeader = document.querySelector('.dashboard-header');
        if (dashboardHeader) {
            dashboardHeader.appendChild(sidebarToggle);
        }

        // Show toggle on mobile
        if (window.innerWidth <= 768) {
            sidebarToggle.style.display = 'block';
            
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }

        // Update on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                sidebarToggle.style.display = 'block';
            } else {
                sidebarToggle.style.display = 'none';
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    }

    // Utility Methods
    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Atualizando dados...</span>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showNotification(message, type = 'success') {
        if (window.nexusApp && typeof window.nexusApp.showNotification === 'function') {
            window.nexusApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});