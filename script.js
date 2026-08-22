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

      // =====================================================
      // READ VALUES
      // =====================================================

      const incomeInput =
        document.getElementById("income");

      const rentInput =
        document.getElementById("rent");

      const billsInput =
        document.getElementById("bills");

      const foodInput =
        document.getElementById("food");

      const transportInput =
        document.getElementById("transport");

      const subscriptionsInput =
        document.getElementById("subscriptions");

      const debtInput =
        document.getElementById("debt");

      const savingsInput =
        document.getElementById("savings");

      const emergencyInput =
        document.getElementById("emergency");

      const purchaseInput =
        document.getElementById("purchase");

      const monthlyPaymentInput =
        document.getElementById("monthlyPayment");


      const income =
        Number(incomeInput.value) || 0;

      const rent =
        Number(rentInput.value) || 0;

      const bills =
        Number(billsInput.value) || 0;

      const food =
        Number(foodInput.value) || 0;

      const transport =
        Number(transportInput.value) || 0;

      const subscriptions =
        Number(subscriptionsInput.value) || 0;

      const debt =
        Number(debtInput.value) || 0;

      const savings =
        Number(savingsInput.value) || 0;

      const emergency =
        Number(emergencyInput.value) || 0;

      const purchase =
        Number(purchaseInput.value) || 0;

      const monthlyPayment =
        Number(monthlyPaymentInput.value) || 0;


      // =====================================================
      // WHICH FIELDS WERE ACTUALLY ENTERED?
      // =====================================================

      const hasRent =
        rentInput.value.trim() !== "";

      const hasBills =
        billsInput.value.trim() !== "";

      const hasFood =
        foodInput.value.trim() !== "";

      const hasTransport =
        transportInput.value.trim() !== "";

      const hasSubscriptions =
        subscriptionsInput.value.trim() !== "";

      const hasDebt =
        debtInput.value.trim() !== "";

      const hasSavings =
        savingsInput.value.trim() !== "";

      const hasEmergency =
        emergencyInput.value.trim() !== "";

      const hasFinance =
        monthlyPaymentInput.value.trim() !== &&
        monthlyPayment > 0;


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
      // MONTHLY EXPENSES
      //
      // IMPORTANT:
      // Blank fields are NOT treated as £0 confirmed
      // spending. They simply aren't included.
      // =====================================================

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


      // =====================================================
      // CURRENT MONTHLY MONEY AVAILABLE
      // =====================================================

      const disposableIncome =
        income - totalMonthlyExpenses;


      // =====================================================
      // EXPENSE RATIO
      // =====================================================

      const expensePercentage =
        income > 0
          ? (totalMonthlyExpenses / income) * 100
          : 0;


      // =====================================================
      // HOUSING RATIO
      // =====================================================

      const housingPercentage =
        hasRent && income > 0
          ? (rent / income) * 100
          : null;


      // =====================================================
      // PURCHASE IMPACT
      //
      // This is based on money genuinely left after the
      // expenses the user entered.
      // =====================================================

      const moneyAfterPurchase =
        disposableIncome - purchase;


      let purchasePercentage = null;


      if (disposableIncome > 0) {

        purchasePercentage =
          (purchase / disposableIncome) * 100;

      }


      // =====================================================
      // INFORMATION COMPLETENESS
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


      const completeExpenseInformation =
        missingExpenses.length === 0;


      // =====================================================
      // SAVINGS CHECK
      // =====================================================

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


      // =====================================================
      // FINANCE CHECK
      // =====================================================

      let moneyAfterFinance =
        null;

      let financePercentage =
        null;


      if (hasFinance) {

        moneyAfterFinance =
          disposableIncome - monthlyPayment;


        if (disposableIncome > 0) {

          financePercentage =
            (monthlyPayment / disposableIncome) * 100;

        }

      }


      // =====================================================
      // AFFORDABILITY ASSESSMENT
      //
      // Rather than using a strange arbitrary score,
      // we first establish the actual financial position.
      // =====================================================

      let score = 100;

      let title = "";

      let colour = "";

      let advice = "";


      // =====================================================
      // 1. EXPENSES ALREADY EXCEED INCOME
      // =====================================================

      if (disposableIncome < 0) {

        score = 5;

        title =
          "I wouldn't buy it right now";

        colour =
          "bad";

        advice = `
          Based on the expenses you've entered, your
          monthly spending is already higher than your
          take-home income.

          I'd focus on getting your monthly budget back
          into positive territory before taking on this
          purchase.
        `;

      }


      // =====================================================
      // 2. NOTHING LEFT AFTER EXPENSES
      // =====================================================

      else if (disposableIncome === 0) {

        score = 10;

        title =
          "I'd wait and plan for it";

        colour =
          "bad";

        advice = `
          The expenses you've entered currently use all
          of your monthly take-home income.

          That means there isn't any monthly money left
          to comfortably absorb this purchase.
        `;

      }


      // =====================================================
      // 3. PURCHASE DOESN'T FIT
      // =====================================================

      else if (moneyAfterPurchase < 0) {

        score = 20;

        title =
          "I'd wait and save for it";

        colour =
          "bad";

        advice = `
          You don't currently have enough money left after
          your entered monthly expenses to buy this outright.

          I'd consider saving towards the purchase rather
          than using debt simply to make it possible.
        `;

      }


      // =====================================================
      // 4. PURCHASE FITS BUT USES MOST AVAILABLE MONEY
      // =====================================================

      else {

        // ---------------------------------------------------
        // Purchase impact
        // ---------------------------------------------------

        if (purchasePercentage <= 10) {

          score -= 0;

        }

        else if (purchasePercentage <= 20) {

          score -= 5;

        }

        else if (purchasePercentage <= 30) {

          score -= 10;

        }

        else if (purchasePercentage <= 40) {

          score -= 18;

        }

        else if (purchasePercentage <= 50) {

          score -= 28;

        }

        else if (purchasePercentage <= 65) {

          score -= 40;

        }

        else if (purchasePercentage <= 80) {

          score -= 52;

        }

        else if (purchasePercentage <= 100) {

          score -= 65;

        }

        else {

          score -= 80;

        }


        // ---------------------------------------------------
        // Monthly breathing room
        // ---------------------------------------------------

        const remainingPercentage =
          (disposableIncome / income) * 100;


        if (remainingPercentage < 10) {

          score -= 20;

        }

        else if (remainingPercentage < 15) {

          score -= 12;

        }

        else if (remainingPercentage < 20) {

          score -= 7;

        }

        else if (remainingPercentage < 30) {

          score -= 3;

        }


        // ---------------------------------------------------
        // Savings
        // ---------------------------------------------------

        if (hasSavings && savings > 0) {

          const purchaseToSavings =
            (purchase / savings) * 100;


          if (purchaseToSavings > 100) {

            score -= 8;

          }

          else if (purchaseToSavings > 75) {

            score -= 5;

          }

          else if (purchaseToSavings > 50) {

            score -= 3;

          }

          else if (purchaseToSavings > 25) {

            score -= 1;

          }

        }


        // ---------------------------------------------------
        // Emergency fund
        // ---------------------------------------------------

        if (emergencyFundBroken) {

          score -= 10;

        }


        // ---------------------------------------------------
        // Finance
        // ---------------------------------------------------

        if (
          hasFinance &&
          disposableIncome > 0
        ) {

          if (moneyAfterFinance <= 0) {

            score -= 25;

          }

          else if (financePercentage > 30) {

            score -= 18;

          }

          else if (financePercentage > 20) {

            score -= 10;

          }

          else if (financePercentage > 10) {

            score -= 4;

          }

        }


        // ---------------------------------------------------
        // Final score
        // ---------------------------------------------------

        score =
          Math.max(
            5,
            Math.min(
              100,
              Math.round(score)
            )
          );


        // ---------------------------------------------------
        // Result wording
        // ---------------------------------------------------

        if (emergencyFundBroken) {

          title =
            "I'd be cautious";

          colour =
            "warning";

          advice = `
            You appear able to cover the purchase from
            your monthly budget, but paying for it from
            savings would take your savings below the
            emergency-fund target you've entered.

            Unless the purchase is necessary, I'd consider
            waiting until that buffer is stronger.
          `;

        }

        else if (
          hasFinance &&
          moneyAfterFinance <= 0
        ) {

          title =
            "I'd avoid the finance";

          colour =
            "bad";

          advice = `
            The purchase may fit when looking only at the
            purchase price, but the proposed finance payment
            would use essentially all of your currently
            available monthly money.

            I'd avoid taking on that payment unless your
            budget changes significantly.
          `;

          score =
            Math.min(score, 35);

        }

        else if (score >= 85) {

          title =
            "Looks comfortably affordable";

          colour =
            "good";

          advice = `
            Based on the information you've entered, this
            purchase looks comfortably manageable.

            It uses a relatively small share of the money
            you have left after your listed monthly expenses,
            leaving you with useful breathing room afterwards.
          `;

        }

        else if (score >= 70) {

          title =
            "Probably manageable";

          colour =
            "good";

          advice = `
            You appear to have enough room in your budget
            for this purchase.

            It should be manageable based on the numbers
            you've provided, although I'd still keep some
            money aside for unexpected costs.
          `;

        }

        else if (score >= 50) {

          title =
            "I'd think twice";

          colour =
            "warning";

          advice = `
            You can currently fit the purchase into the
            budget you've provided, but it would use a
            noticeable amount of your available money.

            I'd check for upcoming bills or unexpected costs
            before going ahead.
          `;

        }

        else {

          title =
            "I'd be cautious";

          colour =
            "bad";

          advice = `
            Although the purchase technically fits into the
            numbers you've entered, it would leave you with
            relatively little breathing room.

            I'd consider waiting, saving more first, or
            choosing a cheaper option.
          `;

        }

      }


      // =====================================================
      // BUDGET ADVICE
      // =====================================================

      let budgetAdvice = "";


      if (expenseCount === 0) {

        budgetAdvice = `
          <p class="warning">

            ⚠️ You haven't entered any monthly expenses.

            The result is therefore based almost entirely
            on your income and purchase price.

            Add your regular costs for a more realistic
            assessment.

          </p>
        `;

      }

      else if (expensePercentage >= 90) {

        budgetAdvice = `
          <p class="warning">

            Your entered expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            That leaves relatively little breathing room
            before this purchase is considered.

          </p>
        `;

      }

      else if (expensePercentage >= 75) {

        budgetAdvice = `
          <p class="warning">

            Your entered expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            You have money left, but it would be sensible
            not to treat all of it as completely spare.

          </p>
        `;

      }

      else {

        budgetAdvice = `
          <p class="good">

            ✓ Your entered expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            That leaves approximately
            <strong>
              £${disposableIncome.toFixed(2)}
            </strong>
            based on the expenses you've provided.

          </p>
        `;

      }


      // =====================================================
      // HOUSING ADVICE
      // =====================================================

      let housingAdvice = "";


      if (!hasRent) {

        housingAdvice = `
          <p>
            Housing costs haven't been included because
            you left the rent field blank.
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

            That's a significant housing cost, so keeping
            enough room for other spending is particularly
            important.

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

            Housing takes a meaningful share of your income,
            so keeping some room elsewhere in your budget
            is useful.

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
          <p>

            Savings haven't been included because you left
            that field blank.

            For a larger purchase, it's worth checking that
            you would still have a reasonable cash buffer
            afterwards.

          </p>
        `;

      }

      else if (savingsInsufficient) {

        savingsAdvice = `
          <p class="warning">

            Your current savings wouldn't fully cover this
            purchase.

            That's not necessarily a problem if you're paying
            from your monthly budget, but I'd avoid emptying
            your savings just to make the purchase.

          </p>
        `;

      }

      else if (emergencyFundBroken) {

        savingsAdvice = `
          <p class="warning">

            You could pay for the purchase from savings,
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
            without falling below your emergency-fund target.

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
              essentially all of the money you've currently
              got left each month.

              I wouldn't consider that comfortable.

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

        else if (financePercentage > 10) {

          financeAdvice = `
            <p class="warning">

              The proposed finance payment would use
              about
              <strong>
                ${financePercentage.toFixed(0)}%
              </strong>
              of your current disposable income.

              Make sure that payment still feels comfortable
              after allowing for unexpected costs.

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
      // DATA COMPLETENESS MESSAGE
      // =====================================================

      let dataMessage = "";


      if (missingExpenses.length > 0) {

        dataMessage = `
          <div class="info-box">

            <strong>
              ℹ️ Based on the information you've entered
            </strong>

            <p>
              The calculator has only used the expenses
              you provided. Blank fields have not been
              assumed to be £0 spending.
            </p>

            <p>
              You left these expense categories blank:
            </p>

            <p>
              <strong>
                ${missingExpenses.join(", ")}
              </strong>
            </p>

            <p>
              If you have costs in these areas, adding them
              could change the result.
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
              Your calculation includes rent, bills, food,
              transport, subscriptions and debt payments.
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

            ⚠️ Based on the expenses you've entered,
            buying this outright would leave you
            approximately
            <strong>
              £${Math.abs(moneyAfterPurchase).toFixed(2)}
            </strong>
            short this month.

          </p>
        `;

      }

      else {

        purchaseAdvice = `
          <p>

            After your entered expenses and this purchase,
            you'd have approximately
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
            Expenses entered
          </span>

          <strong>
            ${expenseCount}
          </strong>

        </div>


        <div class="stat">

          <span>
            Total entered monthly expenses
          </span>

          <strong>
            £${totalMonthlyExpenses.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left after entered expenses
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
            Purchase vs available money
          </span>

          <strong>
            ${
              purchasePercentage !== null
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
          the information entered. Blank expense fields
          are not included in the calculation.

          It is not financial advice. Real affordability
          can also depend on irregular expenses, upcoming
          commitments, interest, taxes and individual
          circumstances.

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

        }

        else if (months <= 36) {

          advice = `
            You're making progress, but this debt
            will take a while to clear. If you can
            safely increase your payment, even a
            small amount could shorten the timeline.
          `;

        }

        else {

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
