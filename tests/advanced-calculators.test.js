const assert = require("node:assert/strict");

function annuity(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return { payment: principal / months, total: principal, interest: 0 };
  const payment = principal * r / (1 - Math.pow(1 + r, -months));
  return { payment, total: payment * months, interest: payment * months - principal };
}

function compound(initial, monthly, annualRate, months) {
  const r = annualRate / 100 / 12;
  const factor = r === 0 ? 1 : Math.pow(1 + r, months);
  return initial * factor + (r === 0 ? monthly * months : monthly * ((factor - 1) / r));
}

function sdlt(price, firstTime, additional) {
  const tax = (bands) => bands.reduce((sum, band, i) => {
    const next = bands[i + 1]?.from ?? Infinity;
    const taxable = Math.max(0, Math.min(price, next) - band.from);
    return sum + taxable * band.rate;
  }, 0);
  if (firstTime && price <= 500000) return tax([{from:0,rate:0},{from:300000,rate:0.05}]);
  const surcharge = additional ? 0.02 : 0;
  return tax([{from:0,rate:surcharge},{from:125000,rate:0.02+surcharge},{from:250000,rate:0.05+surcharge},{from:925000,rate:0.10+surcharge},{from:1500000,rate:0.12+surcharge}]);
}

assert.ok(annuity(300000, 4.5, 300).payment > 0);
assert.equal(annuity(100000, 0, 120).payment, 100000 / 120);
assert.ok(annuity(10000, 8.9, 60).total > 10000);
assert.ok(annuity(10000, 8.9, 60).interest > 0);

assert.equal(compound(1000, 0, 0, 12), 1000);
assert.equal(compound(0, 250, 0, 12), 3000);
assert.ok(compound(2000, 250, 4.5, 120) > 2000 + 250 * 120);

// England/Northern Ireland standard residential SDLT: £5,000 at £300,000.
assert.equal(sdlt(300000, false, false), 5000);
assert.equal(sdlt(500000, true, false), 10000);
assert.ok(sdlt(500000, false, true) > sdlt(500000, false, false));

function takeHomeRU(salary) {
  const allowance = Math.max(0, 12570 - Math.max(0, (salary - 100000) / 2));
  const taxable = Math.max(0, salary - allowance);
  const tax = Math.max(0, Math.min(taxable,37700))*0.20 + Math.max(0, Math.min(taxable,125140)-37700)*0.40 + Math.max(0, taxable-125140)*0.45;
  const ni = Math.max(0, Math.min(salary, 50270) - 12570) * 0.08 + Math.max(0, salary - 50270) * 0.02;
  return salary - tax - ni;
}

assert.ok(takeHomeRU(40000) > 30000);
assert.ok(takeHomeRU(60000) > takeHomeRU(40000));
assert.ok(takeHomeRU(120000) < 120000);

console.log("WorthChex advanced calculator tests passed.");
