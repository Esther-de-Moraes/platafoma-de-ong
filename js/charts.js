// Charts JavaScript - Additional chart functionality

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.init();
    }

    init() {
        this.setupChartInteractions();
        this.setupChartExport();
    }

    setupChartInteractions() {
        // Add hover effects and interactions to charts
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceChartsWithInteractions();
        });
    }

    enhanceChartsWithInteractions() {
        // Add click handlers to chart elements
        const chartCanvases = document.querySelectorAll('canvas');
        chartCanvases.forEach((canvas, index) => {
            canvas.addEventListener('click', (e) => {
                this.handleChartClick(e, canvas);
            });
        });
    }

    handleChartClick(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // This would typically use Chart.js getElementAtEvent method
        console.log('Chart clicked at:', { x, y });
        
        // Show tooltip or additional information
        this.showChartTooltip(event, canvas);
    }

    showChartTooltip(event, canvas) {
        // Create custom tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>Detalhes do Ponto</strong>
                <p>Informações adicionais sobre este dado</p>
            </div>
        `;

        tooltip.style.position = 'fixed';
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.style.background = 'white';
        tooltip.style.padding = '1rem';
        tooltip.style.borderRadius = 'var(--border-radius)';
        tooltip.style.boxShadow = 'var(--shadow-lg)';
        tooltip.style.zIndex = '1000';

        document.body.appendChild(tooltip);

        // Remove tooltip after 3 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }

    setupChartExport() {
        // Add export functionality to charts
        this.addExportButtons();
    }

    addExportButtons() {
        const chartHeaders = document.querySelectorAll('.chart-header');
        
        chartHeaders.forEach(header => {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-outline btn-sm';
            exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            exportBtn.style.marginLeft = 'auto';
            
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportChart(header.parentElement);
            });

            header.appendChild(exportBtn);
        });
    }

    exportChart(chartContainer) {
        const canvas = chartContainer.querySelector('canvas');
        if (!canvas) return;

        // Create a temporary link to download the chart as PNG
        const link = document.createElement('a');
        link.download = 'grafico-nexusong.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Dynamic Chart Updates
    updateChartData(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    }

    // Chart Data Filtering
    filterChartData(chartId, filter) {
        // Implement chart data filtering based on various criteria
        console.log(`Filtering chart ${chartId} with:`, filter);
    }

    // Responsive Chart Adjustments
    handleResize() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Export functions for global use
window.ChartManager = ChartManager;