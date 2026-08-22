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

    if (!element) {
      return 0;
    }

    const value = Number(element.value);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }

  function hasValue(id) {
    const element = getElement(id);

    return !!element && element.value.trim() !== "";
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

  function showResult(element, html) {
    if (!element) {
      return;
    }

    element.innerHTML = html;

    element.classList.remove("hidden");

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function clearResult(element) {
    if (!element) {
      return;
    }

    element.innerHTML = "";
    element.classList.add("hidden");
  }

  function clearInputs(section) {
    if (!section) {
      return;
    }

    section
      .querySelectorAll("input")
      .forEach(function (input) {
        input.value = "";
      });
  }

  // =========================================================
  // AFFORDABILITY CALCULATOR
  // =========================================================

  const calculateButton =
    getElement("calculateButton");

  const resetButton =
    getElement("resetButton");

  const affordabilityResult =
    getElement("result");

  if (calculateButton) {
    calculateButton.addEventListener("click", function () {

      // -------------------------------------------------------
      // REQUIRED INFORMATION
      // -------------------------------------------------------

      const income =
        getNumber("income");

      const purchase =
        getNumber("purchase");

      // -------------------------------------------------------
      // OPTIONAL INFORMATION
      //
      // IMPORTANT:
      // Blank fields are NOT treated as £0.
      // Blank fields are excluded completely.
      // -------------------------------------------------------

      const rent =
        getNumber("rent");

      const bills =
        getNumber("bills");

      const food =
        getNumber("food");

      const transport =
        getNumber("transport");

      const subscriptions =
        getNumber("subscriptions");

      const debt =
        getNumber("debt");

      const savings =
        getNumber("savings");

      const emergency =
        getNumber("emergency");

      const monthlyPayment =
        getNumber("monthlyPayment");

      const hasRent =
        hasValue("rent");

      const hasBills =
        hasValue("bills");

      const hasFood =
        hasValue("food");

      const hasTransport =
        hasValue("transport");

      const hasSubscriptions =
        hasValue("subscriptions");

      const hasDebt =
        hasValue("debt");

      const hasSavings =
        hasValue("savings");

      const hasEmergency =
        hasValue("emergency");

      const hasFinance =
        hasValue("monthlyPayment") &&
        monthlyPayment > 0;

      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (income <= 0) {
        showResult(
          affordabilityResult,
          `
            <h2 class="bad">
              Enter your income
            </h2>

            <p>
              Enter your monthly take-home income so we can
              work out what you can realistically afford.
            </p>
          `
        );

        return;
      }

      if (purchase <= 0) {
        showResult(
          affordabilityResult,
          `
            <h2 class="warning">
              Enter the purchase price
            </h2>

            <p>
              Tell us how much the item you want to buy costs.
            </p>
          `
        );

        return;
      }

      // -------------------------------------------------------
      // COUNT ONLY EXPENSES ACTUALLY ENTERED
      // -------------------------------------------------------

      let totalMonthlyExpenses = 0;
      let expenseCount = 0;

      if (hasRent) {
        totalMonthlyExpenses += rent;
        expenseCount += 1;
      }

      if (hasBills) {
        totalMonthlyExpenses += bills;
        expenseCount += 1;
      }

      if (hasFood) {
        totalMonthlyExpenses += food;
        expenseCount += 1;
      }

      if (hasTransport) {
        totalMonthlyExpenses += transport;
        expenseCount += 1;
      }

      if (hasSubscriptions) {
        totalMonthlyExpenses += subscriptions;
        expenseCount += 1;
      }

      if (hasDebt) {
        totalMonthlyExpenses += debt;
        expenseCount += 1;
      }

      // -------------------------------------------------------
      // MONTHLY CASH FLOW
      // -------------------------------------------------------

      const disposableIncome =
        income - totalMonthlyExpenses;

      const expensePercentage =
        income > 0
          ? (totalMonthlyExpenses / income) * 100
          : 0;

      const remainingIncomePercentage =
        income > 0
          ? (disposableIncome / income) * 100
          : 0;

      const housingPercentage =
        hasRent
          ? (rent / income) * 100
          : null;

      // -------------------------------------------------------
      // PURCHASE TYPE
      //
      // CASH:
      //   Purchase price affects this month's cash flow.
      //
      // FINANCE:
      //   Only the monthly finance payment affects this month's
      //   cash flow. The full purchase price is NOT removed from
      //   this month's budget.
      // -------------------------------------------------------

      const purchaseIsFinanced =
        hasFinance;

      const monthlyPurchaseCost =
        purchaseIsFinanced
          ? monthlyPayment
          : purchase;

      const moneyAfterPurchase =
        disposableIncome - monthlyPurchaseCost;

      const purchaseImpactPercentage =
        disposableIncome > 0
          ? (monthlyPurchaseCost / disposableIncome) * 100
          : null;

      const financePercentage =
        disposableIncome > 0 && hasFinance
          ? (monthlyPayment / disposableIncome) * 100
          : null;

      // -------------------------------------------------------
      // SAVINGS SCENARIO
      //
      // Savings are NOT assumed to be used.
      // This simply shows what would happen if the user chose
      // to pay the purchase from savings.
      // -------------------------------------------------------

      let savingsAfterPurchase = null;
      let savingsWouldCoverPurchase = null;
      let savingsBelowEmergency = false;

      if (hasSavings) {
        savingsAfterPurchase =
          savings - purchase;

        savingsWouldCoverPurchase =
          savingsAfterPurchase >= 0;

        if (hasEmergency) {
          savingsBelowEmergency =
            savingsAfterPurchase < emergency;
        }
      }

      // -------------------------------------------------------
      // INFORMATION COMPLETENESS
      //
      // Blank fields don't affect the calculation.
      // They only affect how cautious the wording should be.
      // -------------------------------------------------------

      const optionalExpenseCategories = [
        hasRent,
        hasBills,
        hasFood,
        hasTransport,
        hasSubscriptions,
        hasDebt
      ];

      const enteredExpenseCategories =
        optionalExpenseCategories.filter(Boolean).length;

      const hasVeryLimitedExpenseInformation =
        enteredExpenseCategories <= 1;

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

      // -------------------------------------------------------
      // MAIN DECISION
      // -------------------------------------------------------

      let score = 100;
      let title = "";
      let colour = "good";
      let advice = "";

      // =======================================================
      // NEGATIVE CASH FLOW
      // =======================================================

      if (disposableIncome < 0) {

        score = 5;
        colour = "bad";

        title =
          "I wouldn't buy it right now";

        advice = `
          <p>
            The expenses you've entered are currently higher
            than your monthly take-home income.
          </p>

          <p>
            I'd avoid adding this purchase until your monthly
            budget is back into positive territory.
          </p>
        `;

      }

      // =======================================================
      // NO MONEY LEFT
      // =======================================================

      else if (disposableIncome === 0) {

        score = 10;
        colour = "bad";

        title =
          "I'd wait and plan for it";

        advice = `
          <p>
            The expenses you've entered use all of the income
            you've provided.
          </p>

          <p>
            That means there is no monthly breathing room for
            this purchase or an unexpected cost.
          </p>
        `;

      }

      // =======================================================
      // FINANCED PURCHASE DOES NOT FIT
      // =======================================================

      else if (
        purchaseIsFinanced &&
        moneyAfterPurchase < 0
      ) {

        score = 20;
        colour = "bad";

        title =
          "The finance payment doesn't fit comfortably";

        advice = `
          <p>
            You have approximately
            <strong>${formatMoney(disposableIncome)}</strong>
            left after the expenses you've entered, but the
            proposed finance payment is
            <strong>${formatMoney(monthlyPayment)}</strong>
            per month.
          </p>

          <p>
            That would leave your monthly budget at approximately
            <strong>${formatMoney(moneyAfterPurchase)}</strong>.
          </p>
        `;

      }

      // =======================================================
      // CASH PURCHASE DOES NOT FIT
      // =======================================================

      else if (
        !purchaseIsFinanced &&
        moneyAfterPurchase < 0
      ) {

        score = 20;
        colour = "bad";

        title =
          "I'd wait and save for it";

        advice = `
          <p>
            You have approximately
            <strong>${formatMoney(disposableIncome)}</strong>
            left after the expenses you've entered, but the
            purchase costs
            <strong>${formatMoney(purchase)}</strong>.
          </p>

          <p>
            Buying it outright would leave your monthly budget
            approximately
            <strong>${formatMoney(Math.abs(moneyAfterPurchase))}</strong>
            short.
          </p>
        `;

      }

      // =======================================================
      // FINANCED PURCHASE
      // =======================================================

      else if (purchaseIsFinanced) {

        if (financePercentage <= 10) {

          score = 92;
          colour = "good";

          title =
            hasVeryLimitedExpenseInformation
              ? "It may be affordable"
              : "The finance looks manageable";

          advice = `
            <p>
              The proposed payment is
              <strong>${formatMoney(monthlyPayment)}</strong>
              per month.
            </p>

            <p>
              Based on the expenses you've entered, it would use
              about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of your disposable monthly income and leave approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>.
            </p>
          `;

        }

        else if (financePercentage <= 20) {

          score = 78;
          colour = "good";

          title =
            hasVeryLimitedExpenseInformation
              ? "It may be manageable"
              : "Probably manageable";

          advice = `
            <p>
              The proposed finance payment would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of the money left after your entered expenses.
            </p>

            <p>
              You would have approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>
              remaining each month before any other costs you
              haven't entered.
            </p>
          `;

        }

        else if (financePercentage <= 30) {

          score = 62;
          colour = "warning";

          title =
            "I'd think twice";

          advice = `
            <p>
              The proposed finance payment is a noticeable
              commitment relative to your available monthly income.
            </p>

            <p>
              It would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of your disposable income and leave approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>.
            </p>
          `;

        }

        else {

          score = 40;
          colour = "bad";

          title =
            "I'd be cautious with this finance";

          advice = `
            <p>
              The proposed finance payment would use about
              <strong>${financePercentage.toFixed(0)}%</strong>
              of the money left after your entered expenses.
            </p>

            <p>
              That would leave only
              <strong>${formatMoney(moneyAfterPurchase)}</strong>
              each month before other costs or surprises.
            </p>
          `;
        }

      }

      // =======================================================
      // CASH PURCHASE
      // =======================================================

      else {

        if (purchaseImpactPercentage <= 10) {

          score = 95;
          colour = "good";

          title =
            hasVeryLimitedExpenseInformation
              ? "It may be affordable"
              : "Looks affordable";

          advice = `
            <p>
              The purchase is relatively small compared with
              the money you have left after the expenses you've entered.
            </p>

            <p>
              You would have approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>
              left afterwards.
            </p>
          `;

        }

        else if (purchaseImpactPercentage <= 25) {

          score = 82;
          colour = "good";

          title =
            hasVeryLimitedExpenseInformation
              ? "It may be manageable"
              : "Probably manageable";

          advice = `
            <p>
              The purchase would use about
              <strong>${purchaseImpactPercentage.toFixed(0)}%</strong>
              of your disposable monthly income.
            </p>

            <p>
              You would have approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>
              left afterwards.
            </p>
          `;

        }

        else if (purchaseImpactPercentage <= 50) {

          score = 65;
          colour = "warning";

          title =
            "I'd think twice";

          advice = `
            <p>
              You can cover the purchase from the budget you've
              provided, but it would use a noticeable share of
              your available money.
            </p>

            <p>
              It would use about
              <strong>${purchaseImpactPercentage.toFixed(0)}%</strong>
              of your disposable income and leave approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>.
            </p>
          `;

        }

        else if (purchaseImpactPercentage <= 75) {

          score = 48;
          colour = "warning";

          title =
            "I'd be cautious";

          advice = `
            <p>
              This is a large purchase compared with the money
              you've told us you have left each month.
            </p>

            <p>
              It would use about
              <strong>${purchaseImpactPercentage.toFixed(0)}%</strong>
              of your disposable income.
            </p>
          `;

        }

        else {

          score = 30;
          colour = "bad";

          title =
            "This would leave very little breathing room";

          advice = `
            <p>
              You can technically cover the purchase from the
              figures you've entered, but it would use about
              <strong>${purchaseImpactPercentage.toFixed(0)}%</strong>
              of your disposable income.
            </p>

            <p>
              That would leave approximately
              <strong>${formatMoney(moneyAfterPurchase)}</strong>
              afterwards.
            </p>
          `;
        }
      }

      // =======================================================
      // TIGHT MONTHLY CASH FLOW
      // =======================================================

      if (disposableIncome > 0) {

        if (remainingIncomePercentage < 5) {
          score -= 20;
        }

        else if (remainingIncomePercentage < 10) {
          score -= 12;
        }

        else if (remainingIncomePercentage < 15) {
          score -= 7;
        }

        else if (remainingIncomePercentage < 20) {
          score -= 3;
        }
      }

      // =======================================================
      // FINANCE PAYMENT IMPACT
      // =======================================================

      if (
        purchaseIsFinanced &&
        disposableIncome > 0
      ) {

        if (moneyAfterPurchase <= 0) {
          score -= 20;
        }

        else if (financePercentage > 30) {
          score -= 12;
        }

        else if (financePercentage > 20) {
          score -= 8;
        }

        else if (financePercentage > 10) {
          score -= 3;
        }
      }

      // =======================================================
      // SAVINGS SUPPORT
      // =======================================================

      if (
        hasSavings &&
        savings > 0
      ) {

        const purchaseToSavings =
          (purchase / savings) * 100;

        if (purchaseToSavings > 100) {
          score -= 5;
        }

        else if (purchaseToSavings > 75) {
          score -= 4;
        }

        else if (purchaseToSavings > 50) {
          score -= 2;
        }
      }

      // =======================================================
      // FINAL SCORE
      // =======================================================

      score =
        Math.max(
          5,
          Math.min(
            100,
            Math.round(score)
          )
        );

      // =======================================================
      // BUDGET ADVICE
      // =======================================================

      let budgetAdvice = "";

      if (expenseCount === 0) {

        budgetAdvice = `
          <div class="info-box">

            <strong>
              ℹ️ Limited budget information
            </strong>

            <p>
              You haven't entered any monthly expense categories.
              That's completely okay if those costs don't apply
              to you, but this result is based only on your income
              and the purchase information you supplied.
            </p>

          </div>
        `;

      }

      else if (hasVeryLimitedExpenseInformation) {

        budgetAdvice = `
          <div class="info-box">

            <strong>
              ℹ️ Based on a small amount of expense information
            </strong>

            <p>
              Only the expense categories you filled in were counted.
              The blank categories were not treated as £0.
            </p>

          </div>
        `;

      }

      else if (expensePercentage >= 90) {

        budgetAdvice = `
          <p class="warning">

            Your entered expenses use about
            <strong>${expensePercentage.toFixed(0)}%</strong>
            of your monthly income.

            That leaves relatively little room based on the costs
            you've provided.

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
            based only on the expenses you supplied.

          </p>
        `;

      }

      // =======================================================
      // HOUSING ADVICE
      // =======================================================

      let housingAdvice = "";

      if (hasRent) {

        if (housingPercentage > 50) {

          housingAdvice = `
            <p class="warning">

              Your entered rent / mortgage is about
              <strong>${housingPercentage.toFixed(0)}%</strong>
              of your take-home income.

              That's a significant housing cost.

            </p>
          `;

        }

        else if (housingPercentage > 35) {

          housingAdvice = `
            <p>

              Your entered rent / mortgage is about
              <strong>${housingPercentage.toFixed(0)}%</strong>
              of your take-home income.

            </p>
          `;

        }

      }

      // =======================================================
      // SAVINGS INFORMATION
      // =======================================================

      let savingsAdvice = "";

      if (hasSavings) {

        if (!savingsWouldCoverPurchase) {

          savingsAdvice = `
            <p class="warning">

              If you chose to pay for the purchase from savings,
              your current savings would not fully cover it.

              That's separate from your monthly affordability result.

            </p>
          `;

        }

        else if (
          hasEmergency &&
          savingsBelowEmergency
        ) {

          savingsAdvice = `
            <p class="warning">

              If you paid for the purchase from savings, your
              remaining savings would fall below your emergency
              fund target.

              This is a savings warning, not an assumption that
              you are actually using your savings.

            </p>
          `;

        }

        else {

          savingsAdvice = `
            <p>

              If you paid for the purchase from savings, you would
              have approximately
              <strong>${formatMoney(savingsAfterPurchase)}</strong>
              remaining.

            </p>
          `;

        }

      }

      // =======================================================
      // FINANCE INFORMATION
      // =======================================================

      let financeAdvice = "";

      if (hasFinance) {

        financeAdvice = `
          <p>

            This result treats the purchase as financed and uses
            the <strong>${formatMoney(monthlyPayment)}</strong>
            monthly payment when assessing your monthly budget.

            The full purchase price is not subtracted from this
            month's cash flow.

          </p>
        `;
      }

      // =======================================================
      // MISSING / BLANK CATEGORIES
      // =======================================================

      let dataMessage = "";

      if (missingExpenses.length > 0) {

        dataMessage = `
          <div class="info-box">

            <strong>
              ℹ️ Only the categories you entered were counted
            </strong>

            <p>
              Blank fields were not treated as £0 and had no
              effect on your result.
            </p>

            <p>
              Still blank:
              <strong>
                ${missingExpenses.join(", ")}
              </strong>
            </p>

            <p>
              Add any of these only if they apply to you or you
              want them included in the calculation.
            </p>

          </div>
        `;

      }

      else {

        dataMessage = `
          <div class="info-box good-box">

            <strong>
              ✓ All listed expense categories were entered
            </strong>

            <p>
              The result uses all six monthly expense categories
              shown in the calculator.
            </p>

          </div>
        `;

      }

      // =======================================================
      // PURCHASE SUMMARY
      // =======================================================

      const purchaseSummary =
        purchaseIsFinanced
          ? `
            <div class="stat">
              <span>Purchase price</span>
              <strong>${formatMoney(purchase)}</strong>
            </div>

            <div class="stat">
              <span>Monthly finance payment</span>
              <strong>${formatMoney(monthlyPayment)}</strong>
            </div>

            <div class="stat">
              <span>Monthly payment vs available money</span>
              <strong>
                ${
                  purchaseImpactPercentage === null
                    ? "—"
                    : `${purchaseImpactPercentage.toFixed(1)}%`
                }
              </strong>
            </div>
          `
          : `
            <div class="stat">
              <span>Purchase price</span>
              <strong>${formatMoney(purchase)}</strong>
            </div>

            <div class="stat">
              <span>Purchase vs available money</span>
              <strong>
                ${
                  purchaseImpactPercentage === null
                    ? "—"
                    : `${purchaseImpactPercentage.toFixed(1)}%`
                }
              </strong>
            </div>
          `;

      // =======================================================
      // DISPLAY RESULT
      // =======================================================

      showResult(
        affordabilityResult,
        `
          <div class="score-circle">

            <span>
              ${score}
            </span>

            <small>
              /100
            </small>

          </div>

          <h2 class="${colour}">
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

          ${purchaseSummary}

          <div class="stat">
            <span>Money left after purchase / payment</span>
            <strong>${formatMoney(moneyAfterPurchase)}</strong>
          </div>

          <h3>
            🧠 WorthChex's advice
          </h3>

          ${budgetAdvice}
          ${housingAdvice}
          ${savingsAdvice}
          ${financeAdvice}
          ${dataMessage}

          <p class="disclaimer">
            This calculator provides an estimate based only on the
            information you entered. Blank fields are excluded and
            are not treated as £0. Real affordability can also depend
            on irregular costs, upcoming commitments, taxes, interest,
            fees and your individual circumstances.
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

      clearInputs(
        getElement("calculator")
      );

      clearResult(
        affordabilityResult
      );

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

    savingsCalculateButton.addEventListener(
      "click",
      function () {

        const current =
          getNumber("currentSavings");

        const goal =
          getNumber("savingsGoal");

        const monthly =
          getNumber("monthlySaving");

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

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

                <span>
                  100
                </span>

                <small>
                  %
                </small>

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
                Enter how much you can realistically save each
                month and we'll calculate how long it could take.
              </p>
            `
          );

          return;
        }

        // -----------------------------------------------------
        // CALCULATIONS
        // -----------------------------------------------------

        const remaining =
          goal - current;

        const months =
          Math.ceil(
            remaining / monthly
          );

        // -----------------------------------------------------
        // WHAT IF
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // TARGET DATE
        // -----------------------------------------------------

        const targetDate =
          new Date();

        targetDate.setHours(
          12,
          0,
          0,
          0
        );

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

        // -----------------------------------------------------
        // ADVICE
        // -----------------------------------------------------

        let advice = "";

        if (months <= 3) {

          advice = `
            That's a relatively short-term goal.
            Staying consistent should put you on track to reach it soon.
          `;

        }

        else if (months <= 12) {

          advice = `
            This is a realistic medium-term goal.
            Consider setting the money aside automatically after payday.
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

        // -----------------------------------------------------
        // RESULT
        // -----------------------------------------------------

        showResult(
          savingsResult,
          `
            <div class="score-circle">

              <span>
                ${progress.toFixed(0)}
              </span>

              <small>
                %
              </small>

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

              <p class="what-if-intro">
                Small changes can make a surprisingly big difference.
              </p>

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
                        ? `That's ${monthsSaved25} month${monthsSaved25 === 1 ? "" : "s"} sooner`
                        : "No change in estimated time"
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
                        ? `That's ${monthsSaved50} month${monthsSaved50 === 1 ? "" : "s"} sooner`
                        : "No change in estimated time"
                    }
                  </small>

                </div>

              </div>

            </div>

            <p class="disclaimer">
              This estimate assumes you continue saving the same amount
              each month. It does not include interest earned, withdrawals,
              missed contributions, or changes to your saving amount.
            </p>
          `
        );
      }
    );
  }

  // =========================================================
  // SAVINGS RESET
  // =========================================================

  if (savingsResetButton) {

    savingsResetButton.addEventListener(
      "click",
      function () {

        clearInputs(
          getElement("savings-calculator")
        );

        clearResult(
          savingsResult
        );

      }
    );
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

  // ---------------------------------------------------------
  // DEBT CALCULATION HELPER
  // ---------------------------------------------------------

  function calculateDebtPlan(
    balance,
    annualRate,
    payment
  ) {

    if (
      balance <= 0 ||
      payment <= 0
    ) {
      return null;
    }

    const monthlyRate =
      annualRate / 100 / 12;

    // -------------------------------------------------------
    // ZERO INTEREST
    // -------------------------------------------------------

    if (monthlyRate === 0) {

      const months =
        Math.ceil(
          balance / payment
        );

      return {
        months,
        totalInterest: 0,
        totalPaid: balance
      };
    }

    // -------------------------------------------------------
    // PAYMENT MUST EXCEED MONTHLY INTEREST
    // -------------------------------------------------------

    const firstMonthInterest =
      balance * monthlyRate;

    if (
      payment <= firstMonthInterest
    ) {
      return null;
    }

    let remaining =
      balance;

    let totalInterest =
      0;

    let months =
      0;

    const maxMonths =
      1200;

    // -------------------------------------------------------
    // MONTH-BY-MONTH CALCULATION
    // -------------------------------------------------------

    while (
      remaining > 0.005 &&
      months < maxMonths
    ) {

      const interest =
        remaining * monthlyRate;

      const maximumPayment =
        remaining + interest;

      const actualPayment =
        Math.min(
          payment,
          maximumPayment
        );

      const principal =
        actualPayment - interest;

      if (principal <= 0) {
        return null;
      }

      totalInterest +=
        interest;

      remaining -=
        principal;

      months += 1;
    }

    // -------------------------------------------------------
    // SAFETY CHECK
    // -------------------------------------------------------

    if (
      remaining > 0.005 ||
      months >= maxMonths
    ) {
      return null;
    }

    return {
      months,
      totalInterest,
      totalPaid:
        balance + totalInterest
    };
  }

  // ---------------------------------------------------------
  // DEBT CALCULATOR
  // ---------------------------------------------------------

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

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

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
                Enter your monthly payment
              </h2>

              <p>
                Enter how much you can pay toward
                the debt each month.
              </p>
            `
          );

          return;
        }

        // -----------------------------------------------------
        // CALCULATE BASE PLAN
        // -----------------------------------------------------

        const plan =
          calculateDebtPlan(
            balance,
            annualRate,
            payment
          );

        if (!plan) {

          const monthlyRate =
            annualRate / 100 / 12;

          const firstMonthInterest =
            balance * monthlyRate;

          showResult(
            debtResult,
            `
              <h2 class="bad">
                This payment may not repay the debt
              </h2>

              <p>
                At an APR of
                <strong>${annualRate.toFixed(2)}%</strong>,
                the first month's interest is approximately
                <strong>${formatMoney(firstMonthInterest)}</strong>.
              </p>

              <div class="info-box">

                <strong>
                  ⚠️ Important
                </strong>

                <p>
                  Your monthly payment needs to be greater than
                  the interest being added each month if you want
                  the balance to decrease.
                </p>

              </div>
            `
          );

          return;
        }

        const months =
          plan.months;

        const totalInterest =
          plan.totalInterest;

        const totalPaid =
          plan.totalPaid;

        // -----------------------------------------------------
        // PAYOFF DATE
        // -----------------------------------------------------

        const payoffDate =
          new Date();

        payoffDate.setHours(
          12,
          0,
          0,
          0
        );

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

        // -----------------------------------------------------
        // WHAT IF PAYING MORE?
        // -----------------------------------------------------

        const planPlus25 =
          calculateDebtPlan(
            balance,
            annualRate,
            payment + 25
          );

        const planPlus50 =
          calculateDebtPlan(
            balance,
            annualRate,
            payment + 50
          );

        const saved25 =
          planPlus25
            ? Math.max(
                months - planPlus25.months,
                0
              )
            : 0;

        const saved50 =
          planPlus50
            ? Math.max(
                months - planPlus50.months,
                0
              )
            : 0;

        // -----------------------------------------------------
        // ADVICE
        // -----------------------------------------------------

        let advice = "";

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
            while to clear. If your budget safely allows it, a
            modest increase in payment could shorten the timeline.
          `;

        }

        else {

          advice = `
            This is a long payoff timeline. Focus on keeping the
            payment consistent and look for opportunities to increase
            it when your budget allows.
          `;

        }

        // -----------------------------------------------------
        // RESULT
        // -----------------------------------------------------

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
              <span>Starting debt</span>
              <strong>${formatMoney(balance)}</strong>
            </div>

            <div class="stat">
              <span>APR</span>
              <strong>${annualRate.toFixed(2)}%</strong>
            </div>

            <div class="stat">
              <span>Monthly payment</span>
              <strong>${formatMoney(payment)}</strong>
            </div>

            <div class="stat">
              <span>Estimated interest</span>
              <strong>${formatMoney(totalInterest)}</strong>
            </div>

            <div class="stat">
              <span>Estimated total paid</span>
              <strong>${formatMoney(totalPaid)}</strong>
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
                      planPlus25
                        ? monthsLabel(planPlus25.months)
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
                      planPlus50
                        ? monthsLabel(planPlus50.months)
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
              balance, APR and payment you entered. Actual lender
              calculations may differ because of fees, changing rates,
              payment timing and other account-specific factors.
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

        clearInputs(
          getElement("debt-calculator")
        );

        clearResult(
          debtResult
        );

      }
    );
  }

});
```
