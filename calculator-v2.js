document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    setupDates();
    setupListeners();
    ();
}

function setupDates() {
    const today = new Date();
    
    // Start date (30 days to 12 months from today)
    const minStart = new Date(today);
    minStart.setDate(today.getDate() + 30);
    
    const maxStart = new Date(today);
    maxStart.setMonth(today.getMonth() + 12);
    
    const startInput = document.getElementById('startDate');
    if (startInput) {
        startInput.min = minStart.toISOString().split('T')[0];
        startInput.max = maxStart.toISOString().split('T')[0];
    }
    
    // Birth date (18-90 years old)
    const minBirth = new Date(today);
    minBirth.setFullYear(today.getFullYear() - 90);
    
    const maxBirth = new Date(today);
    maxBirth.setFullYear(today.getFullYear() - 18);
    
    const birthInput = document.getElementById('birthDate');
    if (birthInput) {
        birthInput.min = minBirth.toISOString().split('T')[0];
        birthInput.max = maxBirth.toISOString().split('T')[0];
    }
}

function setupListeners() {
    // Amount input
    const amountInput = document.getElementById('investmentAmount');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            formatInput(this);
            ();
        });
    }

    // Income input
    const incomeInput = document.getElementById('desiredIncome');
    if (incomeInput) {
        incomeInput.addEventListener('input', function(e) {
            formatInput(this);
            ();
        });
    }

    // Date inputs
    const startDate = document.getElementById('startDate');
    if (startDate) {
        startDate.addEventListener('change', );
    }

    const birthDate = document.getElementById('birthDate');
    if (birthDate) {
        birthDate.addEventListener('change', );
    }
    
    // State select
    const stateSelect = document.getElementById('state');
    if (stateSelect) {
        stateSelect.addEventListener('change', );
    }
    
    // Radio buttons
    document.querySelectorAll('input[name="estimateType"]').forEach(radio => {
        radio.addEventListener('change', handleEstimateTypeChange);
    });

    document.querySelectorAll('input[name="incomeType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const wrapper = document.getElementById('periodInputWrapper');
            if (wrapper) {
                wrapper.style.display = this.value === 'period' ? 'block' : 'none';
            }
            ();
        });
    });

    // Calculate button
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculate);
    }
}

function formatInput(input) {
    const clean = input.value.replace(/[^\d]/g, '');
    if (clean) {
        const number = parseInt(clean);
        input.value = formatCurrency(number);
    }
}

function formatCurrency(number) {
    return '$' + number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function getCleanNumber(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return 0;
    const value = element.value;
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
}

function toggleError(inputId, errorId, show) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if
