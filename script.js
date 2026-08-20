document.addEventListener("DOMContentLoaded", function () {

  // =====================================================
  // AFFORDABILITY CALCULATOR
  // =====================================================

  const calculateButton =
    document.getElementById("calculateButton");

  const resetButton =
    document.getElementById("resetButton");

  const result =
    document.getElementById("result");


  if (calculateButton) {

    calculateButton.addEventListener("click", function () {

      const income =
        Number(document.getElementById("income").value) || 0;

      const rent =
        Number(document.getElementById("rent").value) || 0;

      const bills =
        Number(document.getElementById("bills").value) || 0;

      const food =
        Number(document.getElementById("food").value) || 0;

      const transport =
        Number(document.getElementById("transport").value) || 0;

      const subscriptions =
        Number(document.getElementById("subscriptions").value) || 0;

      const debt =
        Number(document.getElementById("debt").value) || 0;

      const savings =
        Number(document.getElementById("savings").value) || 0;

      const emergency =
        Number(document.getElementById("emergency").value) || 0;

      const purchase =
        Number(document.getElementById("purchase").value) || 0;

      const monthlyPayment =
        Number(document.getElementById("monthlyPayment").value) || 0;


      // =====================================================
      // CHECK WHICH EXPENSES HAVE BEEN ENTERED
      // =====================================================

      const hasRent =
        document.getElementById("rent").value !== "";

      const hasBills =
        document.getElementById("bills").value !== "";

      const hasFood =
        document.getElementById("food").value !== "";

      const hasTransport =
        document.getElementById("transport").value !== "";

      const hasSubscriptions =
        document.getElementById("subscriptions").value !== "";

      const hasDebt =
        document.getElementById("debt").value !== "";

      const hasSavings =
        document.getElementById("savings").value !== "";

      const hasEmergency =
        document.getElementById("emergency").value !== "";

      const hasFinance =
        document.getElementById("monthlyPayment").value !== "" &&
        monthlyPayment > 0;


      // =====================================================
      // FIND MISSING EXPENSE INFORMATION
      // =====================================================

      const missingExpenses = [];


      if (!hasRent) {
        missingExpenses.push("rent");
      }

      if (!hasBills) {
        missingExpenses.push("bills");
      }

      if (!hasFood) {
        missingExpenses.push("food");
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


      const allMainExpensesEntered =
        missingExpenses.length === 0;


      // =====================================================
      // VALIDATION
      // =====================================================

      if (income <= 0) {

        showAffordabilityResult(`
          <h2 class="bad">
            Enter your income
          </h2>

          <p>
            Enter your monthly take-home income so we can
            work out what you can realistically afford.
          </p>
        `);

        return;
      }


      if (purchase <= 0) {

        showAffordabilityResult(`
          <h2 class="warning">
            Enter the purchase price
          </h2>

          <p>
            Tell us how much the thing you want to buy costs.
          </p>
        `);

        return;
      }


      // =====================================================
      // TOTAL MONTHLY EXPENSES
      // =====================================================

      const totalMonthlyExpenses =
        rent +
        bills +
        food +
        transport +
        subscriptions +
        debt;


      // =====================================================
      // ACTUAL DISPOSABLE INCOME
      // =====================================================

      const disposableIncome =
        income - totalMonthlyExpenses;


      // =====================================================
      // PERCENTAGES
      // =====================================================

      const housingPercentage =
        income > 0
          ? (rent / income) * 100
          : 0;


      const expensePercentage =
        income > 0
          ? (totalMonthlyExpenses / income) * 100
          : 100;


      const purchasePercentage =
        disposableIncome > 0
          ? (purchase / disposableIncome) * 100
          : 100;


      // =====================================================
      // MONEY LEFT AFTER PURCHASE
      // =====================================================

      const moneyAfterPurchase =
        disposableIncome - purchase;


      // =====================================================
      // FINANCE CALCULATIONS
      // =====================================================

      const moneyAfterFinance =
        disposableIncome - monthlyPayment;


      const financePercentage =
        disposableIncome > 0
          ? (monthlyPayment / disposableIncome) * 100
          : 100;


      // =====================================================
      // SAVINGS CHECK
      // =====================================================

      let savingsAfterPurchase = null;

      let savingsInsufficient = false;

      let emergencyFundBroken = false;


      if (hasSavings) {

        savingsAfterPurchase =
          savings - purchase;


        if (savingsAfterPurchase < 0) {

          savingsInsufficient = true;

        }


        if (
          hasEmergency &&
          savingsAfterPurchase < emergency
        ) {

          emergencyFundBroken = true;

        }

      }


      // =====================================================
      // AFFORDABILITY SCORE
      //
      // The score now considers:
      //
      // - disposable income
      // - total monthly expenses
      // - purchase size
      // - housing cost
      // - savings
      // - emergency fund
      // - finance payment
      // - missing expense information
      // =====================================================

      let deductions = 0;


      // -----------------------------------------------------
      // CASHFLOW
      // -----------------------------------------------------

      if (disposableIncome <= 0) {

        deductions += 70;

      }

      else if (disposableIncome < income * 0.05) {

        deductions += 55;

      }

      else if (disposableIncome < income * 0.10) {

        deductions += 40;

      }

      else if (disposableIncome < income * 0.20) {

        deductions += 25;

      }

      else if (disposableIncome < income * 0.30) {

        deductions += 10;

      }


      // -----------------------------------------------------
      // PURCHASE SIZE
      // -----------------------------------------------------

      if (disposableIncome > 0) {

        if (purchasePercentage > 100) {

          deductions += 45;

        }

        else if (purchasePercentage > 75) {

          deductions += 35;

        }

        else if (purchasePercentage > 50) {

          deductions += 25;

        }

        else if (purchasePercentage > 35) {

          deductions += 18;

        }

        else if (purchasePercentage > 25) {

          deductions += 12;

        }

        else if (purchasePercentage > 15) {

          deductions += 6;

        }

      }


      // -----------------------------------------------------
      // TOTAL EXPENSE BURDEN
      // -----------------------------------------------------

      if (expensePercentage > 95) {

        deductions += 25;

      }

      else if (expensePercentage > 85) {

        deductions += 18;

      }

      else if (expensePercentage > 75) {

        deductions += 10;

      }


      // -----------------------------------------------------
      // HOUSING
      // -----------------------------------------------------

      if (housingPercentage > 50) {

        deductions += 15;

      }

      else if (housingPercentage > 40) {

        deductions += 10;

      }

      else if (housingPercentage > 35) {

        deductions += 5;

      }


      // -----------------------------------------------------
      // SAVINGS
      // -----------------------------------------------------

      if (savingsInsufficient) {

        deductions += 15;

      }


      if (emergencyFundBroken) {

        deductions += 15;

      }


      // -----------------------------------------------------
      // FINANCE
      // -----------------------------------------------------

      if (hasFinance) {

        if (moneyAfterFinance <= 0) {

          deductions += 30;

        }

        else if (financePercentage > 30) {

          deductions += 20;

        }

        else if (financePercentage > 20) {

          deductions += 12;

        }

        else if (financePercentage > 10) {

          deductions += 5;

        }

      }


      // -----------------------------------------------------
      // MISSING INFORMATION
      //
      // We still calculate using everything entered, but
      // reduce confidence in the score when categories
      // have been left blank.
      // -----------------------------------------------------

      deductions +=
        missingExpenses.length * 8;


      // -----------------------------------------------------
      // FINAL SCORE
      // -----------------------------------------------------

      const score =
        Math.max(
          5,
          Math.min(
            100,
            Math.round(100 - deductions)
          )
        );


      // =====================================================
      // MAIN RESULT
      // =====================================================

      let title;

      let colour;

      let advice;


      // -----------------------------------------------------
      // NO DISPOSABLE MONEY
      // -----------------------------------------------------

      if (disposableIncome <= 0) {

        title =
          "I wouldn't buy it right now";

        colour =
          "bad";

        advice = `
          Your listed monthly expenses are using all of
          your take-home income or more.

          Based on the figures you've entered, this purchase
          isn't affordable without putting additional pressure
          on your finances.

          I'd focus on getting your monthly budget back into
          positive territory before making the purchase.
        `;

      }


      // -----------------------------------------------------
      // PURCHASE IS LARGER THAN DISPOSABLE INCOME
      // -----------------------------------------------------

      else if (moneyAfterPurchase < 0) {

        title =
          "I'd save for it first";

        colour =
          "bad";

        advice = `
          The purchase is larger than your current monthly
          disposable income.

          Buying it outright this month would leave your
          budget short after your normal monthly expenses.

          I'd save toward the purchase rather than putting
          pressure on your finances or relying on credit.
        `;

      }


      // -----------------------------------------------------
      // EMERGENCY FUND WOULD BE USED
      // -----------------------------------------------------

      else if (emergencyFundBroken) {

        title =
          "I'd be cautious";

        colour =
          "warning";

        advice = `
          Your monthly budget may be able to handle the
          purchase, but buying it would take your savings
          below the emergency-fund target you've entered.

          Unless the purchase is necessary, I'd consider
          waiting until your emergency buffer is stronger.
        `;

      }


      // -----------------------------------------------------
      // SAVINGS DON'T COVER PURCHASE
      // -----------------------------------------------------

      else if (savingsInsufficient) {

        title =
          "I'd think twice";

        colour =
          "warning";

        advice = `
          Your monthly budget has some room for the purchase,
          but your current savings wouldn't fully cover it.

          I'd avoid leaving yourself without a cash buffer
          just to make the purchase.
        `;

      }


      // -----------------------------------------------------
      // VERY STRONG POSITION
      // -----------------------------------------------------

      else if (score >= 80) {

        title =
          "Looks affordable";

        colour =
          "good";

        advice = `
          Based on the income and expenses you've entered,
          you appear to have a healthy amount of money left
          after your normal monthly costs.

          The purchase is relatively manageable compared
          with your remaining monthly budget.
        `;

      }


      // -----------------------------------------------------
      // REASONABLE BUT NOT TRIVIAL
      // -----------------------------------------------------

      else if (score >= 65) {

        title =
          "Probably manageable";

        colour =
          "good";

        advice = `
          You appear to have enough room in your monthly
          budget for this purchase, but it isn't insignificant
          compared with your available money.

          I'd make sure you still have enough left for
          unexpected costs and other upcoming expenses.
        `;

      }


      // -----------------------------------------------------
      // BORDERLINE
      // -----------------------------------------------------

      else if (score >= 50) {

        title =
          "I'd think twice";

        colour =
          "warning";

        advice = `
          The purchase appears possible, but it would take
          a meaningful amount of your available money.

          I'd consider waiting, saving more first, or looking
          for a cheaper option so the purchase doesn't put
          unnecessary pressure on your monthly budget.
        `;

      }


      // -----------------------------------------------------
      // LOW AFFORDABILITY
      // -----------------------------------------------------

      else {

        title =
          "I'd wait and plan for it";

        colour =
          "bad";

        advice = `
          Based on the numbers you've entered, this purchase
          would put a significant amount of pressure on your
          finances.

          I'd wait and build up more available money before
          buying it.
        `;

      }


      // =====================================================
      // BUDGET ADVICE
      // =====================================================

      let budgetAdvice = "";


      if (expensePercentage >= 90) {

        budgetAdvice = `
          <p class="warning">
            ⚠️ Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            Your remaining budget is quite tight, so
            unexpected costs could make a noticeable
            difference.
          </p>
        `;

      }

      else if (expensePercentage >= 75) {

        budgetAdvice = `
          <p class="warning">
            Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your income.

            You have some room left, but I wouldn't treat
            all of that remaining money as spare cash.
          </p>
        `;

      }

      else {

        budgetAdvice = `
          <p class="good">
            ✓ Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            That leaves approximately
            <strong>
              £${disposableIncome.toFixed(2)}
            </strong>
            before this purchase and any costs you haven't
            included.
          </p>
        `;

      }


      // =====================================================
      // HOUSING ADVICE
      // =====================================================

      let housingAdvice = "";


      if (!hasRent) {

        housingAdvice = `
          <p class="warning">
            ⚠️ You haven't entered your housing cost.

            This makes the affordability result less
            reliable, so I'd add it before relying on
            the score.
          </p>
        `;

      }

      else if (housingPercentage > 50) {

        housingAdvice = `
          <p class="warning">
            Your rent is about
            <strong>
              ${housingPercentage.toFixed(0)}%
            </strong>
            of your take-home income.

            That's a very large housing commitment,
            so I'd be particularly careful about taking
            on additional spending.
          </p>
        `;

      }

      else if (housingPercentage > 35) {

        housingAdvice = `
          <p>
            Your rent is about
            <strong>
              ${housingPercentage.toFixed(0)}%
            </strong>
            of your take-home income.

            Housing is taking a meaningful share of your
            income, so keeping the rest of your spending
            under control is particularly important.
          </p>
        `;

      }

      else {

        housingAdvice = `
          <p>
            Your rent is about
            <strong>
              ${housingPercentage.toFixed(0)}%
            </strong>
            of your take-home income.
          </p>
        `;

      }


      // =====================================================
      // SAVINGS ADVICE
      // =====================================================

      let savingsAdvice = "";


      if (!hasSavings) {

        savingsAdvice = `
          <p class="warning">
            💡 You haven't entered your savings.

            For a significant purchase, I'd check that
            you still have a reasonable emergency buffer
            after buying it.
          </p>
        `;

      }

      else if (savingsInsufficient) {

        savingsAdvice = `
          <p class="bad">
            ⚠️ Your current savings wouldn't fully cover
            this purchase.

            I'd avoid using debt simply to make the purchase
            affordable if you can save for it instead.
          </p>
        `;

      }

      else if (emergencyFundBroken) {

        savingsAdvice = `
          <p class="warning">
            ⚠️ You could pay for the purchase from savings,
            but doing so would take your savings below your
            emergency-fund target.

            I'd consider rebuilding that buffer first.
          </p>
        `;

      }

      else {

        savingsAdvice = `
          <p class="good">
            ✓ Your entered savings could cover the purchase
            while keeping your emergency-fund target intact.
          </p>
        `;

      }


      // =====================================================
      // FINANCE ADVICE
      // =====================================================

      let financeAdvice = "";


      if (hasFinance) {

        if (moneyAfterFinance <= 0) {

          financeAdvice = `
            <p class="bad">
              ⚠️ The proposed finance payment would use
              essentially all of your current disposable
              income.

              I would not consider that a comfortable
              level of affordability.
            </p>
          `;

        }

        else if (financePercentage > 20) {

          financeAdvice = `
            <p class="warning">
              ⚠️ The proposed finance payment would use
              about
              <strong>
                ${financePercentage.toFixed(0)}%
              </strong>
              of your current disposable income.

              That's a significant ongoing commitment.
            </p>
          `;

        }

        else {

          financeAdvice = `
            <p class="good">
              ✓ The proposed finance payment would use
              about
              <strong>
                ${financePercentage.toFixed(0)}%
              </strong>
              of your current disposable income.
            </p>
          `;

        }

      }


      // =====================================================
      // INFORMATION MESSAGE
      // =====================================================

      let dataMessage = "";


      if (!allMainExpensesEntered) {

        const missingExpenseText =
          missingExpenses.join(", ");


        dataMessage = `
          <div class="info-box">

            <strong>
              ⚠️ Some expenses are missing
            </strong>

            <p>
              The calculator has included every expense
              you've entered.

              However, these categories are still blank:
            </p>

            <p>
              <strong>
                ${missingExpenseText}
              </strong>
            </p>

            <p>
              Add those costs for a more complete
              affordability assessment.
            </p>

          </div>
        `;

      }

      else {

        dataMessage = `
          <div class="info-box good-box">

            <strong>
              ✓ Full monthly expenses included
            </strong>

            <p>
              This calculation includes your rent, bills,
              food, transport, subscriptions and debt
              payments.
            </p>

          </div>
        `;

      }


      // =====================================================
      // PURCHASE IMPACT
      // =====================================================

      let purchaseAdvice = "";


      if (moneyAfterPurchase < 0) {

        purchaseAdvice = `
          <p class="bad">
            ⚠️ After your normal monthly expenses, you would
            be approximately
            <strong>
              £${Math.abs(moneyAfterPurchase).toFixed(2)}
            </strong>
            short if you bought this outright this month.
          </p>
        `;

      }

      else {

        purchaseAdvice = `
          <p>
            After your listed monthly expenses and this
            purchase, you'd have approximately
            <strong>
              £${moneyAfterPurchase.toFixed(2)}
            </strong>
            left.
          </p>
        `;

      }


      // =====================================================
      // DISPLAY RESULT
      // =====================================================

      showAffordabilityResult(`

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


        <p>
          ${advice}
        </p>


        <div class="stat">

          <span>
            Monthly income
          </span>

          <strong>
            £${income.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Total monthly expenses
          </span>

          <strong>
            £${totalMonthlyExpenses.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left after all listed expenses
          </span>

          <strong>
            £${disposableIncome.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Purchase price
          </span>

          <strong>
            £${purchase.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Purchase vs disposable income
          </span>

          <strong>
            ${
              disposableIncome > 0
                ? purchasePercentage.toFixed(1)
                : "—"
            }%
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left after purchase
          </span>

          <strong>
            £${moneyAfterPurchase.toFixed(2)}
          </strong>

        </div>


        <h3>
          🧠 MoneyCheck's advice
        </h3>


        ${budgetAdvice}


        ${housingAdvice}


        ${purchaseAdvice}


        ${savingsAdvice}


        ${financeAdvice}


        ${dataMessage}


        <p class="disclaimer">
          This calculator provides an estimate based on
          the information entered. It is not financial
          advice. Real affordability can also depend on
          irregular expenses, upcoming commitments,
          interest, taxes and individual circumstances.
        </p>

      `);

    });

  }


  // =====================================================
  // AFFORDABILITY RESET
  // =====================================================

  if (resetButton) {

    resetButton.addEventListener("click", function () {

      document
        .querySelectorAll("#calculator input")
        .forEach(function (input) {

          input.value = "";

        });


      result.innerHTML = "";

      result.classList.add("hidden");

    });

  }


  // =====================================================
  // SAVINGS GOAL CALCULATOR
  // =====================================================

  const savingsCalculateButton =
    document.getElementById("savingsCalculateButton");

  const savingsResetButton =
    document.getElementById("savingsResetButton");

  const savingsResult =
    document.getElementById("savingsResult");


  if (savingsCalculateButton) {

    savingsCalculateButton.addEventListener(
      "click",
      function () {

        const current =
          Number(
            document.getElementById("currentSavings").value
          ) || 0;


        const goal =
          Number(
            document.getElementById("savingsGoal").value
          ) || 0;


        const monthly =
          Number(
            document.getElementById("monthlySaving").value
          ) || 0;


        // Validation

        if (goal <= 0) {

          showSavingsResult(`

            <h2 class="warning">
              Enter a savings goal
            </h2>

            <p>
              Tell us how much you'd like to save.
            </p>

          `);

          return;
        }


        if (current >= goal) {

          showSavingsResult(`

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
              <strong>£${current.toFixed(2)}</strong>
              and your target is
              <strong>£${goal.toFixed(2)}</strong>.
            </p>


            <div class="stat">

              <span>
                Goal
              </span>

              <strong>
                £${goal.toFixed(2)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Current savings
              </span>

              <strong>
                £${current.toFixed(2)}
              </strong>

            </div>


            <p class="good">
              ✓ You're there. Nice work.
            </p>

          `);

          return;
        }


        if (monthly <= 0) {

          const remaining =
            goal - current;


          showSavingsResult(`

            <h2 class="warning">
              Enter a monthly saving amount
            </h2>


            <p>
              You have
              <strong>
                £${remaining.toFixed(2)}
              </strong>
              left to reach your goal.
            </p>


            <p>
              Enter how much you can realistically
              save each month and we'll calculate
              how long it could take.
            </p>

          `);

          return;
        }


        // Calculations

        const remaining =
          goal - current;


        const months =
          Math.ceil(remaining / monthly);


        // =====================================================
        // SAVING MORE COMPARISON
        // =====================================================

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


        // Target date

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


        // Advice

        let advice;


        if (months <= 3) {

          advice = `
            That's a relatively short-term goal.
            Staying consistent should put you on
            track to reach it soon.
          `;

        }

        else if (months <= 12) {

          advice = `
            This is a realistic medium-term goal.
            Consistency is the key. Consider setting
            the money aside automatically after payday.
          `;

        }

        else if (months <= 24) {

          advice = `
            This is a longer-term goal.

            An automatic transfer after payday can
            make saving easier because the money is
            moved before you're tempted to spend it.
          `;

        }

        else {

          advice = `
            This is a substantial goal.

            Breaking it into smaller milestones can
            make the target feel much more achievable.
          `;

        }


        // Result

        showSavingsResult(`

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
            At your current saving rate, you could
            reach your goal in approximately
            <strong>
              ${months}
              month${months === 1 ? "" : "s"}
            </strong>.
          </p>


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
              £${current.toFixed(2)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Savings goal
            </span>

            <strong>
              £${goal.toFixed(2)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Still needed
            </span>

            <strong>
              £${remaining.toFixed(2)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Monthly saving
            </span>

            <strong>
              £${monthly.toFixed(2)}
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
            🧠 MoneyCheck's advice
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
              <strong>
                ${progress.toFixed(0)}%
              </strong>
              of the way there.
            </p>

          </div>


          <div class="what-if-box">

            <h3>
              🚀 What if you saved more?
            </h3>

            <p class="what-if-intro">
              Small changes can make a surprisingly big
              difference.
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
                  ${monthsPlus50} months
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
            This calculator provides an estimate based
            on the numbers you entered. Actual results
            may vary.
          </p>

        `);

      });

  }


  // =====================================================
  // SAVINGS RESET
  // =====================================================

  if (savingsResetButton) {

    savingsResetButton.addEventListener(
      "click",
      function () {

        document
          .getElementById("currentSavings")
          .value = "";

        document
          .getElementById("savingsGoal")
          .value = "";

        document
          .getElementById("monthlySaving")
          .value = "";


        savingsResult.innerHTML = "";

        savingsResult.classList.add("hidden");

      }
    );

  }


  // =====================================================
  // RESULT HELPERS
  // =====================================================

  function showAffordabilityResult(html) {

    result.innerHTML = html;

    result.classList.remove("hidden");

    result.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  function showSavingsResult(html) {

    savingsResult.innerHTML = html;

    savingsResult.classList.remove("hidden");

    savingsResult.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  // =====================================================
  // DEBT PAYOFF CALCULATOR
  // =====================================================

  const debtCalculateButton =
    document.getElementById("debtCalculateButton");

  const debtResetButton =
    document.getElementById("debtResetButton");

  const debtResult =
    document.getElementById("debtResult");


  if (debtCalculateButton) {

    debtCalculateButton.addEventListener(
      "click",
      function () {

        const balance =
          Number(
            document.getElementById("debtBalance").value
          ) || 0;

        const annualRate =
          Number(
            document.getElementById("interestRate").value
          ) || 0;

        const payment =
          Number(
            document.getElementById("debtPayment").value
          ) || 0;


        if (balance <= 0) {

          showDebtResult(`

            <h2 class="warning">
              Enter your debt balance
            </h2>

            <p>
              Enter the amount you currently owe.
            </p>

          `);

          return;
        }


        if (payment <= 0) {

          showDebtResult(`

            <h2 class="warning">
              Enter your monthly payment
            </h2>

            <p>
              Tell us how much you can pay toward
              the debt each month.
            </p>

          `);

          return;
        }


        const monthlyRate =
          annualRate / 100 / 12;


        if (
          monthlyRate > 0 &&
          payment <= balance * monthlyRate
        ) {

          showDebtResult(`

            <h2 class="bad">
              This payment may not pay off the debt
            </h2>

            <p>
              At an APR of
              <strong>
                ${annualRate.toFixed(2)}%
              </strong>,
              your first month's interest is approximately
              <strong>
                £${(balance * monthlyRate).toFixed(2)}
              </strong>.
            </p>

            <div class="info-box">

              <strong>
                ⚠️ Important
              </strong>

              <p>
                Your monthly payment needs to be greater
                than the interest being added each month
                if you want the balance to decrease.
              </p>

            </div>

          `);

          return;
        }


        let remaining = balance;

        let totalInterest = 0;

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
            break;
          }


          totalInterest += interest;

          remaining -= principal;

          months++;

        }


        if (
          months >= maxMonths ||
          remaining > 0.01
        ) {

          showDebtResult(`

            <h2 class="warning">
              This debt may take a very long time
              to repay
            </h2>

            <p>
              Try increasing your monthly payment
              and calculate again.
            </p>

          `);

          return;
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
            You're on a relatively short payoff
            timeline. Staying consistent with your
            payments should keep you moving toward
            being debt-free.
          `;

        } else if (months <= 36) {

          advice = `
            You're making progress, but this debt
            will take a while to clear. If you can
            safely increase your payment, even a
            small amount could shorten the timeline.
          `;

        } else {

          advice = `
            This is a long payoff timeline. Focus
            on keeping the payment consistent and
            look for opportunities to increase it
            when your budget allows.
          `;

        }


        showDebtResult(`

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
            ${months} months
          </h2>


          <p>
            At your current payment of
            <strong>
              £${payment.toFixed(2)}
            </strong>
            per month, your estimated payoff date is
            <strong>
              ${payoffDateText}
            </strong>.
          </p>


          <div class="stat">

            <span>
              Starting debt
            </span>

            <strong>
              £${balance.toFixed(2)}
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
              £${payment.toFixed(2)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Estimated interest
            </span>

            <strong>
              £${totalInterest.toFixed(2)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Estimated total paid
            </span>

            <strong>
              £${totalPaid.toFixed(2)}
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
                  ${extra25} months
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
                  ${extra50} months
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
            🧠 MoneyCheck's advice
          </h3>


          <p>
            ${advice}
          </p>


          <p class="disclaimer">
            This calculator provides an estimate based
            on the information entered. Actual lender
            calculations may differ.
          </p>

        `);

      });

  }


  // =====================================================
  // DEBT RESET
  // =====================================================

  if (debtResetButton) {

    debtResetButton.addEventListener(
      "click",
      function () {

        document
          .getElementById("debtBalance")
          .value = "";

        document
          .getElementById("interestRate")
          .value = "";

        document
          .getElementById("debtPayment")
          .value = "";

        debtResult.innerHTML = "";

        debtResult.classList.add("hidden");

      });

  }


  // =====================================================
  // DEBT CALCULATION HELPER
  // =====================================================

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


    let remaining = balance;

    let months = 0;


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


  // =====================================================
  // DEBT RESULT HELPER
  // =====================================================

  function showDebtResult(html) {

    debtResult.innerHTML = html;

    debtResult.classList.remove("hidden");

    debtResult.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


});
