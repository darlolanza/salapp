/**
 * Calculadora de Sueldo Neto - TDF 2025
 * =====================================
 * Lógica de cálculo basada en la estructura de recibos de sueldo
 * de la Administración Pública de Tierra del Fuego
 */

// Constants - Calculation percentages
const CALC = {
    ANTIGUEDAD_PER_YEAR: 0.02,      // 2% por año
    TITULO_ED_SUPERIOR: 0.35,        // 35% del básico
    SUPLEMENTO_ZONA: 1.00,           // 100% de (básico + antigüedad + título)
    MAYOR_DEDICACION: 0.4442,        // 44.42% del básico
    SUPLEMENTO_APOYO: 0.4997,        // 49.97% del básico
    DTO_277: 80000,                  // Monto fijo $80.000
    BLOQUEO_TITULO_FACTOR: 0.35 * 2, // 35% x 2 del Haber Comisario
    JUBILACION: 0.14,                // 14% del subtotal remunerativo
    OBRA_SOCIAL: 0.03,               // 3% del subtotal remunerativo
};

// Historical monthly data for 2025

const MONTHLY_DATA = [
    { month: 'Ene', basico: 353655.92, neto: 1611504.81 },
    { month: 'Feb', basico: 364265.60, neto: 1657986.96 },
    { month: 'Mar', basico: 364265.60, neto: 1657986.96 },
    { month: 'Abr', basico: 397778.04, neto: 1868644.02 },
    { month: 'May', basico: 409711.38, neto: 1857089.82 },
    { month: 'Jun', basico: 409711.38, neto: 1857089.82 },
    { month: 'Jul', basico: 409711.38, neto: 1857089.82 },
    { month: 'Ago', basico: 409711.38, neto: 1857089.82 },
    { month: 'Sep', basico: 430442.77, neto: 1983491.07 },
    { month: 'Oct', basico: 430442.77, neto: 1947841.29 },
    { month: 'Nov', basico: 447660.48, neto: 2023273.94 },
    { month: 'Dic', basico: 447660.48, neto: 2023273.94 },
];

// DOM Elements
const elements = {
    // Inputs
    sueldoBasico: document.getElementById('sueldoBasico'),
    antiguedad: document.getElementById('antiguedad'),
    haberComisario: document.getElementById('haberComisario'),
    dto277: document.getElementById('dto277'),
    seguroVida: document.getElementById('seguroVida'),
    porcentajeAumento: document.getElementById('porcentajeAumento'),

    // Values display
    valBasico: document.getElementById('val-basico'),
    valAntiguedad: document.getElementById('val-antiguedad'),
    valTitulo: document.getElementById('val-titulo'),
    valZona: document.getElementById('val-zona'),
    valDedicacion: document.getElementById('val-dedicacion'),
    valDto277: document.getElementById('val-dto277'),
    valApoyo: document.getElementById('val-apoyo'),
    valBloqueo: document.getElementById('val-bloqueo'),
    valJubilacion: document.getElementById('val-jubilacion'),
    valObraSocial: document.getElementById('val-obrasocial'),
    valSeguro: document.getElementById('val-seguro'),

    // Subtotals
    subtotalRemunerativo: document.getElementById('subtotal-remunerativo'),
    subtotalNoRemunerativo: document.getElementById('subtotal-no-remunerativo'),
    totalDescuentos: document.getElementById('total-descuentos'),
    sueldoNeto: document.getElementById('sueldo-neto'),
};

// Chart instance
let evolutionChart = null;

/**
 * Format number as Argentine currency
 */
function formatCurrency(value, showSign = false) {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    if (showSign && value < 0) {
        return `-$${formatted}`;
    }
    return `$${formatted}`;
}

/**
 * Update element with animation
 */
function updateValue(element, value, isNegative = false) {
    const formattedValue = formatCurrency(value, isNegative);

    if (element.textContent !== formattedValue) {
        element.classList.add('value-updating');
        element.textContent = formattedValue;

        setTimeout(() => {
            element.classList.remove('value-updating');
        }, 300);
    }
}

/**
 * Calculate all salary components
 */
