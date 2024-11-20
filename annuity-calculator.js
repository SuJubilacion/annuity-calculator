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

function cleanNumber(value) {
    if (!value) return 0;
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
}

// Input Handlers
function handleCurrencyInput(input) {
    const value = cleanNumber(input.value);
    if (value) {
        input.value = formatCurrency(value);
        checkFormValidity();
    }
}

function handleDateInput(input) {
    checkFormValidity();
}

function handleStateChange(select) {
    checkFormValidity();
}

// Validation
function isAmountValid(value) {
    const amount = cleanNumber(value);
    return amount >= 5000 && amount <= 5000000;
}

function isIncomeValid(value) {
    const income = cleanNumber(value);
    return income >= 50 && income <= 50000;
}

function isDateValid(dateString) {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 30));
    const maxDate = new Date(today.setMonth(today.getMonth() + 12));
    return inputDate >= minDate && inputDate <= maxDate;
}

function isBirthDateValid(dateString) {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 90;
}

function checkFormValidity() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const startDate = document.getElementById('startDate').value;
    const birthDate = document.getElementById('birthDate').value;
    const state = document.getElementById('state').value;
    
    let isValid = true;
    
    // Check amount or income based on estimate type
    if (estimateType === 'amount') {
        const amountInput = document.getElementById('investmentAmount');
        isValid = isAmountValid(amountInput.value);
        amountInput.classList.toggle('error', !isValid);
        document.getElementById('amountError').classList.toggle('visible', !isValid);
    } else {
        const incomeInput = document.getElementById('desiredIncome');
        isValid = isIncomeValid(incomeInput.value);
        incomeInput.classList.toggle('error', !isValid);
        document.getElementById('incomeError').classList.toggle('visible', !isValid);
    }
    
    // Check dates and state
    const isStartDateValid = isDateValid(startDate);
    const isBirthValid = isBirthDateValid(birthDate);
    
    document.getElementById('startDate').classList.toggle('error', !isStartDateValid);
    document.getElementById('dateError').classList.toggle('visible', !isStartDateValid);
    
    document.getElementById('birthDate').classList.toggle('error', !isBirthValid);
    document.getElementById('birthDateError').classList.toggle('visible', !isBirthValid);
    
    isValid = isValid && isStartDateValid && isBirthValid && state !== '';
    
    // Enable/disable calculate button
    document.getElementById('calculateButton').disabled = !isValid;
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
    
    checkFormValidity();
}

// Setup Functions
function setupDateConstraints() {
    const today = new Date();
    
    // Start date constraints
    const minStart = new Date(today);
    minStart.setDate(today.getDate() + 30);
    
    const maxStart = new Date(today);
    maxStart.setMonth(today.getMonth() + 12);
    
    const startDateInput = document.getElementById('startDate');
    startDateInput.min = minStart.toISOString().split('T')[0];
    startDateInput.max = maxStart.toISOString().split('T')[0];
    
    // Birth date constraints
    const minBirth = new Date(today);
    minBirth.setFullYear(today.getFullYear() - 90);
    
    const maxBirth = new Date(today);
    maxBirth.setFullYear(today.getFullYear() - 18);
    
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput.min = minBirth.toISOString().split('T')[0];
    birthDateInput.max = maxBirth.toISOString().split('T')[0];
}

function setupEventListeners() {
    // Radio buttons
    document.querySelectorAll('input[name="incomeType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('periodInputWrapper').style.display = 
                this.value === 'period' ? 'block' : 'none';
            checkFormValidity();
        });
    });
    
    // Input fields
    document.getElementById('investmentAmount').addEventListener('input', 
        e => handleCurrencyInput(e.target));
    document.getElementById('desiredIncome').addEventListener('input', 
        e => handleCurrencyInput(e.target));
    document.getElementById('startDate').addEventListener('change', 
        e => handleDateInput(e.target));
    document.getElementById('birthDate').addEventListener('change', 
        e => handleDateInput(e.target));
    document.getElementById('state').addEventListener('change', 
        e => handleStateChange(e.target));
        
    // Estimate type radios
    document.querySelectorAll('input[name="estimateType"]').forEach(radio => {
        radio.addEventListener('change', toggleEstimateType);
    });
    
    // Calculate button
    document.getElementById('calculateButton').addEventListener('click', calculateAnnuity);
}

function calculateAnnuity() {
    const estimateType = document.querySelector('input[name="estimateType"]:checked').value;
    const annualRate = 0.048; // 4.8% annual rate
    
    let monthlyIncome, investmentAmount;
    
    if (estimateType === 'amount') {
        investmentAmount = cleanNumber(document.getElementById('investmentAmount').value);
        monthlyIncome = (investmentAmount * (annualRate / 12));
    } else {
        monthlyIncome = cleanNumber(document.getElementById('desiredIncome').value);
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
