document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    setupDates();
    setupListeners();
    checkFormValidity();
}

// Core Functions
function setupDates() {
    const today = new Date();
    
    // Start date (30 days to 12 months from today)
    const minStart = new Date(today);
    minStart.setDate(today.getDate() + 30);
    
    const maxStart = new Date(today);
    maxStart.setMonth(today.getMonth() + 12);
    
    const startInput = document.getElementById('startDate');
    startInput.min = minStart.toISOString().split('T')[0];
    startInput.max = maxStart.toISOString().split('T')[0];
    
    // Birth date (18-90 years old)
    const minBirth = new Date(today);
    minBirth.setFullYear(today.getFullYear() - 90);
    
    const maxBirth = new Date(today);
    maxBirth.setFullYear(today.getFullYear() - 18);
    
    const birthInput = document.getElementById('birthDate');
    birthInput.min = minBirth.toISOString().split('T')[0];
    birthInput.max = maxBirth.toISOString().split('T')[0];
}

function setupListeners() {
    // Amount input
    const amountInput = document.getElementById('investmentAmount');
    amountInput.addEventListener('input', function(e) {
        formatInput(this);
        checkFormValidity();
    });

    // Income input
    const incomeInput = document.getElementById('desiredIncome');
    incomeInput.addEventListener('input', function(e) {
        formatInput(this);
        checkFormValidity();
    });

    // Date inputs
    document.getElementById('startDate').addEventListener('change', checkFormValidity);
    document.getElementById('birthDate').addEventListener('change', checkFormValidity);
    
    // State select
    document.getElementById('state').addEventListener('change', checkFormValidity);
    
    // Radio buttons
    document.querySelectorAll('input[name="estimateType"]').forEach(radio => {
        radio.addEventListener('change', handleEstimateTypeChange);
    });

    document.querySelectorAll('input[name="incomeType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const wrapper = document.getElementById('periodInputWrapper');
            wrapper.style.display = this.value === 'period' ? 'block' : 'none';
            checkFormValidity();
        });
    });

    // Calculate button
    document.getElementById('calculateButton').addEventListener('click', calculate);
}

// Validation Functions
function checkFormValidity() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const startDate = document.getElementById('startDate').value;
    const birthDate = document.getElementById('birthDate').value;
    const state = document.getElementById('state').value;
    
    let isValid = true;

    // Validate amount/income
    if (estimateType === 'amount') {
        const amount = getCleanNumber('investmentAmount');
        isValid = amount >= 5000 && amount <= 5000000;
        toggleError('investmentAmount', 'amountError', !isValid);
    } else {
        const income = getCleanNumber('desiredIncome');
        isValid = income >= 50 && income <= 50000;
        toggleError('desiredIncome', 'incomeError', !isValid);
    }

    // Validate dates
    const startValid = validateDate(startDate);
    const birthValid = validateBirthDate(birthDate);
    
    toggleError('startDate', 'dateError', !startValid);
    toggleError('birthDate', 'birthDateError', !birthValid);

    // Update button state
    const calculateButton = document.getElementById('calculateButton');
    calculateButton.disabled = !(isValid && startValid && birthValid && state);
}

function validateDate(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const min = new Date(today.setDate(today.getDate() + 30));
    const max = new Date(today.setMonth(today.getMonth() + 12));
    return date >= min && date <= max;
}

function validateBirthDate(dateStr) {
    if (!dateStr) return false;
    const birth = new Date(dateStr);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18 && age <= 90;
}

// Utility Functions
function formatInput(input) {
    const clean = input.value.replace(/[^\d]/g, '');
    if (clean) {
        const number = parseInt(clean);
        input.value = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    }
}

function getCleanNumber(elementId) {
    const value = document.getElementById(elementId).value;
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
}

function toggleError(inputId, errorId, show) {
    document.getElementById(inputId).classList.toggle('error', show);
    document.getElementById(errorId).classList.toggle('visible', show);
}

function handleEstimateTypeChange() {
    const isAmount = this.value === 'amount';
    const amountInput = document.getElementById('investmentAmount');
    const incomeInput = document.getElementById('desiredIncome');
    
    amountInput.disabled = !isAmount;
    incomeInput.disabled = isAmount;
    
    if (isAmount) {
        incomeInput.value = '';
        toggleError('desiredIncome', 'incomeError', false);
    } else {
        amountInput.value = '';
        toggleError('investmentAmount', 'amountError', false);
    }
    
    checkFormValidity();
}

// Calculation Functions
function calculate() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const annualRate = 0.048;
    
    let monthlyIncome, investmentAmount;
    
    if (estimateType === 'amount') {
        investmentAmount = getCleanNumber('investmentAmount');
        monthlyIncome = (investmentAmount * (annualRate / 12));
    } else {
        monthlyIncome = getCleanNumber('desiredIncome');
        investmentAmount = (monthlyIncome * 12 / annualRate);
    }
    
    displayResults(investmentAmount, monthlyIncome);
}

function displayResults(investment, monthly) {
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('startDateDisplay').textContent = 
        new Date(document.getElementById('startDate').value)
            .toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('annuityTypeDisplay').textContent = getAnnuityType();
    document.getElementById('investmentDisplay').textContent = formatter.format(investment);
    document.getElementById('monthlyIncomeDisplay').textContent = formatter.format(monthly);
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-MX');
}

function getAnnuityType() {
    const type = document.querySelector('input[name="incomeType"]:checked').value;
    switch(type) {
        case 'single': return 'Vida única';
        case 'joint': return 'Vida conjunta';
        case 'period': return `${document.getElementById('periodYears').value} años`;
        default: return '-';
    }
}