function calculateSalary() {
    // Get input values
    const basicoBase = parseFloat(elements.sueldoBasico.value) || 0;
    const yearsAntiguedad = parseInt(elements.antiguedad.value) || 0;
    const haberComisarioBase = parseFloat(elements.haberComisario.value) || 0;
    const dto277 = parseFloat(elements.dto277.value) || 0;
    const seguroVida = parseFloat(elements.seguroVida.value) || 0;
    const porcentajeAumento = parseFloat(elements.porcentajeAumento.value) || 0;

    // Apply percentage modifier
    const multiplier = 1 + (porcentajeAumento / 100);
    const basico = basicoBase * multiplier;
    const haberComisario = haberComisarioBase * multiplier;

    // Calculate remunerative concepts
    const antiguedad = basico * CALC.ANTIGUEDAD_PER_YEAR * yearsAntiguedad;
    const titulo = basico * CALC.TITULO_ED_SUPERIOR;
    const zona = (basico + antiguedad + titulo) * CALC.SUPLEMENTO_ZONA;
    const dedicacion = basico * CALC.MAYOR_DEDICACION;
    const apoyo = basico * CALC.SUPLEMENTO_APOYO;

    // Subtotal remunerativo
    const subtotalRemunerativo = basico + antiguedad + titulo + zona + dedicacion + dto277 + apoyo;

    // Non-remunerative concepts
    const bloqueoTitulo = haberComisario * CALC.BLOQUEO_TITULO_FACTOR;
    const subtotalNoRemunerativo = bloqueoTitulo;

    // Deductions (calculated on subtotal remunerativo)
    const jubilacion = subtotalRemunerativo * CALC.JUBILACION;
    const obraSocial = subtotalRemunerativo * CALC.OBRA_SOCIAL;
    const totalDescuentos = jubilacion + obraSocial + seguroVida;

    // Net salary
    const sueldoNeto = subtotalRemunerativo + subtotalNoRemunerativo - totalDescuentos;

    // Update display
    updateValue(elements.valBasico, basico);
    updateValue(elements.valAntiguedad, antiguedad);
    updateValue(elements.valTitulo, titulo);
    updateValue(elements.valZona, zona);
    updateValue(elements.valDedicacion, dedicacion);
    updateValue(elements.valDto277, dto277);
    updateValue(elements.valApoyo, apoyo);
    updateValue(elements.valBloqueo, bloqueoTitulo);

    updateValue(elements.valJubilacion, -jubilacion, true);
    updateValue(elements.valObraSocial, -obraSocial, true);
    updateValue(elements.valSeguro, -seguroVida, true);

    updateValue(elements.subtotalRemunerativo, subtotalRemunerativo);
    updateValue(elements.subtotalNoRemunerativo, subtotalNoRemunerativo);
    updateValue(elements.totalDescuentos, -totalDescuentos, true);
    updateValue(elements.sueldoNeto, sueldoNeto);

    return { subtotalRemunerativo, subtotalNoRemunerativo, totalDescuentos, sueldoNeto };
}

/**
 * Sync slider with input
 */
function syncInputs(input, range) {
    input.addEventListener('input', () => {
        range.value = input.value;
        calculateSalary();
    });

    range.addEventListener('input', () => {
        input.value = range.value;
        calculateSalary();
    });
}

/**
 * Initialize the evolution chart
 */
function initChart() {
    const ctx = document.getElementById('evolutionChart').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    evolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MONTHLY_DATA.map(d => d.month),
            datasets: [{
                label: 'Sueldo Neto',
                data: MONTHLY_DATA.map(d => d.neto),
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 17, 27, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: '600',
                    },
                    bodyFont: {
                        size: 16,
                        weight: '700',
                    },
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        },
                        afterLabel: function (context) {
                            const data = MONTHLY_DATA[context.dataIndex];
                            return `Básico: ${formatCurrency(data.basico)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 12,
                            weight: '500',
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 11,
                        },
                        callback: function (value) {
                            if (value >= 1000000) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            }
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    },
                    min: 1500000,
                    max: 2200000,
                }
            }
        }
    });
}

/**
 * Initialize the app
 */
function init() {
    // Add event listeners for all inputs
    elements.sueldoBasico.addEventListener('input', calculateSalary);
    elements.antiguedad.addEventListener('input', calculateSalary);
    elements.haberComisario.addEventListener('input', calculateSalary);
    elements.dto277.addEventListener('input', calculateSalary);
    elements.seguroVida.addEventListener('input', calculateSalary);
    elements.porcentajeAumento.addEventListener('input', calculateSalary);

    // Initial calculation
    calculateSalary();

    // Initialize chart
    initChart();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
