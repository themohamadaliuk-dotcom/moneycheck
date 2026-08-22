const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("script.js", "utf8");

function makeElement(id) {
  return {
    id,
    value: "",
    innerHTML: "",
    classList: {
      add() {},
      remove() {}
    },
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    click() {
      if (this.listeners.click) this.listeners.click({ preventDefault() {} });
    },
    setCustomValidity() {},
    reportValidity() {},
    scrollIntoView() {},
    querySelectorAll() {
      return [];
    }
  };
}

function createPage() {
  const ids = [
    "calculateButton", "resetButton", "result",
    "income", "rent", "bills", "food", "transport", "subscriptions", "debt",
    "savings", "emergency", "purchase", "monthlyPayment",
    "savingsCalculateButton", "savingsResetButton", "savingsResult",
    "currentSavings", "savingsGoal", "monthlySaving",
    "debtCalculateButton", "debtResetButton", "debtResult",
    "debtBalance", "interestRate", "debtPayment"
  ];

  const elements = Object.fromEntries(ids.map((id) => [id, makeElement(id)]));
  const inputs = Object.values(elements).filter((element) => element.id && !element.id.toLowerCase().includes("button") && !element.id.toLowerCase().includes("result"));

  const calculatorPage = {
    querySelectorAll(selector) {
      return selector === "input" ? inputs : [];
    }
  };

  const document = {
    addEventListener(type, handler) {
      if (type === "DOMContentLoaded") handler();
    },
    getElementById(id) {
      return elements[id] || null;
    },
    querySelector(selector) {
      return selector === ".calculator-page" ? calculatorPage : null;
    }
  };

  const context = {
    document,
    window: {
      setTimeout(fn) { fn(); },
      scrollTo() {}
    },
    console
  };

  vm.runInNewContext(source, context, { filename: "script.js" });
  return elements;
}

// Exercise the actual production script rather than a copied implementation.
const page = createPage();

page.currentSavings.value = "2000";
page.savingsGoal.value = "10000";
page.monthlySaving.value = "500";
page.savingsCalculateButton.click();
assert.match(page.savingsResult.innerHTML, /16 months/);
assert.match(page.savingsResult.innerHTML, /20%/);
assert.match(page.savingsResult.innerHTML, /October|November|December|January|February|March|April|May|June|July|August|September/);

page.debtBalance.value = "5000";
page.interestRate.value = "20";
page.debtPayment.value = "200";
page.debtCalculateButton.click();
assert.match(page.debtResult.innerHTML, /Debt-free in approximately/);
assert.match(page.debtResult.innerHTML, /Estimated interest/);
assert.match(page.debtResult.innerHTML, /£/);

console.log("WorthChex production script smoke tests passed.");
