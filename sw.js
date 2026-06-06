/* ---- Formatting ---- */

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCurrency(n) {
  return '$' + fmt(n);
}

function fmtPercent(n) {
  return n.toFixed(2) + '%';
}

function parsePercent(v) {
  return parseFloat(v) / 100;
}

/* ---- Loan Calculator ---- */

function calcLoan() {
  const amount = parseFloat(document.getElementById('loan-amount').value);
  const rate = parsePercent(document.getElementById('loan-rate').value);
  const years = parseFloat(document.getElementById('loan-term').value);

  if (!amount || !rate || !years) {
    alert('Please fill in all fields.');
    return;
  }

  const months = years * 12;
  const monthlyRate = rate / 12;
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPaid = payment * months;
  const totalInterest = totalPaid - amount;

  const results = document.getElementById('loan-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Monthly Payment</span>
      <span class="value">${fmtCurrency(payment)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Interest Paid</span>
      <span class="value">${fmtCurrency(totalInterest)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Payment</span>
      <span class="value">${fmtCurrency(totalPaid)}</span>
    </div>
    <hr class="result-divider">
    <div class="result-row">
      <span class="label">Loan Amount</span>
      <span class="value">${fmtCurrency(amount)}</span>
    </div>
    <div class="result-row">
      <span class="label">Annual Rate</span>
      <span class="value">${(rate * 100).toFixed(2)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Term</span>
      <span class="value">${years} years</span>
    </div>
  `;
  addShareButton('loan-results');
}

/* ---- Mortgage Calculator ---- */

function calcMortgage() {
  const price = parseFloat(document.getElementById('home-price').value);
  const down = parseFloat(document.getElementById('down-payment').value);
  const rate = parsePercent(document.getElementById('mortgage-rate').value);
  const years = parseFloat(document.getElementById('mortgage-term').value);
  const tax = parseFloat(document.getElementById('property-tax').value) || 0;
  const insurance = parseFloat(document.getElementById('home-insurance').value) || 0;

  if (!price || down === undefined || !rate || !years) {
    alert('Please fill in all required fields.');
    return;
  }

  const loanAmount = price - down;
  if (loanAmount <= 0) {
    alert('Down payment must be less than home price.');
    return;
  }

  const months = years * 12;
  const monthlyRate = rate / 12;
  const pAndI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  const pmi = down < price * 0.2 ? loanAmount * 0.005 / 12 : 0;
  const totalMonthly = pAndI + monthlyTax + monthlyInsurance + pmi;

  const totalPaid = totalMonthly * months;
  const totalInterest = totalPaid - loanAmount;

  const results = document.getElementById('mortgage-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Total Monthly Payment</span>
      <span class="value">${fmtCurrency(totalMonthly)}</span>
    </div>
    <div class="result-row">
      <span class="label">Principal &amp; Interest</span>
      <span class="value">${fmtCurrency(pAndI)}</span>
    </div>
    <div class="result-row">
      <span class="label">Property Tax</span>
      <span class="value">${fmtCurrency(monthlyTax)}</span>
    </div>
    <div class="result-row">
      <span class="label">Home Insurance</span>
      <span class="value">${fmtCurrency(monthlyInsurance)}</span>
    </div>
    ${pmi > 0 ? `<div class="result-row">
      <span class="label">PMI</span>
      <span class="value">${fmtCurrency(pmi)}</span>
    </div>` : ''}
    <hr class="result-divider">
    <div class="result-row">
      <span class="label">Loan Amount</span>
      <span class="value">${fmtCurrency(loanAmount)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Interest</span>
      <span class="value">${fmtCurrency(totalInterest)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Paid (all costs)</span>
      <span class="value">${fmtCurrency(totalPaid)}</span>
    </div>
  `;

  addShareButton('mortgage-results');

  // Build amortization table
  const tbody = document.getElementById('amort-body');
  tbody.innerHTML = '';
  let balance = loanAmount;
  for (let i = 1; i <= Math.min(months, 360); i++) {
    const intPortion = balance * monthlyRate;
    const prinPortion = pAndI - intPortion;
    balance -= prinPortion;
    if (balance < 0) balance = 0;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i}</td>
      <td>${fmtCurrency(pAndI)}</td>
      <td>${fmtCurrency(prinPortion)}</td>
      <td>${fmtCurrency(intPortion)}</td>
      <td>${fmtCurrency(balance)}</td>
    `;
    tbody.appendChild(row);
  }
  document.getElementById('amort-section').style.display = 'block';
}

/* ---- Compound Interest Calculator ---- */

function calcCompound() {
  const principal = parseFloat(document.getElementById('compound-principal').value);
  const contribution = parseFloat(document.getElementById('compound-contribution').value) || 0;
  const rate = parsePercent(document.getElementById('compound-rate').value);
  const years = parseFloat(document.getElementById('compound-years').value);
  const freq = parseInt(document.getElementById('compound-freq').value);

  if (!principal || !rate || !years) {
    alert('Please fill in all required fields.');
    return;
  }

  const periods = years * freq;
  const periodicRate = rate / freq;
  let fv = principal * Math.pow(1 + periodicRate, periods);
  if (contribution > 0) {
    fv += contribution * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate);
  }
  const totalContributions = principal + contribution * periods;
  const interestEarned = fv - totalContributions;

  const results = document.getElementById('compound-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Future Value</span>
      <span class="value">${fmtCurrency(fv)}</span>
    </div>
    <div class="result-row success">
      <span class="label">Total Interest Earned</span>
      <span class="value">${fmtCurrency(interestEarned)}</span>
    </div>
    <hr class="result-divider">
    <div class="result-row">
      <span class="label">Principal</span>
      <span class="value">${fmtCurrency(principal)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Contributions</span>
      <span class="value">${fmtCurrency(totalContributions)}</span>
    </div>
    <div class="result-row">
      <span class="label">Annual Rate</span>
      <span class="value">${(rate * 100).toFixed(2)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Time Period</span>
      <span class="value">${years} years</span>
    </div>
  `;
  addShareButton('compound-results');
}

/* ---- Savings Calculator ---- */

function calcSavings() {
  const start = parseFloat(document.getElementById('savings-start').value);
  const monthly = parseFloat(document.getElementById('savings-monthly').value);
  const rate = parsePercent(document.getElementById('savings-rate').value);
  const years = parseFloat(document.getElementById('savings-years').value);

  if (!start || monthly === undefined || !rate || !years) {
    alert('Please fill in all fields.');
    return;
  }

  const months = years * 12;
  const monthlyRate = rate / 12;
  let fv = start * Math.pow(1 + monthlyRate, months);
  if (monthly > 0) {
    fv += monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }
  const totalDeposits = start + monthly * months;
  const interestEarned = fv - totalDeposits;

  const results = document.getElementById('savings-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Total Balance</span>
      <span class="value">${fmtCurrency(fv)}</span>
    </div>
    <div class="result-row success">
      <span class="label">Interest Earned</span>
      <span class="value">${fmtCurrency(interestEarned)}</span>
    </div>
    <hr class="result-divider">
    <div class="result-row">
      <span class="label">Starting Amount</span>
      <span class="value">${fmtCurrency(start)}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Deposits</span>
      <span class="value">${fmtCurrency(totalDeposits)}</span>
    </div>
    <div class="result-row">
      <span class="label">Annual Rate</span>
      <span class="value">${(rate * 100).toFixed(2)}%</span>
    </div>
  `;
  addShareButton('savings-results');
}

/* ---- Debt Payoff Calculator ---- */

function calcDebt() {
  const balance = parseFloat(document.getElementById('debt-balance').value);
  const rate = parsePercent(document.getElementById('debt-rate').value);
  const payment = parseFloat(document.getElementById('debt-payment').value);
  const extra = parseFloat(document.getElementById('debt-extra').value) || 0;

  if (!balance || !rate || !payment) {
    alert('Please fill in all required fields.');
    return;
  }

  const monthlyRate = rate / 12;
  if (payment <= balance * monthlyRate) {
    alert('Payment must be greater than the monthly interest.');
    return;
  }

  const totalPayment = payment + extra;
  let months = 0;
  let bal = balance;
  let totalInterest = 0;
  let monthsNoExtra = 0;
  let balNoExtra = balance;

  while (bal > 0) {
    const intPortion = bal * monthlyRate;
    const prinPortion = totalPayment - intPortion;
    if (prinPortion <= 0) break;
    totalInterest += intPortion;
    bal -= prinPortion;
    months++;
  }

  while (balNoExtra > 0) {
    const intPortion = balNoExtra * monthlyRate;
    const prinPortion = payment - intPortion;
    if (prinPortion <= 0) break;
    balNoExtra -= prinPortion;
    monthsNoExtra++;
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const timeStr = years > 0 ? `${years}y ${remMonths}m` : `${months} months`;
  const noExtraYears = Math.floor(monthsNoExtra / 12);
  const noExtraRem = monthsNoExtra % 12;
  const noExtraStr = noExtraYears > 0 ? `${noExtraYears}y ${noExtraRem}m` : `${monthsNoExtra} months`;
  const savedMonths = monthsNoExtra - months;
  const savedInterest = (monthsNoExtra > 0 && monthsNoExtra !== months) ? (function() {
    let bi = 0;
    let b = balance;
    for (let i = 0; i < monthsNoExtra; i++) {
      const ip = b * monthlyRate;
      bi += ip;
      b -= payment - ip;
      if (b <= 0) break;
    }
    return bi - totalInterest;
  })() : 0;

  const results = document.getElementById('debt-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Payoff Time</span>
      <span class="value">${timeStr}</span>
    </div>
    <div class="result-row">
      <span class="label">Total Interest Paid</span>
      <span class="value">${fmtCurrency(totalInterest)}</span>
    </div>
    <hr class="result-divider">
    <div class="result-row success">
      <span class="label">Without Extra Payment</span>
      <span class="value">${noExtraStr}</span>
    </div>
    ${extra > 0 ? `
    <div class="result-row success">
      <span class="label">Time Saved</span>
      <span class="value">${savedMonths} months</span>
    </div>
    <div class="result-row success">
      <span class="label">Interest Saved</span>
      <span class="value">${fmtCurrency(savedInterest)}</span>
    </div>
    ` : ''}
    <div class="result-row">
      <span class="label">Monthly Payment</span>
      <span class="value">${fmtCurrency(totalPayment)}</span>
    </div>
  `;
  addShareButton('debt-results');
}

/* ---- Affordability Calculator ---- */

function calcAfford() {
  const income = parseFloat(document.getElementById('afford-income').value);
  const debt = parseFloat(document.getElementById('afford-debt').value) || 0;
  const down = parseFloat(document.getElementById('afford-down').value) || 0;
  const rate = parsePercent(document.getElementById('afford-rate').value);
  const years = parseFloat(document.getElementById('afford-term').value);
  const tax = parseFloat(document.getElementById('afford-tax').value) || 0;
  const insurance = parseFloat(document.getElementById('afford-insurance').value) || 0;

  if (!income || !rate || !years) {
    alert('Please fill in all required fields.');
    return;
  }

  const monthlyIncome = income / 12;

  // Front-end ratio (28%)
  const maxPITI = monthlyIncome * 0.28;
  // Back-end ratio (36%)
  const maxTotalDebt = monthlyIncome * 0.36;
  const maxPITIbyDebt = maxTotalDebt - debt;

  const allowablePITI = Math.min(maxPITI, maxPITIbyDebt);
  if (allowablePITI <= 0) {
    alert('Your debt obligations are too high for a mortgage at this income.');
    return;
  }

  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyPAndI = allowablePITI - monthlyTax - monthlyInsurance;

  if (monthlyPAndI <= 0) {
    alert('Tax/insurance costs exceed your allowable monthly payment.');
    return;
  }

  const months = years * 12;
  const monthlyRate = rate / 12;
  const maxLoan = monthlyPAndI * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));
  const maxPrice = maxLoan + down;

  const results = document.getElementById('afford-results');
  results.innerHTML = `
    <h3>Results</h3>
    <div class="result-row primary">
      <span class="label">Maximum Home Price</span>
      <span class="value">${fmtCurrency(maxPrice)}</span>
    </div>
    <div class="result-row">
      <span class="label">Loan Amount</span>
      <span class="value">${fmtCurrency(maxLoan)}</span>
    </div>
    <div class="result-row">
      <span class="label">Down Payment</span>
      <span class="value">${fmtCurrency(down)}</span>
    </div>
    <hr class="result-divider">
    <div class="result-row">
      <span class="label">Monthly PITI</span>
      <span class="value">${fmtCurrency(allowablePITI)}</span>
    </div>
    <div class="result-row">
      <span class="label">Based on Income</span>
      <span class="value">${fmtCurrency(monthlyIncome)}/mo</span>
    </div>
    <div class="result-row">
      <span class="label">Front-End Ratio</span>
      <span class="value">28%</span>
    </div>
    <div class="result-row">
      <span class="label">Back-End Ratio</span>
      <span class="value">36%</span>
    </div>
  `;
  addShareButton('afford-results');
}

/* ---- Share Icon ---- */

const SHARE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>';

function sharePage(title) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: title, url: url }).catch(function() {});
  } else {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.querySelector('.share-btn');
      if (btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(function() { btn.innerHTML = orig; }, 2000);
      }
    }).catch(function() {});
  }
}

function addShareButton(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var existing = container.querySelector('.share-btn');
  if (existing) existing.remove();
  var btn = document.createElement('button');
  btn.className = 'share-btn';
  btn.innerHTML = SHARE_ICON + ' Share';
  btn.onclick = function() {
    var h1 = document.querySelector('h1');
    sharePage(h1 ? h1.textContent : 'FinanceCalc');
  };
  container.appendChild(btn);
}

/* ---- PWA Install Button ---- */

var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var btn = document.getElementById('install-btn');
  if (btn) btn.style.display = 'inline-flex';
});

function installApp() {
  var btn = document.getElementById('install-btn');
  if (!deferredPrompt) {
    if (btn) btn.style.display = 'none';
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function(result) {
    if (result.outcome === 'accepted') {
      if (btn) btn.style.display = 'none';
    }
    deferredPrompt = null;
  });
}

/* ---- Service Worker ---- */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  });
}

/* ---- Enter key support ---- */

document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('.calc-form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input');
    const btn = form.querySelector('.btn-primary');
    inputs.forEach(input => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && btn) {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
});
