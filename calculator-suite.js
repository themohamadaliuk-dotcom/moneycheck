/* WorthChex calculator suite — shared V2 engine and browser handlers. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.WorthChex = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const monthsLabel = (m) => `${m} month${m === 1 ? "" : "s"}`;
  const monthlyRate = (annual) => Math.max(0, annual) / 100 / 12;

  function annuityPayment(principal, annualRate, periods, periodsPerYear = 12) {
    if (principal <= 0 || periods <= 0) return 0;
    const r = Math.max(0, annualRate) / 100 / periodsPerYear;
    if (r === 0) return principal / periods;
    return principal * r / (1 - Math.pow(1 + r, -periods));
  }

  function loanPlan(principal, annualRate, periods, extra = 0, periodsPerYear = 12) {
    if (principal <= 0 || periods <= 0) return null;
    const base = annuityPayment(principal, annualRate, periods, periodsPerYear);
    const payment = base + Math.max(0, extra);
    const r = Math.max(0, annualRate) / 100 / periodsPerYear;
    let balance = principal;
    let interest = 0;
    let count = 0;
    const maxPeriods = Math.max(periods * 2 + 24, 1200);
    while (balance > 0.005 && count < maxPeriods) {
      const i = balance * r;
      const p = Math.min(payment, balance + i);
      const principalPaid = p - i;
      if (principalPaid <= 0) return null;
      interest += i;
      balance -= principalPaid;
      count += 1;
    }
    if (balance > 0.005) return null;
    return { basePayment: base, payment, periods: count, interest, total: principal + interest };
  }

  function savingsFutureValue(principal, contribution, rate, periods, compoundsPerYear = 12, contributionFrequency = 12) {
    if (periods <= 0) return Math.max(0, principal);
    const r = Math.max(0, rate) / 100 / compoundsPerYear;
    const growth = r === 0 ? 1 : Math.pow(1 + r, compoundsPerYear * periods / contributionFrequency);
    const totalContributions = Math.max(0, contribution) * periods;
    if (r === 0) return Math.max(0, principal) + totalContributions;
    const n = Math.round(periods * contributionFrequency);
    const nCompound = Math.max(1, Math.round(periods * compoundsPerYear));
    const principalGrowth = Math.max(0, principal) * Math.pow(1 + r, nCompound);
    const contributionRate = Math.pow(1 + r, compoundsPerYear / contributionFrequency) - 1;
    const contributionGrowth = contributionRate === 0 ? totalContributions : Math.max(0, contribution) * ((Math.pow(1 + contributionRate, n) - 1) / contributionRate);
    return principalGrowth + contributionGrowth;
  }

  function savingsRequiredForTarget(principal, target, rate, periods, compoundsPerYear = 12, contributionFrequency = 12) {
    if (target <= principal) return 0;
    if (periods <= 0) return null;
    const r = Math.max(0, rate) / 100 / compoundsPerYear;
    const nCompound = Math.round(periods * compoundsPerYear);
    const futurePrincipal = Math.max(0, principal) * Math.pow(1 + r, nCompound);
    const gap = Math.max(0, target - futurePrincipal);
    const n = Math.max(1, Math.round(periods * contributionFrequency));
    if (r === 0) return gap / n;
    const periodRate = Math.pow(1 + r, compoundsPerYear / contributionFrequency) - 1;
    return gap / ((Math.pow(1 + periodRate, n) - 1) / periodRate);
  }

  function debtRepayment(balance, annualRate, payment) {
    if (balance <= 0 || payment <= 0) return null;
    const r = monthlyRate(annualRate);
    if (r === 0) return { months: Math.ceil(balance / payment), interest: 0, total: balance };
    if (payment <= balance * r) return null;
    let left = balance, interest = 0, months = 0;
    while (left > 0.005 && months < 1200) {
      const i = left * r;
      const p = Math.min(payment, left + i);
      const principal = p - i;
      if (principal <= 0) return null;
      interest += i;
      left -= principal;
      months += 1;
    }
    if (left > 0.005) return null;
    return { months, interest, total: balance + interest };
  }

  function mortgagePlan(amount, rate, years, overpayment = 0, type = "repayment") {
    if (amount <= 0 || years <= 0) return null;
    const months = Math.max(1, Math.round(years * 12));
    const r = monthlyRate(rate);
    if (type === "interest-only") {
      const base = amount * r;
      return { payment: base, basePayment: base, interest: base * months, total: amount + base * months, months, ltv: null };
    }
    const base = annuityPayment(amount, rate, months);
    const plan = loanPlan(amount, rate, months, overpayment);
    return { payment: plan.payment, basePayment: base, interest: plan.interest, total: plan.total, months, periods: plan.periods };
  }

  function sdlt(price, { firstTime = false, additional = false, replacing = false, nonResident = false } = {}) {
    if (price <= 0) return 0;
    let result = 0;
    if (firstTime && price <= 500000) {
      result += Math.max(0, Math.min(price, 500000) - 300000) * 0.05;
    } else {
      const bands = [
        [125000, 0.00], [250000, 0.02], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]
      ];
      let lower = 0;
      for (const [upper, rate] of bands) {
        if (price <= lower) break;
        const slice = Math.max(0, Math.min(price, upper) - lower);
        result += slice * (rate + (additional && !replacing ? 0.05 : 0) + (nonResident ? 0.02 : 0));
        lower = upper;
      }
    }
    return result;
  }

  const UK_TAX = {
    allowance: 12570,
    taperStart: 100000,
    taperEnd: 125140,
    rUK: [[37700, 0.20], [125140, 0.40], [Infinity, 0.45]],
    scotland: [[3967, 0.19], [16956, 0.20], [31092, 0.21], [62430, 0.42], [125140, 0.45], [Infinity, 0.48]]
  };
  const STUDENT = {
    none: { threshold: Infinity, rate: 0 },
    plan1: { threshold: 26900, rate: 0.09 },
    plan2: { threshold: 29385, rate: 0.09 },
    plan4: { threshold: 33795, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 }
  };

  function personalAllowance(gross) {
    return clamp(UK_TAX.allowance - Math.max(0, gross - 100000) / 2, 0, UK_TAX.allowance);
  }

  function incomeTax(gross, region = "rUK") {
    const allowance = personalAllowance(gross);
    const taxable = Math.max(0, gross - allowance);
    const bands = UK_TAX[region] || UK_TAX.rUK;
    let lower = 0, tax = 0;
    for (const [width, rate] of bands) {
      const upper = width;
      const slice = Math.max(0, Math.min(taxable, upper) - lower);
      tax += slice * rate;
      if (taxable <= upper) break;
      lower = upper;
    }
    return tax;
  }

  function employeeNI(gross, category = "A") {
    if (["C", "K", "S"].includes(category)) return 0;
    const threshold = 12570, upper = 50270;
    const midRate = category === "B" || category === "E" || category === "I" ? 0.0185 : category === "D" || category === "J" || category === "L" || category === "Z" ? 0.02 : 0.08;
    const highRate = 0.02;
    return Math.max(0, Math.min(gross, upper) - threshold) * midRate + Math.max(0, gross - upper) * highRate;
  }

  function studentRepayment(gross, plan = "none") {
    const p = STUDENT[plan] || STUDENT.none;
    return Math.max(0, gross - p.threshold) * p.rate;
  }

  function takeHome(gross, options = {}) {
    const salary = Math.max(0, gross);
    const region = options.region === "scotland" ? "scotland" : "rUK";
    const pension = salary * clamp(Number(options.pensionPercent || 0), 0, 100) / 100;
    const salarySacrifice = Math.min(salary, Math.max(0, Number(options.salarySacrifice || 0)));
    const taxableGross = Math.max(0, salary - salarySacrifice);
    const tax = incomeTax(taxableGross, region);
    const ni = employeeNI(taxableGross, options.niCategory || "A");
    const student = studentRepayment(salary, options.studentPlan || "none");
    const pg = options.postgraduate ? studentRepayment(salary, "postgraduate") : 0;
    const net = Math.max(0, salary - tax - ni - student - pg - pension);
    return { gross: salary, tax, ni, pension, salarySacrifice, student, postgraduate: pg, net, monthly: net / 12, weekly: net / 52 };
  }

  function renderPage() {
    const W = window.WorthChex;
    if (!W) return;
    const $ = (id) => document.getElementById(id);
    const n = (id) => Math.max(0, Number($(id)?.value || 0));
    const has = (id) => !!$(id) && String($(id).value).trim() !== "";
    const show = (id, html) => { const el = $(id); if (!el) return; el.innerHTML = html; el.classList.remove("hidden"); setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30); };
    const clear = (ids, resultId) => { ids.forEach(id => { if ($(id)) $(id).value = ""; }); if ($(resultId)) { $(resultId).innerHTML = ""; $(resultId).classList.add("hidden"); } };
    const stat = (label, value) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`;

    // AFFORDABILITY
    if ($("calculateButton")) {
      $("calculateButton").addEventListener("click", () => {
        const income = n("income"), purchase = n("purchase"), savings = n("savings"), emergency = n("emergency");
        if (income <= 0) return show("result", '<h2 class="bad">Enter your monthly take-home income</h2><p>We need your monthly take-home pay before we can assess the purchase.</p>');
        if (purchase <= 0) return show("result", '<h2 class="warning">Enter the purchase price</h2><p>Tell us what the item costs.</p>');
        const expenseIds = ["rent", "bills", "food", "transport", "subscriptions", "debt"];
        const expenses = expenseIds.reduce((sum, id) => sum + (has(id) ? n(id) : 0), 0);
        const disposable = income - expenses;
        const mode = $("purchaseType")?.value || "cash";
        let payment = 0, deposit = 0, financeAmount = 0, financeInterest = 0, totalRepay = 0;
        if (mode === "finance") {
          deposit = Math.min(purchase, n("deposit"));
          financeAmount = Math.max(0, purchase - deposit);
          const plan = loanPlan(financeAmount, n("financeRate"), Math.max(1, n("financeTerm") * 12), n("financeExtra"));
          if (!plan) return show("result", '<h2 class="bad">The finance option cannot be repaid</h2><p>Increase the term or monthly affordability, or reduce the finance amount.</p>');
          payment = plan.payment; financeInterest = plan.interest; totalRepay = plan.total;
        }
        const cashRemaining = savings - (mode === "cash" ? purchase : deposit);
        const emergencyGap = has("emergency") && has("savings") ? Math.max(0, emergency - cashRemaining) : null;
        const monthlyAfter = disposable - payment;
        const paymentShare = disposable > 0 ? payment / disposable * 100 : 100;
        let score = 100, tone = "good", title = "Looks manageable";
        if (disposable <= 0) { score = 5; tone = "bad"; title = "Your budget has no spare monthly income"; }
        else if (mode === "finance" && (payment > disposable * 0.3 || monthlyAfter <= 0)) { score = 35; tone = "bad"; title = "The finance would leave little breathing room"; }
        else if (mode === "finance" && payment > disposable * 0.2) { score = 60; tone = "warning"; title = "I'd think carefully about this finance"; }
        else if (mode === "cash" && has("savings") && cashRemaining < 0) { score = 25; tone = "bad"; title = "Your savings do not cover the cash purchase"; }
        else if (mode === "cash" && emergencyGap > 0) { score = 55; tone = "warning"; title = "The purchase would reduce your emergency buffer"; }
        else if (mode === "finance" && paymentShare <= 10) { score = 95; tone = "good"; }
        else if (mode === "finance" && paymentShare <= 20) { score = 80; tone = "good"; }
        else if (mode === "cash" && has("savings") && cashRemaining >= 0) { score = 90; tone = "good"; }
        show("result", `<div class="score-circle"><span>${score}</span><small>score</small></div><h2 class="${tone}">${title}</h2>${stat("Monthly disposable income", money(disposable))}${mode === "finance" ? stat("Deposit", money(deposit)) + stat("Estimated monthly payment", money(payment)) + stat("Finance interest", money(financeInterest)) + stat("Total finance repayment", money(totalRepay)) + stat("Payment as share of disposable income", `${paymentShare.toFixed(0)}%`) : stat("Cash purchase", money(purchase)) + (has("savings") ? stat("Savings after purchase", money(cashRemaining)) : "")}${emergencyGap !== null ? stat("Emergency-fund shortfall", emergencyGap > 0 ? `<span class="bad">${money(emergencyGap)}</span>` : `<span class="good">None</span>`) : ""}<div class="result-message ${tone}"><p>${mode === "finance" ? `After the estimated finance payment, around <strong>${money(Math.max(0, monthlyAfter))}</strong> remains each month.` : `The cash purchase is assessed separately from your monthly budget. ${has("savings") ? `You would have <strong>${money(Math.max(0, cashRemaining))}</strong> of the entered savings remaining after the purchase.` : "Add current savings to assess the cash-buffer impact."}`}</p></div><p class="disclaimer">Planning estimate only. It cannot account for every future cost, lender rule or personal circumstance.</p>`);
      });
      $("resetButton")?.addEventListener("click", () => clear(["income","rent","bills","food","transport","subscriptions","debt","savings","emergency","purchase","deposit","financeRate","financeTerm","financeExtra"], "result"));
    }

    // SAVINGS
    if ($("savingsCalculateButton")) {
      const toggleSavingsMode = () => {
        const target = $("savingsMode")?.value || "monthly";
        document.querySelectorAll("[data-savings-target]").forEach(el => { el.hidden = el.getAttribute("data-savings-target") !== target; });
      };
      toggleSavingsMode(); $("savingsMode")?.addEventListener("change", toggleSavingsMode);
      $("savingsCalculateButton").addEventListener("click", () => {
        const current = n("currentSavings"), goal = n("savingsGoal"), rate = n("savingsRate"), mode = $("savingsMode")?.value || "monthly";
        if (goal <= 0) return show("savingsResult", '<h2 class="warning">Enter a savings goal</h2><p>Choose the amount you want to reach.</p>');
        if (current >= goal) return show("savingsResult", `<div class="score-circle"><span>100</span><small>%</small></div><h2 class="good">Goal already reached 🎉</h2><p>You have ${money(current)} against a target of ${money(goal)}.</p>`);
        const compounds = Number($("savingsCompounding")?.value || 12);
        let months, monthly;
        if (mode === "date") {
          const dateValue = $("savingsTargetDate")?.value;
          if (!dateValue) return show("savingsResult", '<h2 class="warning">Choose a target date</h2><p>Pick the date by which you want to reach your goal.</p>');
          const target = new Date(`${dateValue}T12:00:00`), now = new Date();
          months = Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30.4375)));
          monthly = savingsRequiredForTarget(current, goal, rate, months / 12, compounds, 12);
        } else {
          monthly = n("monthlySaving");
          if (monthly <= 0) return show("savingsResult", '<h2 class="warning">Enter a monthly contribution</h2><p>Or switch to target-date mode.</p>');
          months = 1;
          while (months <= 1200 && savingsFutureValue(current, monthly, rate, months / 12, compounds, 12) < goal) months++;
          if (months > 1200) return show("savingsResult", '<h2 class="bad">This goal is beyond the current model</h2><p>Increase the contribution or rate, or choose a longer planning horizon.</p>');
        }
        const future = savingsFutureValue(current, monthly, rate, months / 12, compounds, 12);
        const noInterest = current + monthly * months;
        const growth = Math.max(0, future - noInterest);
        const progress = clamp(current / goal * 100, 0, 100);
        const annualised = rate > 0 ? ` at ${rate.toFixed(2)}%` : " with no interest assumption";
        const d = new Date(); d.setMonth(d.getMonth() + months);
        show("savingsResult", `<div class="score-circle"><span>${progress.toFixed(0)}</span><small>% there</small></div><h2>${mode === "date" ? `You need about ${money(monthly)} a month` : `Goal in about ${monthsLabel(months)}`}</h2>${stat("Target", money(goal))}${stat("Current savings", money(current))}${stat("Monthly contribution", money(monthly))}${stat("Assumed growth", money(growth))}${stat("Estimated value at target", money(future))}${stat("Estimated goal month", d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }))}<div class="what-if-box"><strong>What if you save more?</strong>${stat("+£25/month", months > 0 ? `${monthsLabel(Math.max(1, Math.ceil(Math.max(0, goal-current)/(monthly+25))))}` : "")}${stat("+£50/month", months > 0 ? `${monthsLabel(Math.max(1, Math.ceil(Math.max(0, goal-current)/(monthly+50))))}` : "")}</div><p class="disclaimer">Uses a constant rate${annualised}. Savings interest, contributions and tax rules can vary in reality.</p>`);
      });
      $("savingsResetButton")?.addEventListener("click", () => clear(["currentSavings","savingsGoal","monthlySaving","savingsRate","savingsTargetDate"], "savingsResult"));
    }

    // DEBT
    if ($("debtCalculateButton")) {
      const toggleDebtMode = () => { const mode = $("debtMode")?.value || "payment"; document.querySelectorAll("[data-debt-target]").forEach(el => { el.hidden = el.getAttribute("data-debt-target") !== mode; }); };
      toggleDebtMode(); $("debtMode")?.addEventListener("change", toggleDebtMode);
      $("debtCalculateButton").addEventListener("click", () => {
        const balance = n("debtBalance"), rate = n("interestRate"), mode = $("debtMode")?.value || "payment", extra = n("debtExtra");
        if (balance <= 0) return show("debtResult", '<h2 class="warning">Enter your current debt</h2><p>We need the outstanding balance before calculating.</p>');
        let payment = n("debtPayment");
        if (mode === "target") { const months = Math.max(1, Math.round(n("debtTargetMonths"))); payment = annuityPayment(balance, rate, months) + extra; }
        const plan = debtRepayment(balance, rate, payment);
        if (!plan) return show("debtResult", '<h2 class="bad">This payment does not reduce the debt</h2><p>Increase the monthly payment above the monthly interest charge.</p>');
        const plus25 = debtRepayment(balance, rate, payment + 25), plus50 = debtRepayment(balance, rate, payment + 50);
        show("debtResult", `<div class="score-circle"><span>${Math.max(1, Math.round(100 - plan.months / 12))}</span><small>plan</small></div><h2 class="good">Estimated payoff in ${monthsLabel(plan.months)}</h2>${stat("Monthly payment", money(payment))}${stat("Total interest", money(plan.interest))}${stat("Total repaid", money(plan.total))}${stat("Estimated payoff", (() => { const d = new Date(); d.setMonth(d.getMonth() + plan.months); return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }); })())}<div class="what-if-box"><strong>Paying extra each month</strong>${stat("£25 extra", plus25 ? `${monthsLabel(plus25.months)} · ${money(plus25.interest)} interest` : "")}${stat("£50 extra", plus50 ? `${monthsLabel(plus50.months)} · ${money(plus50.interest)} interest` : "")}</div><p class="disclaimer">Simplified monthly-interest model. Lenders may use different interest and payment timing.</p>`);
      });
      $("debtResetButton")?.addEventListener("click", () => clear(["debtBalance","interestRate","debtPayment","debtExtra","debtTargetMonths"], "debtResult"));
    }

    // MORTGAGE
    if ($("mortgageCalculateButton")) {
      $("mortgageCalculateButton").addEventListener("click", () => {
        const price = n("mortgagePrice"), deposit = Math.min(price, n("mortgageDeposit")), rate = n("mortgageRate"), years = n("mortgageTerm"), over = n("mortgageOverpayment"), type = $("mortgageType")?.value || "repayment";
        if (price <= 0 || years <= 0) return show("mortgageResult", '<h2 class="warning">Enter the property price and term</h2><p>We need enough information to model the mortgage.</p>');
        const amount = Math.max(0, price - deposit), plan = mortgagePlan(amount, rate, years, over, type);
        const ltv = price > 0 ? amount / price * 100 : 0;
        const interestOnly = type === "interest-only";
        const stamp = sdlt(price, { firstTime: $("mortgageFirstTime")?.value === "yes", additional: $("mortgageAdditional")?.value === "yes", replacing: $("mortgageReplacing")?.value === "yes" });
        show("mortgageResult", `<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div>${stat("Property price", money(price))}${stat("Deposit", money(deposit))}${stat("Mortgage amount", money(amount))}${stat("Loan-to-value (LTV)", `${ltv.toFixed(1)}%`)}${stat("Interest rate", `${rate.toFixed(2)}%`)}${stat("Mortgage type", interestOnly ? "Interest-only" : "Repayment")}${stat("Total interest", money(plan.interest))}${stat("Total paid on mortgage", money(plan.total))}${stat("Illustrative Stamp Duty", money(stamp))}<div class="what-if-box"><strong>Overpayment scenario</strong>${stat("Regular payment", money(plan.basePayment))}${over > 0 ? stat("With overpayment", money(plan.payment)) : stat("Extra payment", "£0.00")}</div><p class="disclaimer">Mortgage estimate only. It assumes a constant rate; real products can have fees, fixed periods, variable rates and lender-specific rules.</p>`);
      });
      $("mortgageResetButton")?.addEventListener("click", () => clear(["mortgagePrice","mortgageDeposit","mortgageRate","mortgageTerm","mortgageOverpayment"], "mortgageResult"));
    }

    // TAKE HOME PAY
    if ($("salaryCalculateButton")) {
      const toggleSalary = () => { const plan = $("studentPlan")?.value || "none"; if ($( "postgraduate")) $("postgraduate").disabled = plan === "postgraduate"; };
      toggleSalary(); $("studentPlan")?.addEventListener("change", toggleSalary);
      $("salaryCalculateButton").addEventListener("click", () => {
        const salaryInput = n("salaryAmount"), frequency = $("salaryFrequency")?.value || "annual";
        if (salaryInput <= 0) return show("salaryResult", '<h2 class="warning">Enter your gross pay</h2><p>Enter a positive salary or wage amount.</p>');
        const multiplier = frequency === "monthly" ? 12 : frequency === "weekly" ? 52 : 1;
        const gross = salaryInput * multiplier;
        const result = takeHome(gross, { region: $("taxRegion")?.value, pensionPercent: n("pensionPercent"), salarySacrifice: n("salarySacrifice"), studentPlan: $("studentPlan")?.value, postgraduate: $("postgraduate")?.checked, niCategory: $("niCategory")?.value || "A" });
        show("salaryResult", `<div class="result-message"><span class="mini-label">Estimated monthly take-home</span><strong class="big-number">${money(result.monthly)}</strong></div>${stat("Gross annual pay", money(result.gross))}${stat("Income Tax", money(result.tax))}${stat("Employee National Insurance", money(result.ni))}${stat("Pension contribution", money(result.pension))}${stat("Student loan", money(result.student))}${stat("Postgraduate loan", money(result.postgraduate))}${stat("Estimated annual take-home", money(result.net))}<p class="disclaimer">2026/27 estimate using published UK Income Tax and National Insurance rules. Payslips can differ because of tax codes, benefits, salary sacrifice, pensions, loans and payroll timing.</p>`);
      });
      $("salaryResetButton")?.addEventListener("click", () => clear(["salaryAmount","pensionPercent","salarySacrifice"], "salaryResult"));
    }

    // COMPOUND INTEREST
    if ($("compoundCalculateButton")) {
      $("compoundCalculateButton").addEventListener("click", () => {
        const initial = n("compoundInitial"), contribution = n("compoundContribution"), rate = n("compoundRate"), years = n("compoundYears"), compounds = Number($("compoundCompounding")?.value || 12), freq = Number($("compoundContributionFrequency")?.value || 12);
        if (years <= 0) return show("compoundResult", '<h2 class="warning">Enter a time period</h2><p>Choose a positive investment period.</p>');
        const value = savingsFutureValue(initial, contribution, rate, years, compounds, freq), contributed = initial + contribution * years * freq, growth = value - contributed;
        show("compoundResult", `<div class="result-message"><span class="mini-label">Estimated future value</span><strong class="big-number">${money(value)}</strong></div>${stat("Starting balance", money(initial))}${stat("Regular contribution", money(contribution))}${stat("Total contributions", money(contributed))}${stat("Assumed annual rate", `${rate.toFixed(2)}%`)}${stat("Estimated growth", money(Math.max(0, growth)))}${stat("Time", `${years} years`)}<p class="disclaimer">Illustrative compound-growth model. It does not guarantee investment returns and does not include tax or product fees.</p>`);
      });
      $("compoundResetButton")?.addEventListener("click", () => clear(["compoundInitial","compoundContribution","compoundRate","compoundYears"], "compoundResult"));
    }

    // SDLT
    if ($("sdltCalculateButton")) {
      $("sdltCalculateButton").addEventListener("click", () => {
        const price = n("sdltPrice");
        if (price <= 0) return show("sdltResult", '<h2 class="warning">Enter a property price</h2><p>We need the purchase price to estimate Stamp Duty.</p>');
        const first = $("sdltFirstTime")?.value === "yes", additional = $("sdltAdditional")?.value === "yes", replacing = $("sdltReplacing")?.value === "yes", nonResident = $("sdltNonResident")?.value === "yes";
        const duty = sdlt(price, { firstTime: first, additional, replacing, nonResident });
        const relief = first && price <= 500000;
        show("sdltResult", `<div class="result-message"><span class="mini-label">Estimated Stamp Duty</span><strong class="big-number">${money(duty)}</strong></div>${stat("Property price", money(price))}${stat("Effective tax rate", `${(duty / price * 100).toFixed(2)}%`)}${stat("First-time buyer relief", relief ? "Applied" : "Not applied")}${stat("Additional-property surcharge", additional && !replacing ? "Included" : "Not included")}${stat("Non-UK-resident surcharge", nonResident ? "Included" : "Not included")}<p class="disclaimer">England and Northern Ireland residential estimate based on current published SDLT rates. Complex or special transactions can differ.</p>`);
      });
      $("sdltResetButton")?.addEventListener("click", () => clear(["sdltPrice"], "sdltResult"));
    }

    // PERSONAL LOAN
    if ($("loanCalculateButton")) {
      $("loanCalculateButton").addEventListener("click", () => {
        const amount = n("loanAmount"), rate = n("loanRate"), years = n("loanTerm"), extra = n("loanExtra"), fee = n("loanFee");
        if (amount <= 0 || years <= 0) return show("loanResult", '<h2 class="warning">Enter the loan amount and term</h2><p>Use positive values for the amount and term.</p>');
        const plan = loanPlan(amount + fee, rate, years * 12, extra);
        if (!plan) return show("loanResult", '<h2 class="bad">The selected loan terms cannot be repaid</h2><p>Increase the term or reduce the borrowing cost.</p>');
        const faster = loanPlan(amount + fee, rate, years * 12, extra + 50);
        show("loanResult", `<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div>${stat("Loan amount", money(amount))}${stat("Upfront/added fee", money(fee))}${stat("APR", `${rate.toFixed(2)}%`)}${stat("Total interest", money(plan.interest))}${stat("Total repaid including fee", money(plan.total))}<div class="what-if-box"><strong>What if you paid £50 more each month?</strong>${stat("New monthly payment", money((plan.payment || 0) + 50))}${faster ? stat("Estimated payoff", monthsLabel(faster.periods)) : ""}${faster ? stat("Estimated interest", money(faster.interest)) : ""}</div><p class="disclaimer">Simplified amortisation estimate. Lender fees, APR conventions and early repayment rules may differ.</p>`);
      });
      $("loanResetButton")?.addEventListener("click", () => clear(["loanAmount","loanRate","loanTerm","loanExtra","loanFee"], "loanResult"));
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderPage);
    else renderPage();
  }

  return { clamp, money, annuityPayment, loanPlan, savingsFutureValue, savingsRequiredForTarget, debtRepayment, mortgagePlan, sdlt, personalAllowance, incomeTax, employeeNI, studentRepayment, takeHome };
});
