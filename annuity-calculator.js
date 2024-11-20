document.addEventListener('DOMContentLoaded', function() {
    setupDateConstraints();
    setupEventListeners();
});

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatCurrencyInput(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value) {
        const number = parseInt(value);
        input.value = formatCurrency(number);
    }
}

function parseCurrencyValue(value) {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
}

// Setup Functions
function setupDateConstraints() {
    const today = new Date();
    
    // Start date constraints (30 days to 12 months from today)
    const minStart = new Date(today);
    minStart.setDate(today.getDate() + 30);
    
    const maxStart = new Date(today);
    maxStart.setMonth(today.getMonth() + 12);
    
    const startDateInput = document.getElementById('startDate');
    startDateInput.min = minStart.toISOString().split('T')[0];
    startDateInput.max = maxStart.toISOString().split('T')[0];
    
    // Birth date constraints (18-90 years old)
    const minBirth = new Date(today);
    minBirth.setFullYear(today.getFullYear() - 90);
    
    const maxBirth = new Date(today);
    maxBirth.setFullYear(today.getFullYear() - 18);
    
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput.min = minBirth.toISOString().split('T')[0];
    birthDateInput.max = maxBirth.toISOString().split('T')[0];
}

function setupEventListeners() {
    // Income type radio buttons
    document.querySelectorAll('input[name="incomeType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const periodWrapper = document.getElementById('periodInputWrapper');
            periodWrapper.style.display = this.value === 'period' ? 'block' : 'none';
        });
    });
    
    // Estimate type radio buttons
    document.querySelectorAll('input[name="estimateType"]').forEach(radio => {
        radio.addEventListener('change', toggleEstimateType);
    });
    
    // State selection
    document.getElementById('state').addEventListener('change', validateForm);
    
    // Calculate button
    document.getElementById('calculateButton').addEventListener('click', calculateAnnuity);
}

// Validation Functions
function validateAmount(input) {
    const value = parseCurrencyValue(input.value);
    const errorElement = document.getElementById('amountError');
    const isValid = value >= 5000 && value <= 5000000;
    
    input.classList.toggle('error', !isValid);
    errorElement.classList.toggle('visible', !isValid);
    
    validateForm();
    return isValid;
}

function validateIncome(input) {
    const value = parseCurrencyValue(input.value);
    const errorElement = document.getElementById('incomeError');
    const isValid = value >= 50 && value <= 50000;
    
    input.classList.toggle('error', !isValid);
    errorElement.classList.toggle('visible', !isValid);
    
    validateForm();
    return isValid;
}
function validateStartDate(input) {
    const selectedDate = new Date(input.value);
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 30));
    const maxDate = new Date(today.setMonth(today.getMonth() + 12));
    
    const isValid = selectedDate >= minDate && selectedDate <= maxDate;
    const errorElement = document.getElementById('dateError');
    
    input.classList.toggle('error', !isValid);
    errorElement.classList.toggle('visible', !isValid);
    
    validateForm();
    return isValid;
}

function validateBirthDate(input) {
    const birthDate = new Date(input.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const isValid = age >= 18 && age <= 90;
    
    const errorElement = document.getElementById('birthDateError');
    input.classList.toggle('error', !isValid);
    errorElement.classList.toggle('visible', !isValid);
    
    validateForm();
    return isValid;
}

function toggleEstimateType() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const amountInput = document.getElementById('investmentAmount');
    const incomeInput = document.getElementById('desiredIncome');
    
    if (estimateType === 'amount') {
        amountInput.disabled = false;
        incomeInput.disabled = true;
        incomeInput.value = '';
        incomeInput.classList.remove('error');
        document.getElementById('incomeError').classList.remove('visible');
    } else {
        amountInput.disabled = true;
        incomeInput.disabled = false;
        amountInput.value = '';
        amountInput.classList.remove('error');
        document.getElementById('amountError').classList.remove('visible');
    }
    
    validateForm();
}

function validateForm() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const startDate = document.getElementById('startDate').value;
    const birthDate = document.getElementById('birthDate').value;
    const state = document.getElementById('state').value;
    
    let isValid = true;
    
    if (estimateType === 'amount') {
        isValid = validateAmount(document.getElementById('investmentAmount'));
    } else {
        isValid = validateIncome(document.getElementById('desiredIncome'));
    }
    
    isValid = isValid && 
              validateStartDate(document.getElementById('startDate')) &&
              validateBirthDate(document.getElementById('birthDate')) &&
              state !== '';
    
    document.getElementById('calculateButton').disabled = !isValid;
}

function calculateAnnuity() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const annualRate = 0.048; // 4.8% annual rate
    
    let monthlyIncome, investmentAmount;
    
    if (estimateType === 'amount') {
        investmentAmount = parseCurrencyValue(document.getElementById('investmentAmount').value);
        monthlyIncome = (investmentAmount * (annualRate / 12));
    } else {
        monthlyIncome = parseCurrencyValue(document.getElementById('desiredIncome').value);
        investmentAmount = (monthlyIncome * 12 / annualRate);
    }
    
    // Display results
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('startDateDisplay').textContent = new Date(document.getElementById('startDate').value)
        .toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('annuityTypeDisplay').textContent = getAnnuityTypeDisplay();
    document.getElementById('investmentDisplay').textContent = formatCurrency(investmentAmount);
    document.getElementById('monthlyIncomeDisplay').textContent = formatCurrency(monthlyIncome);
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-MX');
}

function getAnnuityTypeDisplay() {
    const incomeType = document.querySelector('input[name="incomeType"]:checked').value;
    switch(incomeType) {
        case 'single': return 'Vida única';
        case 'joint': return 'Vida conjunta';
        case 'period': return `${document.getElementById('periodYears').value} años`;
        default: return '-';
    }
}
