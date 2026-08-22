```javascript
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // =========================================================
  // SHARED HELPERS
  // =========================================================

  function getElement(id) {
    return document.getElementById(id);
  }

  function getNumber(id) {
    const element = getElement(id);
    if (!element) return 0;

    const value = Number(element.value);
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }

  function hasValue(id) {
    const element = getElement(id);
    return !!element && element.value.trim() !== "";
  }

  function showResult(element, html) {
    if (!element) return;

    element.innerHTML = html;
    element.classList.remove("hidden");

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function clearResult(element) {
    if (!element) return;

    element.innerHTML = "";
    element.classList.add("hidden");
  }

  function formatMoney(value) {
    return `£${Number(value || 0).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function monthsLabel(months) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  // =========================================================
  // AFFORDABILITY CALCULATOR
  // =========================================================

  const calculateButton = getElement("calculateButton");
  const resetButton = getElement("resetButton");
  const affordabilityResult = getElement("result");

  if (calculateButton) {
    calculateButton.addEventListener("click", function () {
      const income = getNumber("income");
      const rent = getNumber("rent");
      const bills = getNumber("bills");
      const food = getNumber("food");
      const transport = getNumber("transport");
      const subscriptions = getNumber("subscriptions");
      const debt = getNumber("debt");
      const savings = getNumber("savings");
      const emergency = getNumber("emergency");
      const purchase = getNumber("purchase");
      const monthlyPayment = getNumber("monthlyPayment");

      const hasRent = hasValue("rent");
      const hasBills = hasValue("bills");
      const hasFood = hasValue("food");
      const hasTransport = hasValue("transport");
      const hasSubscriptions = hasValue("subscriptions");
      const hasDebt = hasValue("debt");
      const hasSavings = hasValue("savings");
      const hasEmergency = hasValue("emergency");
      const hasFinance = hasValue("monthlyPayment") && monthlyPayment > 0;

      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (income <= 0) {
        showResult(
          affordabilityResult,
          `
            <h2 class="bad">Enter your income</h2>

            <p>
              Enter your monthly take-home income so we can work out
              what you can realistically afford.
            </p>
          `
        );

        return;
      }

      if (purchase <= 0) {
        showResult(
          affordabilityResult,
          `
            <h2 class="warning">Enter the purchase price</h2>

            <p>
              Tell us how much the item or purchase costs.
            </p>
          `
        );

        return;
      }

      // -------------------------------------------------------
      // MONTHLY EXPENSES
      //
      // Blank fields are NOT treated as expenses.
      // -------------------------------------------------------

      let totalMonthlyExpenses = 0;
      let expenseCount = 0;

      if (hasRent) {
        totalMonthlyExpenses += rent;
        expenseCount++;
      }

      if (hasBills) {
        totalMonthlyExpenses += bills;
        expenseCount++;
      }

      if (hasFood) {
        totalMonthlyExpenses += food;
        expenseCount++;
      }

      if (hasTransport) {
        totalMonthlyExpenses += transport;
        expenseCount++;
      }

      if (hasSubscriptions) {
        totalMonthlyExpenses += subscriptions;
        expenseCount++;
      }

      if (hasDebt) {
        totalMonthlyExpenses += debt;
        expenseCount++;
      }

      // -------------------------------------------------------
      // MAIN CALCULATIONS
      // -------------------------------------------------------

      const disposableIncome =
        income - totalMonthlyExpenses;

      const moneyAfterPurchase =
        disposableIncome - purchase;

      const expensePercentage =
        income > 0
          ? (totalMonthlyExpenses / income) * 100
          : 0;

      const housingPercentage =
        hasRent
          ? (rent / income) * 100
          : null;

      const purchasePercentage =
        disposableIncome > 0
          ? (purchase / disposableIncome) * 100
          : null;

      const moneyAfterFinance =
        disposableIncome - monthlyPayment;

      const financePercentage =
        disposableIncome > 0 && hasFinance
          ? (monthlyPayment / disposableIncome) * 100
          : null;

      // -------------------------------------------------------
      // SAVINGS / EMERGENCY FUND
      // -------------------------------------------------------

      let savingsAfterPurchase = null;
      let savingsInsufficient = false;
      let emergencyFundBroken = false;

      if (hasSavings) {
        savingsAfterPurchase =
          savings - purchase;

        savingsInsufficient =
          savingsAfterPurchase < 0;

        if (hasEmergency) {
          emergencyFundBroken =
            savingsAfterPurchase < emergency;
        }
      }

      // =======================================================
      // AFFORDABILITY DECISION
      //
      // Actual cash flow is the main factor.
      // Purchase size relative to disposable income is secondary.
      // =======================================================

      let statusClass = "good";
      let title = "";
      let advice = "";

      if (disposableIncome < 0) {
        statusClass = "bad";

        title =
          "I wouldn't buy it right now";

        advice = `
          <p>
            Based on the expenses you've entered, your regular
            monthly spending is already higher than your
            take-home income.
          </p>

          <p>
            I'd focus on bringing the monthly budget back into
            positive territory before taking on this purchase.
          </p>
        `;
      }

      else if (disposableIncome === 0) {
        statusClass = "bad";

        title =
          "I'd wait and plan for it";

        advice = `
          <p>
            The expenses you've entered currently use all of
            your monthly income.
          </p>

          <p>
            There isn't any spare money in the budget you've
            provided to comfortably absorb this purchase.
          </p>
        `;
      }

      else if (moneyAfterPurchase < 0) {
        statusClass = "bad";

        title =
          "I'd wait and save for it";

        advice = `
          <p>
            After the expenses you've entered, you have
            <strong>${formatMoney(disposableIncome)}</strong>
            available, but the purchase costs
            <strong>${formatMoney(purchase)}</strong>.
          </p>

          <p>
            Buying it outright would leave you approximately
            <strong>${formatMoney(Math.abs(moneyAfterPurchase))}</strong>
            short this month.
          </p>
        `;
      }

      else if (emergencyFundBroken) {
        statusClass = "warning";

        title =
          "I'd be cautious";

        advice = `
          <p>
            You can cover the purchase, but using your savings
            would take your emergency fund below the target
            you've entered.
          </p>

          <p>
            Unless the purchase is necessary, I'd consider
            waiting until that cash buffer is stronger.
          </p>
        `;
      }

      else if (purchasePercentage <= 10) {
        statusClass = "good";

        title =
          "Looks affordable";

        advice = `
          <p>
            This is a relatively small purchase compared with
            the money you have left after the expenses you've entered.
          </p>

          <p>
            You would have approximately
            <strong>${formatMoney(moneyAfterPurchase)}</strong>
            left afterwards.
          </p>
        `;
      }

      else if (purchasePercentage <= 25) {
        statusClass = "good";

        title =
          "Probably manageable";

        advice = `
          <p>
            You appear to have enough room in your budget for
            this purchase.
          </p>

          <p>
            It would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of your current disposable income, leaving approximately
            <strong>${formatMoney(moneyAfterPurchase)}</strong>.
          </p>
        `;
      }

      else if (purchasePercentage <= 50) {
        statusClass = "warning";

        title =
          "I'd think twice";

        advice = `
          <p>
            You can technically cover the purchase, but it would
            use a noticeable share of the money you have available.
          </p>

          <p>
            It would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of your disposable income and leave approximately
            <strong>${formatMoney(moneyAfterPurchase)}</strong>.
          </p>
        `;
      }

      else if (purchasePercentage <= 75) {
        statusClass = "warning";

        title =
          "I'd be cautious";

        advice = `
          <p>
            This is a large purchase relative to the money you
            have left after your regular expenses.
          </p>

          <p>
            It would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of your disposable income, leaving approximately
            <strong>${formatMoney(moneyAfterPurchase)}</strong>.
          </p>
        `;
      }

      else {
        statusClass = "bad";

        title =
          "This is a large purchase";

        advice = `
          <p>
            Although you can technically cover the purchase from
            the disposable income entered, it would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of that money.
          </p>

          <p>
            That leaves only
            <strong>${formatMoney(moneyAfterPurchase)}</strong>
            for the rest of the month, which gives you very little
            breathing room.
          </p>
        `;
      }

      // =======================================================
      // BUDGET ADVICE
      // =======================================================

      let budgetAdvice = "";

      if (expenseCount === 0) {
        budgetAdvice = `
          <p class="warning">
            ⚠️ You haven't entered any monthly expenses yet.

            This result is based only on your income and purchase
            price. Add your regular costs for a more useful result.
          </p>
        `;
      }

      else if (expensePercentage >= 90) {
        budgetAdvice = `
          <p class="warning">
            Your entered expenses use about
            <strong>${expensePercentage.toFixed(0)}%</strong>
            of your monthly income.

            That leaves relatively little room for unexpected costs.
          </p>
        `;
      }

      else if (expensePercentage >= 75) {
        budgetAdvice = `
          <p class="warning">
            Your entered expenses use about
            <strong>${expensePercentage.toFixed(0)}%</strong>
            of your monthly income.

            You have money left, but it would be sensible to keep
            some of it as a buffer.
          </p>
        `;
      }

      else {
        budgetAdvice = `
          <p class="good">
            ✓ Your entered expenses use about
            <strong>${expensePercentage.toFixed(0)}%</strong>
            of your monthly income.

            That leaves approximately
            <strong>${formatMoney(disposableIncome)}</strong>
            based on the figures provided.
          </p>
        `;
      }

      // =======================================================
      // HOUSING ADVICE
      // =======================================================

      let housingAdvice = "";

      if (!hasRent) {
        housingAdvice = `
          <p>
            Housing costs were not included because the
            rent/mortgage field was left blank.
          </p>
        `;
      }

      else if (housingPercentage > 50) {
        housingAdvice = `
          <p class="warning">
            Your rent/mortgage is about
            <strong>${housingPercentage.toFixed(0)}%</strong>
            of your take-home income.

            That's a significant housing cost.
          </p>
        `;
      }

      else if (housingPercentage > 35) {
        housingAdvice = `
          <p>
            Your rent/mortgage is about
            <strong>${housingPercentage.toFixed(0)}%</strong>
            of your take-home income.

            Keeping the rest of your budget flexible is particularly useful.
          </p>
        `;
      }

      else {
        housingAdvice = `
          <p>
            Your rent/mortgage is about
            <strong>${housingPercentage.toFixed(0)}%</strong>
            of your take-home income.
          </p>
        `;
      }

      // =======================================================
      // SAVINGS ADVICE
      // =======================================================

      let savingsAdvice = "";

      if (!hasSavings) {
        savingsAdvice = `
          <p>
            Savings were not included because the current savings
            field was left blank.

            For a larger purchase, consider whether you would still
            have a reasonable cash buffer afterwards.
          </p>
        `;
      }

      else if (savingsInsufficient) {
        savingsAdvice = `
          <p class="warning">
            Your current savings would not fully cover this purchase.

            That's not necessarily a problem if you're paying from
            monthly cash flow, but avoid emptying your savings just
            to make the purchase possible.
          </p>
        `;
      }

      else if (emergencyFundBroken) {
        savingsAdvice = `
          <p class="warning">
            You could pay for the purchase from savings, but doing
            so would take your savings below your emergency-fund target.
          </p>
        `;
      }

      else {
        savingsAdvice = `
          <p class="good">
            ✓ Your entered savings could cover the purchase without
            falling below your emergency-fund target.
          </p>
        `;
      }

      // =======================================================
      // FINANCE ADVICE
      // =======================================================

      let financeAdvice = "";

      if (hasFinance) {

        if (disposableIncome <= 0) {
          financeAdvice = `
            <p class="bad">
              ⚠️ Your current budget does not leave enough
              disposable income to comfortably absorb a new
              monthly finance payment.
            </p>
          `;
        }

        else if (moneyAfterFinance <= 0) {
          financeAdvice = `
            <p class="bad">
              ⚠️ The proposed finance payment would use essentially
              all of the money currently left in your monthly budget.
            </p>
          `;
        }

        else if (financePercentage > 20) {
          financeAdvice = `
            <p class="warning">
              ⚠️ The proposed finance payment would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of your current disposable income.

              That's a significant ongoing commitment.
            </p>
          `;
        }

        else if (financePercentage > 10) {
          financeAdvice = `
            <p class="warning">
              The proposed finance payment would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of your current disposable income.

              Make sure you can still handle unexpected costs.
            </p>
          `;
        }

        else {
          financeAdvice = `
            <p class="good">
              ✓ The proposed finance payment would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of your current disposable income.
            </p>
          `;
        }
      }

      // =======================================================
      // MISSING EXPENSE INFORMATION
      // =======================================================

      const missingExpenses = [];

      if (!hasRent) {
        missingExpenses.push("rent / mortgage");
      }

      if (!hasBills) {
        missingExpenses.push("bills & utilities");
      }

      if (!hasFood) {
        missingExpenses.push("food & groceries");
      }

      if (!hasTransport) {
        missingExpenses.push("transport");
      }

      if (!hasSubscriptions) {
        missingExpenses.push("subscriptions");
      }

      if (!hasDebt) {
        missingExpenses.push("debt payments");
      }

      let dataMessage = "";

      if (missingExpenses.length > 0) {
        dataMessage = `
          <div class="info-box">
            <strong>
              ℹ️ Based on the information you've entered
            </strong>

            <p>
              Blank expense fields are not assumed to be real-world
              zero spending. Only the expense categories you entered
              were used.
            </p>

            <p>
              Blank categories:
              <strong>${missingExpenses.join(", ")}</strong>
            </p>
          </div>
        `;
      }

      else {
        dataMessage = `
          <div class="info-box good-box">
            <strong>
              ✓ All main expense categories included
            </strong>

            <p>
              Your calculation includes rent, bills, food, transport,
              subscriptions and debt payments.
            </p>
          </div>
        `;
      }

      // =======================================================
      // RESULT
      // =======================================================

      showResult(
        affordabilityResult,
        `
          <h2 class="${statusClass}">
            ${title}
          </h2>

          ${advice}

          <div class="stat">
            <span>Monthly income</span>
            <strong>${formatMoney(income)}</strong>
          </div>

          <div class="stat">
            <span>Expenses entered</span>
            <strong>${expenseCount}</strong>
          </div>

          <div class="stat">
            <span>Total entered monthly expenses</span>
            <strong>${formatMoney(totalMonthlyExpenses)}</strong>
          </div>

          <div class="stat">
            <span>Money left after entered expenses</span>
            <strong>${formatMoney(disposableIncome)}</strong>
          </div>

          <div class="stat">
            <span>Purchase price</span>
            <strong>${formatMoney(purchase)}</strong>
          </div>

          <div class="stat">
            <span>Purchase vs available money</span>
            <strong>
              ${
                purchasePercentage === null
                  ? "—"
                  : `${purchasePercentage.toFixed(1)}%`
              }
            </strong>
          </div>

          <div class="stat">
            <span>Money left after purchase</span>
            <strong>${formatMoney(moneyAfterPurchase)}</strong>
          </div>

          ${
            hasSavings
              ? `
                <div class="stat">
                  <span>Savings after purchase</span>
                  <strong>${formatMoney(savingsAfterPurchase)}</strong>
                </div>
              `
              : ""
          }

          <h3>
            🧠 WorthChex's advice
          </h3>

          ${budgetAdvice}
          ${housingAdvice}
          ${savingsAdvice}
          ${financeAdvice}
          ${dataMessage}

          <p class="disclaimer">
            This calculator provides an estimate based on the information
            entered. Blank expense fields are not included in the calculation.
            Real affordability can also depend on irregular expenses,
            upcoming commitments, interest, taxes and individual circumstances.
          </p>
        `
      );
    });
  }

  // =========================================================
  // AFFORDABILITY RESET
  // =========================================================

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      const calculator = getElement("calculator");

      if (calculator) {
        calculator
          .querySelectorAll("input")
          .forEach(function (input) {
            input.value = "";
          });
      }

      clearResult(affordabilityResult);
    });
  }

  // =========================================================
  // SAVINGS GOAL CALCULATOR
  // =========================================================

  const savingsCalculateButton =
    getElement("savingsCalculateButton");

  const savingsResetButton =
    getElement("savingsResetButton");

  const savingsResult =
    getElement("savingsResult");

  if (savingsCalculateButton) {
    savingsCalculateButton.addEventListener("click", function () {

      const current =
        getNumber("currentSavings");

      const goal =
        getNumber("savingsGoal");

      const monthly =
        getNumber("monthlySaving");

      if (goal <= 0) {
        showResult(
          savingsResult,
          `
            <h2 class="warning">
              Enter a savings goal
            </h2>

            <p>
              Tell us how much you'd like to save.
            </p>
          `
        );

        return;
      }

      if (current >= goal) {
        showResult(
          savingsResult,
          `
            <div class="score-circle">
              <span>100</span>
              <small>%</small>
            </div>

            <h2 class="good">
              You've already reached your goal! 🎉
            </h2>

            <p>
              You currently have
              <strong>${formatMoney(current)}</strong>
              and your target is
              <strong>${formatMoney(goal)}</strong>.
            </p>

            <div class="stat">
              <span>Goal</span>
              <strong>${formatMoney(goal)}</strong>
            </div>

            <div class="stat">
              <span>Current savings</span>
              <strong>${formatMoney(current)}</strong>
            </div>

            <p class="good">
              ✓ You're there. Nice work.
            </p>
          `
        );

        return;
      }

      if (monthly <= 0) {
        const remaining =
          goal - current;

        showResult(
          savingsResult,
          `
            <h2 class="warning">
              Enter a monthly saving amount
            </h2>

            <p>
              You have
              <strong>${formatMoney(remaining)}</strong>
              left to reach your goal.
            </p>

            <p>
              Enter how much you can realistically save each month
              and we'll calculate how long it could take.
            </p>
          `
        );

        return;
      }

      const remaining =
        goal - current;

      const months =
        Math.ceil(
          remaining / monthly
        );

      const monthsPlus25 =
        Math.ceil(
          remaining / (monthly + 25)
        );

      const monthsPlus50 =
        Math.ceil(
          remaining / (monthly + 50)
        );

      const monthsSaved25 =
        Math.max(
          months - monthsPlus25,
          0
        );

      const monthsSaved50 =
        Math.max(
          months - monthsPlus50,
          0
        );

      const progress =
        Math.min(
          (current / goal) * 100,
          100
        );

      const targetDate =
        new Date();

      targetDate.setMonth(
        targetDate.getMonth() + months
      );

      const dateText =
        targetDate.toLocaleDateString(
          "en-GB",
          {
            month: "long",
            year: "numeric"
          }
        );

      let advice;

      if (months <= 3) {
        advice = `
          That's a relatively short-term goal.
          Staying consistent should put you on track to reach it soon.
        `;
      }

      else if (months <= 12) {
        advice = `
          This is a realistic medium-term goal.
          Consistency is the key. Consider setting the money aside
          automatically after payday.
        `;
      }

      else if (months <= 24) {
        advice = `
          This is a longer-term goal.

          An automatic transfer after payday can make saving easier
          because the money is moved before you're tempted to spend it.
        `;
      }

      else {
        advice = `
          This is a substantial goal.

          Breaking it into smaller milestones can make the target
          feel much more achievable.
        `;
      }

      showResult(
        savingsResult,
        `
          <div class="score-circle">
            <span>${progress.toFixed(0)}</span>
            <small>%</small>
          </div>

          <h2>
            You're ${progress.toFixed(0)}% there
          </h2>

          <p>
            At your current saving rate, you could reach your goal
            in approximately
            <strong>${monthsLabel(months)}</strong>.
          </p>

          <div class="progress-container">

            <div
              class="progress-bar"
              style="width: ${progress}%"
            ></div>

          </div>

          <div class="stat">
            <span>Current savings</span>
            <strong>${formatMoney(current)}</strong>
          </div>

          <div class="stat">
            <span>Savings goal</span>
            <strong>${formatMoney(goal)}</strong>
          </div>

          <div class="stat">
            <span>Still needed</span>
            <strong>${formatMoney(remaining)}</strong>
          </div>

          <div class="stat">
            <span>Monthly saving</span>
            <strong>${formatMoney(monthly)}</strong>
          </div>

          <div class="stat">
            <span>Estimated goal date</span>
            <strong>${dateText}</strong>
          </div>

          <h3>
            🧠 WorthChex's advice
          </h3>

          <p>
            ${advice}
          </p>

          <div class="info-box">

            <strong>
              💡 Keep going
            </strong>

            <p>
              You're already
              <strong>${progress.toFixed(0)}%</strong>
              of the way there.
            </p>

          </div>

          <div class="what-if-box">

            <h3>
              🚀 What if you saved more?
            </h3>

            <div class="what-if-grid">

              <div class="what-if-card">

                <span>
                  Save £25 more
                </span>

                <strong>
                  ${monthsLabel(monthsPlus25)}
                </strong>

                <small>
                  ${
                    monthsSaved25 > 0
                      ? `About ${monthsSaved25} month${monthsSaved25 === 1 ? "" : "s"} sooner`
                      : "No major time change"
                  }
                </small>

              </div>

              <div class="what-if-card featured">

                <span>
                  Save £50 more
                </span>

                <strong>
                  ${monthsLabel(monthsPlus50)}
                </strong>

                <small>
                  ${
                    monthsSaved50 > 0
                      ? `About ${monthsSaved50} month${monthsSaved50 === 1 ? "" : "s"} sooner`
                      : "No major time change"
                  }
                </small>

              </div>

            </div>

          </div>

          <p class="disclaimer">
            This calculator provides an estimate based on the information
            entered. It does not account for interest earned, withdrawals,
            changes in income, or changes in your monthly saving amount.
          </p>
        `
      );
    });
  }

  // =========================================================
  // SAVINGS RESET
  // =========================================================

  if (savingsResetButton) {
    savingsResetButton.addEventListener("click", function () {

      const section =
        getElement("savings-calculator");

      if (section) {
        section
          .querySelectorAll("input")
          .forEach(function (input) {
            input.value = "";
          });
      }

      clearResult(savingsResult);
    });
  }

  // =========================================================
  // DEBT PAYOFF CALCULATOR
  // =========================================================

  const debtCalculateButton =
    getElement("debtCalculateButton");

  const debtResetButton =
    getElement("debtResetButton");

  const debtResult =
    getElement("debtResult");

  function calculateDebtMonths(
    balance,
    annualRate,
    payment
  ) {

    if (balance <= 0 || payment <= 0) {
      return 0;
    }

    const monthlyRate =
      annualRate / 100 / 12;

    if (monthlyRate === 0) {
      return Math.ceil(
        balance / payment
      );
    }

    // The payment must exceed the interest
    // being added each month.
    if (
      payment <=
      balance * monthlyRate
    ) {
      return Infinity;
    }

    let remaining = balance;
    let months = 0;

    const maxMonths = 1200;

    while (
      remaining > 0.01 &&
      months < maxMonths
    ) {

      const interest =
        remaining * monthlyRate;

      const principal =
        payment - interest;

      if (principal <= 0) {
        return Infinity;
      }

      remaining -= principal;
      months++;
    }

    if (remaining > 0.01) {
      return Infinity;
    }

    return months;
  }

  if (debtCalculateButton) {
    debtCalculateButton.addEventListener(
      "click",
      function () {

        const balance =
          getNumber("debtBalance");

        const annualRate =
          getNumber("interestRate");

        const payment =
          getNumber("debtPayment");

        if (balance <= 0) {
          showResult(
            debtResult,
            `
              <h2 class="warning">
                Enter your current debt
              </h2>

              <p>
                Enter the amount you currently owe.
              </p>
            `
          );

          return;
        }

        if (payment <= 0) {
          showResult(
            debtResult,
            `
              <h2 class="warning">
                Enter a monthly payment
              </h2>

              <p>
                Enter how much you can pay toward the debt each month.
              </p>
            `
          );

          return;
        }

        const months =
          calculateDebtMonths(
            balance,
            annualRate,
            payment
          );

        if (!Number.isFinite(months)) {

          showResult(
            debtResult,
            `
              <h2 class="warning">
                This payment may not repay the debt
              </h2>

              <p>
                At the interest rate entered, the monthly payment
                is too small to make meaningful progress.

                Try increasing the payment and calculate again.
              </p>
            `
          );

          return;
        }

        let remaining =
          balance;

        let totalInterest =
          0;

        const monthlyRate =
          annualRate / 100 / 12;

        for (
          let month = 0;
          month < months && remaining > 0.01;
          month++
        ) {

          const interest =
            remaining * monthlyRate;

          let principal =
            payment - interest;

          if (principal <= 0) {
            break;
          }

          if (principal > remaining) {
            principal = remaining;
          }

          totalInterest +=
            interest;

          remaining -=
            principal;
        }

        const totalPaid =
          balance + totalInterest;

        const payoffDate =
          new Date();

        payoffDate.setMonth(
          payoffDate.getMonth() + months
        );

        const payoffDateText =
          payoffDate.toLocaleDateString(
            "en-GB",
            {
              month: "long",
              year: "numeric"
            }
          );

        const extra25 =
          calculateDebtMonths(
            balance,
            annualRate,
            payment + 25
          );

        const extra50 =
          calculateDebtMonths(
            balance,
            annualRate,
            payment + 50
          );

        const saved25 =
          Number.isFinite(extra25)
            ? Math.max(months - extra25, 0)
            : 0;

        const saved50 =
          Number.isFinite(extra50)
            ? Math.max(months - extra50, 0)
            : 0;

        let advice;

        if (months <= 12) {

          advice = `
            You're on a relatively short payoff timeline.
            Staying consistent with your payments should keep
            you moving toward being debt-free.
          `;

        }

        else if (months <= 36) {

          advice = `
            You're making progress, but this debt will take a
            while to clear.

            If your budget safely allows it, even a small increase
            in payment could shorten the timeline.
          `;

        }

        else {

          advice = `
            This is a long payoff timeline.

            Focus on keeping the payment consistent and look for
            opportunities to increase it when your budget allows.
          `;

        }

        showResult(
          debtResult,
          `
            <div class="score-circle">

              <span>
                ${months}
              </span>

              <small>
                months
              </small>

            </div>

            <h2>
              Debt-free in approximately
              ${monthsLabel(months)}
            </h2>

            <p>
              At your current payment of
              <strong>${formatMoney(payment)}</strong>
              per month, your estimated payoff date is
              <strong>${payoffDateText}</strong>.
            </p>

            <div class="stat">

              <span>
                Starting debt
              </span>

              <strong>
                ${formatMoney(balance)}
              </strong>

            </div>

            <div class="stat">

              <span>
                APR
              </span>

              <strong>
                ${annualRate.toFixed(2)}%
              </strong>

            </div>

            <div class="stat">

              <span>
                Monthly payment
              </span>

              <strong>
                ${formatMoney(payment)}
              </strong>

            </div>

            <div class="stat">

              <span>
                Estimated total interest
              </span>

              <strong>
                ${formatMoney(totalInterest)}
              </strong>

            </div>

            <div class="stat">

              <span>
                Estimated total paid
              </span>

              <strong>
                ${formatMoney(totalPaid)}
              </strong>

            </div>

            <h3>
              🚀 What if you paid more?
            </h3>

            <div class="what-if-box">

              <div class="what-if-grid">

                <div class="what-if-card">

                  <span>
                    Pay £25 more
                  </span>

                  <strong>
                    ${
                      Number.isFinite(extra25)
                        ? monthsLabel(extra25)
                        : "Very long"
                    }
                  </strong>

                  <small>
                    ${
                      saved25 > 0
                        ? `About ${saved25} month${saved25 === 1 ? "" : "s"} sooner`
                        : "No major time change"
                    }
                  </small>

                </div>

                <div class="what-if-card featured">

                  <span>
                    Pay £50 more
                  </span>

                  <strong>
                    ${
                      Number.isFinite(extra50)
                        ? monthsLabel(extra50)
                        : "Very long"
                    }
                  </strong>

                  <small>
                    ${
                      saved50 > 0
                        ? `About ${saved50} month${saved50 === 1 ? "" : "s"} sooner`
                        : "No major time change"
                    }
                  </small>

                </div>

              </div>

            </div>

            <h3>
              🧠 WorthChex's advice
            </h3>

            <p>
              ${advice}
            </p>

            <p class="disclaimer">
              This calculator provides an estimate based on the
              information entered. Actual lender calculations may differ.
            </p>
          `
        );
      }
    );
  }

  // =========================================================
  // DEBT RESET
  // =========================================================

  if (debtResetButton) {
    debtResetButton.addEventListener(
      "click",
      function () {

        const section =
          getElement("debt-calculator");

        if (section) {
          section
            .querySelectorAll("input")
            .forEach(function (input) {
              input.value = "";
            });
        }

        clearResult(debtResult);
      }
    );
  }

});
```
