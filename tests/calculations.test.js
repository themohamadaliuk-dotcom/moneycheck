const assert = require("node:assert/strict");

function savingsMonths(current, goal, monthly) {
  if (goal <= current) return 0;
  if (monthly <= 0) return null;
  return Math.ceil((goal - current) / monthly);
}

function savingsProgress(current, goal) {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

function calculateDebtPlan(balance, annualRate, payment) {
  if (balance <= 0 || payment <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return {
      months: Math.ceil(balance / payment),
      totalInterest: 0,
      totalPaid: balance
    };
  }

  if (payment <= balance * monthlyRate) return null;

  let remaining = balance;
  let totalInterest = 0;
  let months = 0;

  while (remaining > 0.005 && months < 1200) {
    const interest = remaining * monthlyRate;
    const actualPayment = Math.min(payment, remaining + interest);
    const principal = actualPayment - interest;

    if (principal <= 0) return null;

    totalInterest += interest;
    remaining -= principal;
    months += 1;
  }

  if (remaining > 0.005 || months >= 1200) return null;

  return {
    months,
    totalInterest,
    totalPaid: balance + totalInterest
  };
}

// Savings: already reached.
assert.equal(savingsMonths(10_000, 10_000, 250), 0);
assert.equal(savingsProgress(10_000, 10_000), 100);

// Savings: £2,000 toward £10,000 at £500/month = 16 months.
assert.equal(savingsMonths(2_000, 10_000, 500), 16);
assert.equal(savingsProgress(2_000, 10_000), 20);

// Savings: zero contribution cannot produce a payoff date.
assert.equal(savingsMonths(2_000, 10_000, 0), null);

// Debt: zero APR is simple division.
assert.deepEqual(calculateDebtPlan(1_000, 0, 250), {
  months: 4,
  totalInterest: 0,
  totalPaid: 1_000
});

// Debt: a payment at or below first-month interest cannot reduce the balance.
assert.equal(calculateDebtPlan(5_000, 20, 83.3333333333), null);

// Debt: normal repayment should finish and accrue positive interest.
const plan = calculateDebtPlan(5_000, 20, 200);
assert.ok(plan);
assert.ok(plan.months > 0);
assert.ok(plan.months < 1200);
assert.ok(plan.totalInterest > 0);
assert.ok(plan.totalPaid > 5_000);

// Paying more should never increase the payoff time or interest.
const faster = calculateDebtPlan(5_000, 20, 250);
assert.ok(faster);
assert.ok(faster.months <= plan.months);
assert.ok(faster.totalInterest <= plan.totalInterest);

console.log("WorthChex calculator regression tests passed.");
