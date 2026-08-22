document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     HELPERS
     ===================================================== */

  function getNumber(id) {

    const element = document.getElementById(id);

    if (!element) {
      return 0;
    }

    const value = Number(element.value);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }


  function hasValue(id) {

    const element = document.getElementById(id);

    return !!(
      element &&
      element.value.trim() !== ""
    );

  }


  function money(value) {

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  }


  function showResult(element, html) {

    if (!element) {
      return;
    }

    element.innerHTML = html;

    element.classList.remove("hidden");

    setTimeout(function () {

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }


  /* =====================================================
     AFFORDABILITY CALCULATOR
     ===================================================== */

  const calculateButton =
    document.getElementById("calculateButton");

  const resetButton =
    document.getElementById("resetButton");

  const result =
    document.getElementById("result");


  if (calculateButton && result) {

    calculateButton.addEventListener("click", function () {

      const income =
        getNumber("income");

      const purchase =
        getNumber("purchase");


      if (income <= 0) {

        showResult(result, `

          <div class="result-header">

            <div class="result-status bad">
              ● Income required
            </div>

            <h2>
              Enter your monthly income
            </h2>

            <p>
              We need your monthly take-home income before
              we can assess the purchase.
            </p>

          </div>

        `);

        return;
      }


      if (purchase <= 0) {

        showResult(result, `

          <div class="result-header">

            <div class="result-status warning">
              ● Purchase price required
            </div>

            <h2>
              Enter the purchase price
            </h2>

            <p>
              Tell us how much the item or purchase costs.
            </p>

          </div>

        `);

        return;
      }


      /* =================================================
         READ EXPENSES
         ================================================= */

      const expenseFields = [
        ["rent", "Rent / mortgage"],
        ["bills", "Bills & utilities"],
        ["food", "Food & groceries"],
        ["transport", "Transport"],
        ["subscriptions", "Subscriptions"],
        ["debt", "Debt payments"]
      ];


      let totalExpenses = 0;

      let enteredExpenses = 0;

      const missingExpenses = [];


      expenseFields.forEach(function ([id, name]) {

        if (hasValue(id)) {

          totalExpenses += getNumber(id);

          enteredExpenses++;

        } else {

          missingExpenses.push(name);

        }

      });


      const disposable =
        income - totalExpenses;


      const moneyAfterPurchase =
        disposable - purchase;


      const expensePercentage =
        (totalExpenses / income) * 100;


      const purchasePercentage =
        disposable > 0
          ? (purchase / disposable) * 100
          : 100;


      const remainingPercentage =
        income > 0
          ? (moneyAfterPurchase / income) * 100
          : 0;


      /* =================================================
         SAVINGS
         ================================================= */

      const savingsEntered =
        hasValue("savings");

      const emergencyEntered =
        hasValue("emergency");


      const savings =
        getNumber("savings");

      const emergency =
        getNumber("emergency");


      let savingsAfterPurchase = null;

      let emergencyBroken = false;

      let savingsWarning = "";


      if (savingsEntered) {

        savingsAfterPurchase =
          savings - purchase;


        if (savingsAfterPurchase < 0) {

          savingsWarning = `
            <div class="advice-box warning">

              <strong>
                Your savings would not cover the purchase
              </strong>

              <p>
                That's not automatically a problem if you're
                paying from your monthly income, but it means
                the purchase shouldn't be described as being
                comfortably covered by your existing savings.
              </p>

            </div>
          `;

        }


        if (
          emergencyEntered &&
          savingsAfterPurchase < emergency
        ) {

          emergencyBroken = true;

        }

      }


      /* =================================================
         FINANCE
         ================================================= */

      const financeEntered =
        hasValue("monthlyPayment");

      const monthlyPayment =
        getNumber("monthlyPayment");


      const disposableAfterFinance =
        disposable - monthlyPayment;


      let financePercentage = 0;


      if (disposable > 0 && monthlyPayment > 0) {

        financePercentage =
          (monthlyPayment / disposable) * 100;

      }


      /* =================================================
         DECISION ENGINE
         =================================================

         The result is based primarily on actual monthly
         cashflow.

         We deliberately don't use a fake "financial score".

         Broad logic:

         1. Existing negative cashflow = wait.
         2. Purchase doesn't fit = wait.
         3. Very little remains after purchase = cautious.
         4. Purchase uses a modest amount of disposable
            income = affordable.
         5. Savings/emergency fund provide additional
            context rather than automatically deciding
            the answer.
      */


      let status;
      let statusClass;
      let title;
      let mainAdvice;


      if (disposable < 0) {

        status =
          "Not affordable from the figures entered";

        statusClass =
          "bad";

        title =
          "I'd wait before buying it";

        mainAdvice = `
          <div class="advice-box bad">

            <strong>
              Your current budget is already running short
            </strong>

            <p>
              The expenses you've entered are
              ${money(Math.abs(disposable))}
              higher than your monthly income. Adding this
              purchase would increase that shortfall.
            </p>

          </div>
        `;

      }

      else if (disposable === 0) {

        status =
          "No monthly budget remaining";

        statusClass =
          "bad";

        title =
          "I'd wait and plan for it";

        mainAdvice = `
          <div class="advice-box bad">

            <strong>
              Your entered expenses use all of your income
            </strong>

            <p>
              There isn't currently any money left in the
              monthly budget you've provided to comfortably
              absorb this purchase.
            </p>

          </div>
        `;

      }

      else if (moneyAfterPurchase < 0) {

        status =
          "Purchase exceeds available monthly money";

        statusClass =
          "bad";

        title =
          "I'd wait and save for it";

        mainAdvice = `
          <div class="advice-box bad">

            <strong>
              The purchase doesn't fit this month's budget
            </strong>

            <p>
              After your entered expenses, you have
              ${money(disposable)} available, while the
              purchase costs ${money(purchase)}.
              You would be approximately
              ${money(Math.abs(moneyAfterPurchase))}
              short.
            </p>

          </div>
        `;

      }

      else if (
        remainingPercentage < 5 ||
        purchasePercentage > 80
      ) {

        status =
          "Very little breathing room";

        statusClass =
          "warning";

        title =
          "I'd be cautious";

        mainAdvice = `
          <div class="advice-box warning">

            <strong>
              You can technically cover it, but the margin is small
            </strong>

            <p>
              The purchase would use about
              ${purchasePercentage.toFixed(0)}%
              of the money left after your entered expenses,
              leaving approximately
              ${money(moneyAfterPurchase)}.
              I'd want more breathing room before treating
              this as a comfortable purchase.
            </p>

          </div>
        `;

      }

      else if (
        purchasePercentage > 50 ||
        remainingPercentage < 10
      ) {

        status =
          "Manageable, but significant";

        statusClass =
          "warning";

        title =
          "I'd think twice";

        mainAdvice = `
          <div class="advice-box warning">

            <strong>
              The purchase would take a noticeable amount
              of your available money
            </strong>

            <p>
              You can cover it based on the figures entered,
              but it would leave approximately
              ${money(moneyAfterPurchase)}.
              Consider upcoming expenses before committing.
            </p>

          </div>
        `;

      }

      else if (
        purchasePercentage <= 20 &&
        remainingPercentage >= 20
      ) {

        status =
          "Comfortable based on the figures entered";

        statusClass =
          "good";

        title =
          "This looks affordable";

        mainAdvice = `
          <div class="advice-box good">

            <strong>
              You appear to have reasonable breathing room
            </strong>

            <p>
              After your entered expenses and this purchase,
              you'd have approximately
              ${money(moneyAfterPurchase)}
              left. The purchase uses about
              ${purchasePercentage.toFixed(0)}%
              of the money you currently have left.
            </p>

          </div>
        `;

      }

      else {

        status =
          "Likely manageable";

        statusClass =
          "good";

        title =
          "This looks manageable";

        mainAdvice = `
          <div class="advice-box good">

            <strong>
              The numbers leave some room after the purchase
            </strong>

            <p>
              You appear able to cover the purchase while
              retaining approximately
              ${money(moneyAfterPurchase)}
              after the expenses you've entered.
            </p>

          </div>
        `;

      }


      /* =================================================
         EMERGENCY FUND MESSAGE
         ================================================= */

      let emergencyMessage = "";


      if (emergencyBroken) {

        emergencyMessage = `

          <div class="advice-box warning">

            <strong>
              Your emergency-fund target would be affected
            </strong>

            <p>
              Paying for the purchase from your savings would
              leave approximately
              ${money(savingsAfterPurchase)},
              below the emergency-fund target of
              ${money(emergency)}.
            </p>

          </div>

        `;

      }


      /* =================================================
         FINANCE MESSAGE
         ================================================= */

      let financeMessage = "";


      if (financeEntered && monthlyPayment > 0) {

        if (disposable <= 0) {

          financeMessage = `

            <div class="advice-box bad">

              <strong>
                The finance payment doesn't fit the current budget
              </strong>

              <p>
                You don't currently have enough disposable
                income to comfortably take on a
                ${money(monthlyPayment)}
                monthly payment.
              </p>

            </div>

          `;

        }

        else if (disposableAfterFinance < 0) {

          financeMessage = `

            <div class="advice-box bad">

              <strong>
                The finance payment would exceed your remaining money
              </strong>

              <p>
                Your entered expenses leave
                ${money(disposable)}
                available, while the proposed finance payment
                is ${money(monthlyPayment)}.
              </p>

            </div>

          `;

        }

        else if (financePercentage > 30) {

          financeMessage = `

            <div class="advice-box warning">

              <strong>
                That's a substantial monthly commitment
              </strong>

              <p>
                The proposed finance payment uses approximately
                ${financePercentage.toFixed(0)}%
                of your disposable income.
                I'd be cautious about taking on that commitment.
              </p>

            </div>

          `;

        }

        else if (financePercentage > 15) {

          financeMessage = `

            <div class="advice-box warning">

              <strong>
                Check that the payment remains comfortable
              </strong>

              <p>
                The proposed finance payment uses approximately
                ${financePercentage.toFixed(0)}%
                of your disposable income.
                Remember that finance also creates an ongoing
                monthly commitment.
              </p>

            </div>

          `;

        }

        else {

          financeMessage = `

            <div class="advice-box good">

              <strong>
                The proposed monthly payment looks relatively modest
              </strong>

              <p>
                It would use approximately
                ${financePercentage.toFixed(0)}%
                of your current disposable income based on
                the figures entered.
              </p>

            </div>

          `;

        }

      }


      /* =================================================
         HOUSING MESSAGE
         ================================================= */

      let housingMessage = "";

      if (hasValue("rent")) {

        const rent =
          getNumber("rent");

        const housingPercentage =
          (rent / income) * 100;


        if (housingPercentage > 50) {

          housingMessage = `

            <div class="info-box">

              <strong>
                Housing is a large part of your income
              </strong>

              <p>
                Your entered rent/mortgage is approximately
                ${housingPercentage.toFixed(0)}%
                of your take-home income. That doesn't
                automatically make the purchase unaffordable,
                but it means maintaining a buffer is especially
                important.
              </p>

            </div>

          `;

        }

      }


      /* =================================================
         MISSING INFORMATION
         ================================================= */

      let dataMessage = "";


      if (missingExpenses.length > 0) {

        dataMessage = `

          <div class="info-box">

            <strong>
              ℹ️ This is based only on the costs you entered
            </strong>

            <p>
              You left the following expense categories blank:
              <strong>
                ${missingExpenses.join(", ")}
              </strong>.
            </p>

            <p>
              Blank fields have not been treated as confirmed
              £0 spending. Adding regular costs you have will
              make the estimate more useful.
            </p>

          </div>

        `;

      }
      else {

        dataMessage = `

          <div class="info-box">

            <strong>
              ✓ All main monthly expense categories included
            </strong>

            <p>
              You've entered rent, bills, food, transport,
              subscriptions and debt payments.
            </p>

          </div>

        `;

      }


      /* =================================================
         BUILD RESULT
         ================================================= */

      showResult(result, `

        <div class="result-header">

          <div class="result-status ${statusClass}">
            ● ${status}
          </div>

          <h2>
            ${title}
          </h2>

          <p>
            This is an estimate based on the information
            you've provided — not a guarantee of affordability.
          </p>


          <div class="result-hero-number">

            <span>
              Money left after your entered expenses
              and this purchase
            </span>

            <strong>
              ${money(moneyAfterPurchase)}
            </strong>

          </div>

        </div>


        ${mainAdvice}


        <h3>
          Your numbers
        </h3>


        <div class="stat">

          <span>
            Monthly income
          </span>

          <strong>
            ${money(income)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Expenses entered
          </span>

          <strong>
            ${enteredExpenses}
          </strong>

        </div>


        <div class="stat">

          <span>
            Total monthly expenses entered
          </span>

          <strong>
            ${money(totalExpenses)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left before purchase
          </span>

          <strong>
            ${money(disposable)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Purchase price
          </span>

          <strong>
            ${money(purchase)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Purchase uses
          </span>

          <strong>
            ${purchasePercentage.toFixed(1)}%
            of available money
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left after purchase
          </span>

          <strong>
            ${money(moneyAfterPurchase)}
          </strong>

        </div>


        ${housingMessage}


        ${emergencyMessage}


        ${financeMessage}


        <h3>
          🧠 WorthChex's view
        </h3>


        <p>
          The most important figure here is not a generic
          score — it's how much money remains after your
          known monthly costs and the purchase.
        </p>


        ${dataMessage}


        ${savingsWarning}


        <p class="disclaimer">
          This calculator uses the figures you provide.
          It cannot account for every future expense,
          irregular cost or change in circumstances.
          It is not financial advice.
        </p>

      `);

    });

  }


  /* =====================================================
     AFFORDABILITY RESET
     ===================================================== */

  if (resetButton) {

    resetButton.addEventListener("click", function () {

      document
        .querySelectorAll("#calculator input")
        .forEach(function (input) {

          input.value = "";

        });


      if (result) {

        result.innerHTML = "";

        result.classList.add("hidden");

      }

    });

  }


  /* =====================================================
     SAVINGS CALCULATOR
     ===================================================== */

  const savingsCalculateButton =
    document.getElementById("savingsCalculateButton");

  const savingsResetButton =
    document.getElementById("savingsResetButton");

  const savingsResult =
    document.getElementById("savingsResult");


  if (savingsCalculateButton && savingsResult) {

    savingsCalculateButton.addEventListener(
      "click",
      function () {

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
              <div class="result-header">

                <div class="result-status warning">
                  ● Savings goal required
                </div>

                <h2>
                  Enter a savings goal
                </h2>

                <p>
                  Tell us how much you'd like to save.
                </p>

              </div>
            `
          );

          return;

        }


        if (current >= goal) {

          showResult(
            savingsResult,
            `

              <div class="result-header">

                <div class="result-status good">
                  ✓ Goal reached
                </div>

                <h2>
                  You've already reached your goal! 🎉
                </h2>

                <p>
                  You have ${money(current)} saved against
                  a target of ${money(goal)}.
                </p>

              </div>

              <div class="stat">

                <span>
                  Savings goal
                </span>

                <strong>
                  ${money(goal)}
                </strong>

              </div>

              <div class="stat">

                <span>
                  Current savings
                </span>

                <strong>
                  ${money(current)}
                </strong>

              </div>

              <div class="advice-box good">

                <strong>
                  Nice work.
                </strong>

                <p>
                  You've already reached the target you
                  entered.
                </p>

              </div>

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

              <div class="result-header">

                <div class="result-status warning">
                  ● Monthly saving required
                </div>

                <h2>
                  Enter a monthly saving amount
                </h2>

                <p>
                  You currently need ${money(remaining)}
                  more to reach your goal.
                </p>

              </div>

            `
          );

          return;

        }


        const remaining =
          goal - current;


        const months =
          Math.ceil(remaining / monthly);


        const monthsPlus25 =
          Math.ceil(
            remaining / (monthly + 25)
          );


        const monthsPlus50 =
          Math.ceil(
            remaining / (monthly + 50)
          );


        const saved25 =
          Math.max(
            months - monthsPlus25,
            0
          );


        const saved50 =
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
            This is a relatively short-term target.
            Staying consistent should put you on track
            to reach it soon.
          `;

        }
        else if (months <= 12) {

          advice = `
            This looks like a manageable medium-term goal.
            An automatic transfer after payday can make
            consistency easier.
          `;

        }
        else if (months <= 24) {

          advice = `
            This is a longer-term goal. Breaking it into
            smaller milestones can make the target easier
            to stay motivated towards.
          `;

        }
        else {

          advice = `
            This is a substantial target. Consider setting
            smaller milestones and reviewing your monthly
            saving amount whenever your circumstances change.
          `;

        }


        showResult(
          savingsResult,
          `

            <div class="result-header">

              <div class="result-status good">
                ● Savings plan
              </div>

              <h2>
                You're ${progress.toFixed(0)}% there
              </h2>

              <p>
                At your current saving rate, you could
                reach the goal in approximately
                <strong>
                  ${months}
                  month${months === 1 ? "" : "s"}
                </strong>.
              </p>

            </div>


            <div class="progress-container">

              <div
                class="progress-bar"
                style="width: ${progress}%"
              ></div>

            </div>


            <div class="stat">

              <span>
                Current savings
              </span>

              <strong>
                ${money(current)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Savings goal
              </span>

              <strong>
                ${money(goal)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Still needed
              </span>

              <strong>
                ${money(remaining)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Monthly saving
              </span>

              <strong>
                ${money(monthly)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Estimated goal date
              </span>

              <strong>
                ${dateText}
              </strong>

            </div>


            <h3>
              🧠 WorthChex's view
            </h3>

            <p>
              ${advice}
            </p>


            <div class="what-if-box">

              <h3>
                🚀 What if you saved more?
              </h3>

              <p class="what-if-intro">
                Even a relatively small increase can shorten
                the timeline.
              </p>


              <div class="what-if-grid">

                <div class="what-if-card">

                  <span>
                    Save £25 more
                  </span>

                  <strong>
                    ${monthsPlus25} months
                  </strong>

                  <small>
                    ${
                      saved25 > 0
                        ? `${saved25} month${saved25 === 1 ? "" : "s"} sooner`
                        : "Same estimated timeline"
                    }
                  </small>

                </div>


                <div class="what-if-card featured">

                  <span>
                    Save £50 more
                  </span>

                  <strong>
                    ${monthsPlus50} months
                  </strong>

                  <small>
                    ${
                      saved50 > 0
                        ? `${saved50} month${saved50 === 1 ? "" : "s"} sooner`
                        : "Same estimated timeline"
                    }
                  </small>

                </div>

              </div>

            </div>


            <p class="disclaimer">
              This is a simple estimate assuming a consistent
              monthly saving amount and no interest on savings.
            </p>

          `
        );

      }
    );

  }


  /* =====================================================
     SAVINGS RESET
     ===================================================== */

  if (savingsResetButton) {

    savingsResetButton.addEventListener(
      "click",
      function () {

        [
          "currentSavings",
          "savingsGoal",
          "monthlySaving"
        ].forEach(function (id) {

          const input =
            document.getElementById(id);

          if (input) {
            input.value = "";
          }

        });


        if (savingsResult) {

          savingsResult.innerHTML = "";

          savingsResult.classList.add("hidden");

        }

      }
    );

  }


  /* =====================================================
     DEBT CALCULATOR
     ===================================================== */

  const debtCalculateButton =
    document.getElementById("debtCalculateButton");

  const debtResetButton =
    document.getElementById("debtResetButton");

  const debtResult =
    document.getElementById("debtResult");


  function calculateDebtMonths(
    balance,
    annualRate,
    payment
  ) {

    const monthlyRate =
      annualRate / 100 / 12;


    if (
      monthlyRate > 0 &&
      payment <= balance * monthlyRate
    ) {

      return 1200;

    }


    let remaining =
      balance;

    let months =
      0;


    while (
      remaining > 0.01 &&
      months < 1200
    ) {

      const interest =
        remaining * monthlyRate;

      const principal =
        payment - interest;


      if (principal <= 0) {

        return 1200;

      }


      remaining -= principal;

      months++;

    }


    return months;

  }


  if (debtCalculateButton && debtResult) {

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

              <div class="result-header">

                <div class="result-status warning">
                  ● Debt balance required
                </div>

                <h2>
                  Enter your current debt
                </h2>

                <p>
                  Enter the amount you currently owe.
                </p>

              </div>

            `
          );

          return;

        }


        if (payment <= 0) {

          showResult(
            debtResult,
            `

              <div class="result-header">

                <div class="result-status warning">
                  ● Monthly payment required
                </div>

                <h2>
                  Enter your monthly payment
                </h2>

                <p>
                  Tell us how much you're currently able
                  to pay each month.
                </p>

              </div>

            `
          );

          return;

        }


        const monthlyRate =
          annualRate / 100 / 12;


        const firstMonthInterest =
          balance * monthlyRate;


        if (
          monthlyRate > 0 &&
          payment <= firstMonthInterest
        ) {

          showResult(
            debtResult,
            `

              <div class="result-header">

                <div class="result-status bad">
                  ● Payment may not reduce the balance
                </div>

                <h2>
                  This payment may not pay off the debt
                </h2>

                <p>
                  At an APR of ${annualRate.toFixed(2)}%,
                  the estimated interest in the first month
                  is ${money(firstMonthInterest)}.
                </p>

              </div>


              <div class="advice-box bad">

                <strong>
                  The payment needs to exceed the interest
                </strong>

                <p>
                  If the monthly payment is no greater than
                  the interest being added, the balance may
                  not decrease.
                </p>

              </div>

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


        if (months >= 1200) {

          showResult(
            debtResult,
            `

              <div class="result-header">

                <div class="result-status warning">
                  ● Very long repayment period
                </div>

                <h2>
                  This debt could take a very long time to repay
                </h2>

                <p>
                  Try increasing the monthly payment and
                  calculate again.
                </p>

              </div>

            `
          );

          return;

        }


        let remaining =
          balance;

        let totalInterest =
          0;

        let month =
          0;


        while (
          remaining > 0.01 &&
          month < months
        ) {

          const interest =
            remaining * monthlyRate;

          const principal =
            payment - interest;


          if (principal <= 0) {
            break;
          }


          totalInterest += interest;

          remaining -= principal;

          month++;

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
          Math.max(
            months - extra25,
            0
          );


        const saved50 =
          Math.max(
            months - extra50,
            0
          );


        let advice;


        if (months <= 12) {

          advice = `
            You're on a relatively short repayment
            timeline. Staying consistent should keep
            you moving towards being debt-free.
          `;

        }
        else if (months <= 36) {

          advice = `
            This is a medium-term repayment plan.
            If your budget allows, even a modest increase
            in the monthly payment could shorten the
            timeline.
          `;

        }
        else {

          advice = `
            This is a long repayment timeline. Keeping
            payments consistent is important, and you
            can explore what happens if you increase the
            payment when your budget allows.
          `;

        }


        showResult(
          debtResult,
          `

            <div class="result-header">

              <div class="result-status good">
                ● Estimated repayment
              </div>

              <h2>
                Debt-free in approximately
                ${months} months
              </h2>

              <p>
                At a monthly payment of ${money(payment)},
                your estimated payoff date is
                <strong>
                  ${payoffDateText}
                </strong>.
              </p>

            </div>


            <div class="stat">

              <span>
                Starting debt
              </span>

              <strong>
                ${money(balance)}
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
                ${money(payment)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Estimated interest
              </span>

              <strong>
                ${money(totalInterest)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Estimated total paid
              </span>

              <strong>
                ${money(totalPaid)}
              </strong>

            </div>


            <div class="what-if-box">

              <h3>
                🚀 What if you paid more?
              </h3>


              <div class="what-if-grid">

                <div class="what-if-card">

                  <span>
                    Pay £25 more
                  </span>

                  <strong>
                    ${
                      extra25 >= 1200
                        ? "Very long"
                        : `${extra25} months`
                    }
                  </strong>

                  <small>
                    ${
                      saved25 > 0
                        ? `About ${saved25} month${saved25 === 1 ? "" : "s"} sooner`
                        : "No significant change"
                    }
                  </small>

                </div>


                <div class="what-if-card featured">

                  <span>
                    Pay £50 more
                  </span>

                  <strong>
                    ${
                      extra50 >= 1200
                        ? "Very long"
                        : `${extra50} months`
                    }
                  </strong>

                  <small>
                    ${
                      saved50 > 0
                        ? `About ${saved50} month${saved50 === 1 ? "" : "s"} sooner`
                        : "No significant change"
                    }
                  </small>

                </div>

              </div>

            </div>


            <h3>
              🧠 WorthChex's view
            </h3>


            <p>
              ${advice}
            </p>


            <p class="disclaimer">
              This is an estimate using monthly interest
              calculations. Actual lender calculations can
              differ because of payment dates, fees, interest
              methods and other terms.
            </p>

          `
        );

      }
    );

  }


  /* =====================================================
     DEBT RESET
     ===================================================== */

  if (debtResetButton) {

    debtResetButton.addEventListener(
      "click",
      function () {

        [
          "debtBalance",
          "interestRate",
          "debtPayment"
        ].forEach(function (id) {

          const input =
            document.getElementById(id);

          if (input) {
            input.value = "";
          }

        });


        if (debtResult) {

          debtResult.innerHTML = "";

          debtResult.classList.add("hidden");

        }

      }
    );

  }

});
