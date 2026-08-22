/* WorthChex Calculator Suite — production V3 engine */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.WorthChexFinal = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const money = n => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const monthlyRate = annual => Math.max(0, annual) / 100 / 12;

  function annuityPayment(principal, annualRate, periods, periodsPerYear = 12) {
    if (principal <= 0 || periods <= 0) return 0;
    const r = Math.max(0, annualRate) / 100 / periodsPerYear;
    return r === 0 ? principal / periods : principal * r / (1 - Math.pow(1 + r, -periods));
  }

  function amortise(principal, annualRate, plannedPeriods, extra = 0, periodsPerYear = 12) {
    if (principal <= 0 || plannedPeriods <= 0) return null;
    const base = annuityPayment(principal, annualRate, plannedPeriods, periodsPerYear);
    const payment = base + Math.max(0, extra);
    const r = Math.max(0, annualRate) / 100 / periodsPerYear;
    if (payment <= 0) return null;
    let balance = principal, interest = 0, periods = 0;
    const max = Math.max(1200, plannedPeriods * 3 + 24);
    while (balance > 0.005 && periods < max) {
      const i = balance * r;
      const p = Math.min(payment, balance + i);
      const principalPart = p - i;
      if (principalPart <= 0) return null;
      interest += i;
      balance -= principalPart;
      periods += 1;
    }
    if (balance > 0.005) return null;
    return { basePayment: base, payment, periods, interest, total: principal + interest };
  }

  function debtPlan(balance, annualRate, payment) {
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
    return left <= 0.005 ? { months, interest, total: balance + interest } : null;
  }

  function periodicRate(annualRate, compoundsPerYear, contributionFrequency) {
    if (annualRate <= 0) return 0;
    const compoundRate = annualRate / 100 / compoundsPerYear;
    return Math.pow(1 + compoundRate, compoundsPerYear / contributionFrequency) - 1;
  }

  function futureValue(principal, contribution, annualRate, years, compoundsPerYear = 12, contributionFrequency = 12) {
    if (years <= 0) return Math.max(0, principal);
    const n = Math.max(1, Math.round(years * contributionFrequency));
    const r = periodicRate(annualRate, compoundsPerYear, contributionFrequency);
    const p = Math.max(0, principal);
    const c = Math.max(0, contribution);
    if (r === 0) return p + c * n;
    const factor = Math.pow(1 + r, n);
    return p * factor + c * ((factor - 1) / r);
  }

  function monthlyFutureValue(principal, monthlyContribution, annualRate, months, compoundsPerYear = 12) {
    return futureValue(principal, monthlyContribution, annualRate, months / 12, compoundsPerYear, 12);
  }

  function requiredMonthlySaving(principal, target, annualRate, months, compoundsPerYear = 12) {
    if (target <= principal) return 0;
    if (months <= 0) return null;
    const r = periodicRate(annualRate, compoundsPerYear, 12);
    const growth = r === 0 ? 1 : Math.pow(1 + r, months);
    const gap = Math.max(0, target - principal * growth);
    return r === 0 ? gap / months : gap / ((growth - 1) / r);
  }

  function mortgagePlan(amount, rate, years, overpayment, type) {
    if (amount <= 0 || years <= 0) return null;
    const months = Math.round(years * 12);
    const r = monthlyRate(rate);
    if (type === "interest-only") {
      const payment = amount * r;
      return { payment, basePayment: payment, interest: payment * months, total: amount + payment * months, months, periods: months };
    }
    const plan = amortise(amount, rate, months, overpayment, 12);
    if (!plan) return null;
    return { ...plan, months };
  }

  function sdlt(price, opts = {}) {
    if (price <= 0) return 0;
    const { firstTime = false, additional = false, replacing = false, nonResident = false } = opts;
    const surcharge = (additional && !replacing ? 0.05 : 0) + (nonResident ? 0.02 : 0);
    if (firstTime && price <= 500000) {
      return Math.max(0, Math.min(price, 500000) - 300000) * (0.05 + surcharge);
    }
    const bands = [[0,125000,0],[125000,250000,0.02],[250000,925000,0.05],[925000,1500000,0.10],[1500000,Infinity,0.12]];
    return bands.reduce((sum, [low, high, rate]) => {
      const slice = Math.max(0, Math.min(price, high) - low);
      return sum + slice * (rate + surcharge);
    }, 0);
  }

  const STUDENT = {
    none: { threshold: Infinity, rate: 0 },
    plan1: { threshold: 26900, rate: 0.09 },
    plan2: { threshold: 29385, rate: 0.09 },
    plan4: { threshold: 33795, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 }
  };

  function personalAllowance(gross) {
    return clamp(12570 - Math.max(0, gross - 100000) / 2, 0, 12570);
  }

  function incomeTax(gross, region = "rUK") {
    const taxable = Math.max(0, gross - personalAllowance(gross));
    const bands = region === "scotland"
      ? [[0,3967,0.19],[3967,16956,0.20],[16956,31092,0.21],[31092,62430,0.42],[62430,125140,0.45],[125140,Infinity,0.48]]
      : [[0,37700,0.20],[37700,125140,0.40],[125140,Infinity,0.45]];
    return bands.reduce((sum, [low, high, rate]) => sum + Math.max(0, Math.min(taxable, high) - low) * rate, 0);
  }

  function employeeNI(gross, category = "A") {
    if (["C","K","S"].includes(category)) return 0;
    const middleRate = ["B","E","I"].includes(category) ? 0.0185 : 0.08;
    const upperRate = ["D","J","L","Z"].includes(category) ? 0.02 : 0.02;
    return Math.max(0, Math.min(gross, 50270) - 12570) * middleRate + Math.max(0, gross - 50270) * upperRate;
  }

  function loanRepayment(gross, plan) {
    const p = STUDENT[plan] || STUDENT.none;
    return Math.max(0, gross - p.threshold) * p.rate;
  }

  function takeHome(gross, opts = {}) {
    const salary = Math.max(0, gross);
    const sacrifice = Math.min(salary, Math.max(0, Number(opts.salarySacrifice || 0)));
    const taxableGross = Math.max(0, salary - sacrifice);
    const tax = incomeTax(taxableGross, opts.region === "scotland" ? "scotland" : "rUK");
    const ni = employeeNI(taxableGross, opts.niCategory || "A");
    const pension = salary * clamp(Number(opts.pensionPercent || 0), 0, 100) / 100;
    const student = loanRepayment(salary, opts.studentPlan || "none");
    const postgraduate = opts.postgraduate ? loanRepayment(salary, "postgraduate") : 0;
    const net = Math.max(0, salary - tax - ni - pension - student - postgraduate - sacrifice);
    return { gross: salary, tax, ni, pension, sacrifice, student, postgraduate, net, monthly: net / 12, weekly: net / 52 };
  }

  function render() {
    const $ = id => document.getElementById(id);
    const n = id => Math.max(0, Number($(id)?.value || 0));
    const has = id => !!$(id) && String($(id).value).trim() !== "";
    const show = (id, html) => { const el = $(id); if (!el) return; el.innerHTML = html; el.classList.remove("hidden"); };
    const clear = (ids, result) => { ids.forEach(id => { if ($(id)) $(id).value = ""; }); if ($(result)) { $(result).innerHTML = ""; $(result).classList.add("hidden"); } };
    const stat = (a,b) => `<div class="stat"><span>${a}</span><strong>${b}</strong></div>`;

    if ($("calculateButton")) {
      $("calculateButton").addEventListener("click", () => {
        const income=n("income"), purchase=n("purchase"), savings=n("savings"), emergency=n("emergency");
        if (income<=0) return show("result", '<h2 class="bad">Enter your monthly take-home income</h2><p>We need your monthly take-home pay before assessing the purchase.</p>');
        if (purchase<=0) return show("result", '<h2 class="warning">Enter the purchase price</h2><p>Tell us what the item costs.</p>');
        const expenses=["rent","bills","food","transport","subscriptions","debt"].reduce((s,id)=>s+(has(id)?n(id):0),0);
        const disposable=income-expenses, mode=$("purchaseType")?.value||"cash";
        let deposit=0,payment=0,financeInterest=0,totalFinance=0;
        if(mode==="finance"){
          deposit=Math.min(purchase,n("deposit"));
          const plan=amortise(Math.max(0,purchase-deposit),n("financeRate"),Math.max(1,n("financeTerm")*12),n("financeExtra"));
          if(!plan)return show("result",'<h2 class="bad">This finance plan does not amortise</h2><p>Increase the term, reduce the rate or reduce the financed amount.</p>');
          payment=plan.payment; financeInterest=plan.interest; totalFinance=plan.total;
        }
        const cashRemaining=savings-(mode==="cash"?purchase:deposit);
        const emergencyGap=has("savings")&&has("emergency")?Math.max(0,emergency-cashRemaining):null;
        const monthlyAfter=disposable-payment;
        const share=disposable>0?payment/disposable*100:100;
        let score=70,tone="warning",title="Review the assumptions carefully";
        if(disposable<=0){score=5;tone="bad";title="Your budget has no spare monthly income";}
        else if(mode==="finance"&&monthlyAfter<=0){score=20;tone="bad";title="The finance payment does not fit";}
        else if(mode==="finance"&&share>30){score=35;tone="bad";title="The finance would leave little breathing room";}
        else if(mode==="finance"&&share>20){score=60;tone="warning";title="I'd think carefully about this finance";}
        else if(mode==="finance"){score=share<=10?95:80;tone="good";title="The finance looks manageable";}
        else if(!has("savings")){score=65;tone="warning";title="It may be affordable, but savings safety is unknown";}
        else if(cashRemaining<0){score=20;tone="bad";title="Your savings do not cover the cash purchase";}
        else if(emergencyGap>0){score=55;tone="warning";title="The purchase would reduce your emergency buffer";}
        else if(purchase>0&&savings>0&&purchase/savings>0.5){score=70;tone="warning";title="The cash purchase uses a large share of your savings";}
        else{score=90;tone="good";title="The cash purchase looks manageable";}
        show("result",`<div class="score-circle"><span>${score}</span><small>score</small></div><h2 class="${tone}">${title}</h2>${stat("Monthly disposable income",money(disposable))}${mode==="finance"?stat("Deposit",money(deposit))+stat("Estimated monthly payment",money(payment))+stat("Finance interest",money(financeInterest))+stat("Total finance repayment",money(totalFinance))+stat("Payment share",`${share.toFixed(0)}%`):stat("Cash purchase",money(purchase))+(has("savings")?stat("Savings after purchase",money(cashRemaining)):"")}${emergencyGap!==null?stat("Emergency-fund shortfall",emergencyGap?`<span class="bad">${money(emergencyGap)}</span>`:'<span class="good">None</span>'):""}<div class="result-message ${tone}"><p>${mode==="finance"?`After the estimated finance payment, around <strong>${money(Math.max(0,monthlyAfter))}</strong> remains each month.`:has("savings")?`The cash purchase would leave <strong>${money(Math.max(0,cashRemaining))}</strong> of the savings you entered.`:"Add current savings and an emergency-fund target for a stronger cash-purchase check."}</p></div><p class="disclaimer">Planning estimate only. It is not a lender decision or personalised financial advice.</p>`);
      });
      $("resetButton")?.addEventListener("click",()=>clear(["income","rent","bills","food","transport","subscriptions","debt","savings","emergency","purchase","deposit","financeRate","financeTerm","financeExtra"],"result"));
    }

    if ($("savingsCalculateButton")) {
      const toggle=()=>{const mode=$("savingsMode")?.value||"monthly";document.querySelectorAll("[data-savings-target]").forEach(el=>el.hidden=el.dataset.savingsTarget!==mode);};
      toggle();$("savingsMode")?.addEventListener("change",toggle);
      $("savingsCalculateButton").addEventListener("click",()=>{
        const current=n("currentSavings"),goal=n("savingsGoal"),rate=n("savingsRate"),mode=$("savingsMode")?.value||"monthly";
        if(goal<=0)return show("savingsResult",'<h2 class="warning">Enter a savings goal</h2><p>Choose the amount you want to reach.</p>');
        if(current>=goal)return show("savingsResult",`<div class="score-circle"><span>100</span><small>%</small></div><h2 class="good">Goal already reached 🎉</h2><p>You have ${money(current)} against a target of ${money(goal)}.</p>`);
        let months,monthly;
        if(mode==="date"){
          const value=$("savingsTargetDate")?.value;if(!value)return show("savingsResult",'<h2 class="warning">Choose a target date</h2><p>Select the date by which you want to reach the goal.</p>');
          const target=new Date(`${value}T12:00:00`), now=new Date();months=Math.max(1,Math.ceil((target-now)/(1000*60*60*24*30.4375)));monthly=requiredMonthlySaving(current,goal,rate,months,Number($("savingsCompounding")?.value||12));
        }else{
          monthly=n("monthlySaving");if(monthly<=0)return show("savingsResult",'<h2 class="warning">Enter a monthly contribution</h2><p>Or switch to target-date mode.</p>');
          months=1;while(months<=1200&&monthlyFutureValue(current,monthly,rate,months,Number($("savingsCompounding")?.value||12))<goal)months++;if(months>1200)return show("savingsResult",'<h2 class="bad">The current plan does not reach the goal within 100 years</h2><p>Increase the contribution or review the target.</p>');
        }
        const value=monthlyFutureValue(current,monthly,rate,months,Number($("savingsCompounding")?.value||12));const contributions=current+monthly*months;const growth=Math.max(0,value-contributions);const date=new Date();date.setMonth(date.getMonth()+months);
        const faster25=mode==="monthly"?Math.max(1,Math.ceil(months*monthly/Math.max(1,monthly+25))):null;const faster50=mode==="monthly"?Math.max(1,Math.ceil(months*monthly/Math.max(1,monthly+50))):null;
        show("savingsResult",`<div class="score-circle"><span>${Math.min(100,Math.round(current/goal*100))}</span><small>% there</small></div><h2>${mode==="date"?`Save about ${money(monthly)} a month`:`Goal in about ${months} months`}</h2>${stat("Target",money(goal))}${stat("Current savings",money(current))}${stat("Monthly contribution",money(monthly))}${stat("Estimated growth",money(growth))}${stat("Estimated value",money(value))}${stat("Estimated goal month",date.toLocaleDateString("en-GB",{month:"long",year:"numeric"}))}${mode==="monthly"?`<div class="what-if-box"><strong>What if you save more?</strong>${stat("+£25/month",`${faster25} months`)}${stat("+£50/month",`${faster50} months`)}</div>`:""}<p class="disclaimer">Uses a constant rate assumption. Actual savings rates, tax and contributions can change.</p>`);
      });
      $("savingsResetButton")?.addEventListener("click",()=>clear(["currentSavings","savingsGoal","monthlySaving","savingsRate","savingsTargetDate"],"savingsResult"));
    }

    if ($("debtCalculateButton")) {
      const toggle=()=>{const mode=$("debtMode")?.value||"payment";document.querySelectorAll("[data-debt-target]").forEach(el=>el.hidden=el.dataset.debtTarget!==mode);};
      toggle();$("debtMode")?.addEventListener("change",toggle);
      $("debtCalculateButton").addEventListener("click",()=>{const balance=n("debtBalance"),rate=n("interestRate"),extra=n("debtExtra"),mode=$("debtMode")?.value||"payment";if(balance<=0)return show("debtResult",'<h2 class="warning">Enter your current debt</h2><p>We need the outstanding balance first.</p>');let payment=n("debtPayment");if(mode==="target")payment=annuityPayment(balance,rate,Math.max(1,n("debtTargetMonths")))+extra;const plan=debtPlan(balance,rate,payment);if(!plan)return show("debtResult",'<h2 class="bad">This payment does not reduce the debt</h2><p>Increase the payment above the monthly interest charge.</p>');const p25=debtPlan(balance,rate,payment+25),p50=debtPlan(balance,rate,payment+50),d=new Date();d.setMonth(d.getMonth()+plan.months);show("debtResult",`<div class="score-circle"><span>${Math.max(1,100-Math.floor(plan.months/12))}</span><small>plan</small></div><h2 class="good">Estimated payoff in ${plan.months} months</h2>${stat("Monthly payment",money(payment))}${stat("Total interest",money(plan.interest))}${stat("Total repaid",money(plan.total))}${stat("Estimated payoff",d.toLocaleDateString("en-GB",{month:"long",year:"numeric"}))}<div class="what-if-box"><strong>Extra-payment scenarios</strong>${stat("+£25/month",`${p25?.months||"—"} months · ${p25?money(p25.interest):"—"} interest`)}${stat("+£50/month",`${p50?.months||"—"} months · ${p50?money(p50.interest):"—"} interest`)}</div><p class="disclaimer">Simplified monthly-interest model. Actual lender calculations can differ.</p>`);});
      $("debtResetButton")?.addEventListener("click",()=>clear(["debtBalance","interestRate","debtPayment","debtExtra","debtTargetMonths"],"debtResult"));
    }

    if ($("mortgageCalculateButton")) {
      $("mortgageCalculateButton").addEventListener("click",()=>{const price=n("mortgagePrice"),deposit=Math.min(price,n("mortgageDeposit")),amount=Math.max(0,price-deposit),rate=n("mortgageRate"),years=n("mortgageTerm"),over=n("mortgageOverpayment"),type=$("mortgageType")?.value||"repayment";if(price<=0||years<=0)return show("mortgageResult",'<h2 class="warning">Enter the property price and term</h2><p>Provide enough information to model the mortgage.</p>');const plan=mortgagePlan(amount,rate,years,over,type);if(!plan)return show("mortgageResult",'<h2 class="bad">Mortgage plan unavailable</h2><p>Check the amount, rate and term.</p>');const ltv=price?amount/price*100:0;const stamp=sdlt(price,{firstTime:$("mortgageFirstTime")?.value==="yes",additional:$("mortgageAdditional")?.value==="yes",replacing:$("mortgageReplacing")?.value==="yes"});show("mortgageResult",`<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div>${stat("Property price",money(price))}${stat("Deposit",money(deposit))}${stat("Mortgage amount",money(amount))}${stat("LTV",`${ltv.toFixed(1)}%`)}${stat("Interest rate",`${rate.toFixed(2)}%`)}${stat("Mortgage type",type==="interest-only"?"Interest-only":"Repayment")}${stat("Total interest",money(plan.interest))}${stat("Total mortgage paid",money(plan.total))}${stat("Illustrative SDLT",money(stamp))}${over>0&&type==="repayment"?stat("Payment including overpayment",money(plan.payment)):""}<p class="disclaimer">Simplified mortgage estimate. Real products can include fees, fixed-rate periods, variable rates and early-repayment rules.</p>`);});
      $("mortgageResetButton")?.addEventListener("click",()=>clear(["mortgagePrice","mortgageDeposit","mortgageRate","mortgageTerm","mortgageOverpayment"],"mortgageResult"));
    }

    if ($("salaryCalculateButton")) {
      $("salaryCalculateButton").addEventListener("click",()=>{const input=n("salaryAmount"),freq=$("salaryFrequency")?.value||"annual";if(input<=0)return show("salaryResult",'<h2 class="warning">Enter your gross pay</h2><p>Use a positive annual, monthly or weekly figure.</p>');const gross=input*(freq==="monthly"?12:freq==="weekly"?52:1);const r=takeHome(gross,{region:$("taxRegion")?.value,niCategory:$("niCategory")?.value||"A",pensionPercent:n("pensionPercent"),salarySacrifice:n("salarySacrifice"),studentPlan:$("studentPlan")?.value||"none",postgraduate:$("postgraduate")?.checked});show("salaryResult",`<div class="result-message"><span class="mini-label">Estimated monthly take-home</span><strong class="big-number">${money(r.monthly)}</strong></div>${stat("Gross annual pay",money(r.gross))}${stat("Income Tax",money(r.tax))}${stat("Employee National Insurance",money(r.ni))}${stat("Pension",money(r.pension))}${stat("Salary sacrifice",money(r.sacrifice))}${stat("Student loan",money(r.student))}${stat("Postgraduate loan",money(r.postgraduate))}${stat("Estimated annual take-home",money(r.net))}<p class="disclaimer">2026/27 estimate based on published UK Income Tax, National Insurance and student-loan rules. A real payslip can differ.</p>`);});
      $("salaryResetButton")?.addEventListener("click",()=>clear(["salaryAmount","pensionPercent","salarySacrifice"],"salaryResult"));
    }

    if ($("compoundCalculateButton")) {
      $("compoundCalculateButton").addEventListener("click",()=>{const initial=n("compoundInitial"),contribution=n("compoundContribution"),rate=n("compoundRate"),years=n("compoundYears"),freq=Number($("compoundContributionFrequency")?.value||12),comp=Number($("compoundCompounding")?.value||12);if(years<=0)return show("compoundResult",'<h2 class="warning">Enter a time period</h2><p>Choose a positive number of years.</p>');const value=futureValue(initial,contribution,rate,years,comp,freq),contributed=initial+contribution*years*freq;show("compoundResult",`<div class="result-message"><span class="mini-label">Estimated future value</span><strong class="big-number">${money(value)}</strong></div>${stat("Starting balance",money(initial))}${stat("Regular contribution",money(contribution))}${stat("Total contributions",money(contributed))}${stat("Annual rate",`${rate.toFixed(2)}%`)}${stat("Estimated growth",money(Math.max(0,value-contributed)))}${stat("Time",`${years} years`)}<p class="disclaimer">Illustrative compound-growth model. Returns are not guaranteed and fees/tax are not included.</p>`);});
      $("compoundResetButton")?.addEventListener("click",()=>clear(["compoundInitial","compoundContribution","compoundRate","compoundYears"],"compoundResult"));
    }

    if ($("sdltCalculateButton")) {
      $("sdltCalculateButton").addEventListener("click",()=>{const price=n("sdltPrice");if(price<=0)return show("sdltResult",'<h2 class="warning">Enter a property price</h2><p>We need the purchase price first.</p>');const first=$("sdltFirstTime")?.value==="yes",additional=$("sdltAdditional")?.value==="yes",replacing=$("sdltReplacing")?.value==="yes",nonResident=$("sdltNonResident")?.value==="yes";const duty=sdlt(price,{firstTime:first,additional,replacing,nonResident});show("sdltResult",`<div class="result-message"><span class="mini-label">Estimated Stamp Duty</span><strong class="big-number">${money(duty)}</strong></div>${stat("Property price",money(price))}${stat("Effective rate",`${(duty/price*100).toFixed(2)}%`)}${stat("First-time buyer relief",first&&price<=500000?"Applied":"Not applied")}${stat("Additional-property surcharge",additional&&!replacing?"Included":"Not included")}${stat("Non-UK-resident surcharge",nonResident?"Included":"Not included")}<p class="disclaimer">England and Northern Ireland residential estimate based on current published SDLT rates.</p>`);});
      $("sdltResetButton")?.addEventListener("click",()=>clear(["sdltPrice"],"sdltResult"));
    }

    if ($("loanCalculateButton")) {
      $("loanCalculateButton").addEventListener("click",()=>{const amount=n("loanAmount"),rate=n("loanRate"),years=n("loanTerm"),fee=n("loanFee"),extra=n("loanExtra");if(amount<=0||years<=0)return show("loanResult",'<h2 class="warning">Enter the loan amount and term</h2><p>Use positive values for the borrowing amount and duration.</p>');const plan=amortise(amount+fee,rate,years*12,extra);if(!plan)return show("loanResult",'<h2 class="bad">This loan plan does not amortise</h2><p>Check the APR and payment assumptions.</p>');const p50=amortise(amount+fee,rate,years*12,extra+50);show("loanResult",`<div class="result-message"><span class="mini-label">Estimated monthly payment</span><strong class="big-number">${money(plan.payment)}</strong></div>${stat("Loan amount",money(amount))}${stat("Fee added to borrowing",money(fee))}${stat("APR",`${rate.toFixed(2)}%`)}${stat("Total interest",money(plan.interest))}${stat("Total repaid",money(plan.total))}<div class="what-if-box"><strong>£50 extra each month</strong>${stat("Estimated payoff",p50?`${p50.periods} months`:"—")}${stat("Estimated interest",p50?money(p50.interest):"—")}</div><p class="disclaimer">Simplified amortisation estimate. Lender terms, fees and early repayment rules may differ.</p>`);});
      $("loanResetButton")?.addEventListener("click",()=>clear(["loanAmount","loanRate","loanTerm","loanFee","loanExtra"],"loanResult"));
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
    else render();
  }

  return { clamp, money, annuityPayment, amortise, debtPlan, futureValue, monthlyFutureValue, requiredMonthlySaving, mortgagePlan, sdlt, personalAllowance, incomeTax, employeeNI, loanRepayment, takeHome };
});
