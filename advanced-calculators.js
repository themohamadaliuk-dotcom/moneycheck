document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const money = value => `£${Number(value || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const number = id => Math.max(0, Number(document.getElementById(id)?.value || 0));
  const show = (id, html) => { const el = document.getElementById(id); if (!el) return; el.innerHTML = html; el.classList.remove("hidden"); };
  const clear = (ids, resultId) => { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; }); const result = document.getElementById(resultId); if (result) { result.innerHTML = ""; result.classList.add("hidden"); } };
  const annuity = (principal, annualRate, months) => {
    if (principal <= 0 || months <= 0) return null;
    const r = annualRate / 100 / 12;
    if (r === 0) return { payment: principal / months, total: principal, interest: 0 };
    const payment = principal * r / (1 - Math.pow(1 + r, -months));
    const total = payment * months;
    return { payment, total, interest: total - principal };
  };

  const mortgageButton = document.getElementById("mortgageCalculateButton");
  if (mortgageButton) {
    mortgageButton.addEventListener("click", function () {
      const amount = number("mortgageAmount"), rate = number("mortgageRate"), years = number("mortgageTerm");
      if (amount <= 0 || years <= 0) return show("mortgageResult", '<h2 class="warning">Enter the mortgage amount and term</h2><p>Please enter positive values before calculating.</p>');
      const plan = annuity(amount, rate, years * 12);
      show("mortgageResult", `<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div><div class="stat"><span>Mortgage amount</span><strong>${money(amount)}</strong></div><div class="stat"><span>Interest rate</span><strong>${rate.toFixed(2)}%</strong></div><div class="stat"><span>Term</span><strong>${years} years</strong></div><div class="stat"><span>Total interest</span><strong>${money(plan.interest)}</strong></div><div class="stat"><span>Total paid</span><strong>${money(plan.total)}</strong></div><p class="disclaimer">Simplified repayment estimate assuming a constant rate and monthly payments.</p>`);
    });
    document.getElementById("mortgageResetButton")?.addEventListener("click", () => clear(["mortgageAmount","mortgageRate","mortgageTerm"], "mortgageResult"));
  }

  const compoundButton = document.getElementById("compoundCalculateButton");
  if (compoundButton) {
    compoundButton.addEventListener("click", function () {
      const initial = number("compoundInitial"), monthly = number("compoundMonthly"), rate = number("compoundRate"), years = number("compoundYears");
      if (years <= 0) return show("compoundResult", '<h2 class="warning">Enter a time period</h2><p>Please enter at least one year.</p>');
      const months = years * 12, r = rate / 100 / 12;
      const factor = r === 0 ? 1 : Math.pow(1 + r, months);
      const futureInitial = initial * factor;
      const futureContrib = r === 0 ? monthly * months : monthly * ((factor - 1) / r);
      const total = futureInitial + futureContrib;
      const contributed = initial + monthly * months;
      const growth = total - contributed;
      show("compoundResult", `<div class="result-message"><span class="mini-label">Estimated future value</span><strong class="big-number">${money(total)}</strong></div><div class="stat"><span>Starting balance</span><strong>${money(initial)}</strong></div><div class="stat"><span>Monthly contribution</span><strong>${money(monthly)}</strong></div><div class="stat"><span>Assumed annual rate</span><strong>${rate.toFixed(2)}%</strong></div><div class="stat"><span>Total contributions</span><strong>${money(contributed)}</strong></div><div class="stat"><span>Estimated growth</span><strong>${money(growth)}</strong></div><p class="disclaimer">Illustrative estimate. Investment returns are not guaranteed.</p>`);
    });
    document.getElementById("compoundResetButton")?.addEventListener("click", () => clear(["compoundInitial","compoundMonthly","compoundRate","compoundYears"], "compoundResult"));
  }

  const loanButton = document.getElementById("loanCalculateButton");
  if (loanButton) {
    loanButton.addEventListener("click", function () {
      const amount = number("loanAmount"), rate = number("loanRate"), years = number("loanTerm");
      if (amount <= 0 || years <= 0) return show("loanResult", '<h2 class="warning">Enter the loan amount and term</h2><p>Please enter positive values before calculating.</p>');
      const plan = annuity(amount, rate, years * 12);
      show("loanResult", `<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div><div class="stat"><span>Loan amount</span><strong>${money(amount)}</strong></div><div class="stat"><span>APR</span><strong>${rate.toFixed(2)}%</strong></div><div class="stat"><span>Term</span><strong>${years} years</strong></div><div class="stat"><span>Total interest</span><strong>${money(plan.interest)}</strong></div><div class="stat"><span>Total repaid</span><strong>${money(plan.total)}</strong></div><p class="disclaimer">Simplified estimate. Fees and lender-specific terms are not included.</p>`);
    });
    document.getElementById("loanResetButton")?.addEventListener("click", () => clear(["loanAmount","loanRate","loanTerm"], "loanResult"));
  }

  const sdltButton = document.getElementById("sdltCalculateButton");
  if (sdltButton) {
    const tax = (price, bands) => bands.reduce((sum, band, i) => {
      const next = bands[i + 1]?.from ?? Infinity;
      const taxable = Math.max(0, Math.min(price, next) - band.from);
      return sum + taxable * band.rate;
    }, 0);
    sdltButton.addEventListener("click", function () {
      const price = number("sdltPrice"), first = document.getElementById("sdltFirstTime")?.value === "yes", additional = document.getElementById("sdltAdditional")?.value === "yes";
      if (price <= 0) return show("sdltResult", '<h2 class="warning">Enter a property price</h2><p>Please enter the purchase price.</p>');
      if (first && price > 500000) show("sdltResult", '<h2 class="warning">First-time buyer relief does not apply above £500,000</h2><p>The standard residential bands will be used for this estimate.</p>');
      let duty;
      if (first && price <= 500000) {
        duty = tax(price, [{from:0,rate:0},{from:300000,rate:0.05}]);
      } else {
        const surcharge = additional ? 0.02 : 0;
        duty = tax(price, [{from:0,rate:surcharge},{from:125000,rate:0.02+surcharge},{from:250000,rate:0.05+surcharge},{from:925000,rate:0.10+surcharge},{from:1500000,rate:0.12+surcharge}]);
      }
      const effective = duty / price * 100;
      show("sdltResult", `<div class="result-message"><span class="mini-label">Estimated Stamp Duty</span><strong class="big-number">${money(duty)}</strong></div><div class="stat"><span>Property price</span><strong>${money(price)}</strong></div><div class="stat"><span>Effective tax rate</span><strong>${effective.toFixed(2)}%</strong></div><div class="stat"><span>First-time buyer</span><strong>${first ? "Yes" : "No"}</strong></div><div class="stat"><span>Additional property</span><strong>${additional ? "Yes" : "No"}</strong></div><p class="disclaimer">England and Northern Ireland residential estimate based on current published SDLT bands. Special cases can differ.</p>`);
    });
    document.getElementById("sdltResetButton")?.addEventListener("click", () => { clear(["sdltPrice"], "sdltResult"); if (document.getElementById("sdltFirstTime")) document.getElementById("sdltFirstTime").value = "no"; if (document.getElementById("sdltAdditional")) document.getElementById("sdltAdditional").value = "no"; });
  }

  const salaryButton = document.getElementById("salaryCalculateButton");
  if (salaryButton) {
    salaryButton.addEventListener("click", function () {
      const salary = number("salaryAmount"), region = document.getElementById("taxRegion")?.value || "rUK";
      if (salary <= 0) return show("salaryResult", '<h2 class="warning">Enter your salary</h2><p>Please enter your gross annual salary.</p>');
      const allowance = Math.max(0, 12570 - Math.max(0, (salary - 100000) / 2));
      let tax = 0;
      if (region === "scotland") {
        const bands = [[0,3967,0.19],[3967,16956,0.20],[16956,31092,0.21],[31092,62430,0.42],[62430,125140,0.45],[125140,Infinity,0.48]];
        const taxable = Math.max(0, salary - allowance);
        for (const [from,to,rate] of bands) tax += Math.max(0, Math.min(taxable,to) - from) * rate;
      } else {
        const taxable = Math.max(0, salary - allowance);
        tax = Math.max(0, Math.min(taxable,37700))*0.20 + Math.max(0, Math.min(taxable,125140)-37700)*0.40 + Math.max(0, taxable-125140)*0.45;
      }
      const ni = Math.max(0, Math.min(salary, 50270) - 12570) * 0.08 + Math.max(0, salary - 50270) * 0.02;
      const net = Math.max(0, salary - tax - ni);
      show("salaryResult", `<div class="result-message"><span class="mini-label">Estimated monthly take-home</span><strong class="big-number">${money(net / 12)}</strong></div><div class="stat"><span>Gross annual salary</span><strong>${money(salary)}</strong></div><div class="stat"><span>Estimated Income Tax</span><strong>${money(tax)}</strong></div><div class="stat"><span>Estimated National Insurance</span><strong>${money(ni)}</strong></div><div class="stat"><span>Estimated annual take-home</span><strong>${money(net)}</strong></div><p class="disclaimer">2026/27 estimate. Pension, student loan, benefits and other deductions are not included.</p>`);
    });
    document.getElementById("salaryResetButton")?.addEventListener("click", () => { clear(["salaryAmount"], "salaryResult"); });
  }
});
