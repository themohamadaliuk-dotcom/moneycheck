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
      // READ INPUTS
      // =====================================================

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
      // CHECK WHICH INFORMATION HAS BEEN ENTERED
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
      // CORE PERCENTAGES
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


      const purchaseIncomePercentage =
        income > 0
          ? (purchase / income) * 100
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
      // SAVINGS / EMERGENCY FUND ANALYSIS
      // =====================================================

      let savingsAfterPurchase = null;

      let savingsInsufficient = false;

      let emergencyFundBroken = false;

      let emergencyFundMonths = null;


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


        /*
         * If the user has entered an emergency-fund target,
         * estimate how many months of that target their
         * remaining savings would represent.
         */
        if (emergency > 0) {

          emergencyFundMonths =
            savingsAfterPurchase / emergency;

        }

      }


      // =====================================================
      // NEW AFFORDABILITY ASSESSMENT
      //
      // Rather than relying entirely on a score, MoneyCheck
      // identifies the strongest financial signals and uses
      // those signals to shape the recommendation.
      // =====================================================

      let deductions = 0;


      // -----------------------------------------------------
      // CASHFLOW PRESSURE
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
      // SITUATION FLAGS
      //
      // These flags are what make the advice more personal.
      // =====================================================

      const cashflowTight =
        disposableIncome > 0 &&
        disposableIncome < income * 0.10;


      const cashflowComfortable =
        disposableIncome >= income * 0.30;


      const expensesVeryHigh =
        expensePercentage >= 90;


      const expensesHigh =
        expensePercentage >= 75 &&
        expensePercentage < 90;


      const purchaseVeryLarge =
        disposableIncome > 0 &&
        purchasePercentage > 75;


      const purchaseLarge =
        disposableIncome > 0 &&
        purchasePercentage > 50 &&
        purchasePercentage <= 75;


      const purchaseMeaningful =
        disposableIncome > 0 &&
        purchasePercentage > 25 &&
        purchasePercentage <= 50;


      const housingHigh =
        housingPercentage > 35;


      const housingVeryHigh =
        housingPercentage > 50;


      const financeHeavy =
        hasFinance &&
        disposableIncome > 0 &&
        financePercentage > 20;


      const financeVeryHeavy =
        hasFinance &&
        disposableIncome > 0 &&
        financePercentage > 30;


      // =====================================================
      // MAIN RESULT
      // =====================================================

      let title;

      let colour;

      let advice;


      // =====================================================
      // PRIORITY 1 — NEGATIVE CASHFLOW
      // =====================================================

      if (disposableIncome <= 0) {

        title =
          "I wouldn't buy it right now";

        colour =
          "bad";

        advice = `
          Your normal monthly expenses are currently using
          all of your take-home income or more.

          That means there isn't a reliable amount left over
          for this purchase without creating additional
          financial pressure.

          <strong>
            I'd deal with the monthly cash-flow problem first,
            then come back to the purchase.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 2 — PURCHASE DOESN'T FIT THIS MONTH
      // =====================================================

      else if (moneyAfterPurchase < 0) {

        title =
          "I'd save for it first";

        colour =
          "bad";

        advice = `
          Your normal monthly costs leave you with
          <strong>
            £${disposableIncome.toFixed(2)}
          </strong>,
          but the purchase costs
          <strong>
            £${purchase.toFixed(2)}
          </strong>.

          You'd therefore be approximately
          <strong>
            £${Math.abs(moneyAfterPurchase).toFixed(2)}
          </strong>
          short after paying your usual expenses.

          <strong>
            I'd save toward the purchase rather than
            stretching your budget or relying on credit.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 3 — EMERGENCY FUND WOULD BE BROKEN
      // =====================================================

      else if (emergencyFundBroken) {

        title =
          "Your budget can handle it, but I'd protect your buffer";

        colour =
          "warning";

        advice = `
          Your monthly cash flow can technically handle the
          purchase, but there's another issue I'd pay attention
          to.

          Paying for it from your savings would leave you below
          the emergency-fund target you entered.

          <strong>
            I'd wait if the purchase isn't necessary and keep
            that emergency buffer intact.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 4 — SAVINGS WOULD BE EXHAUSTED
      // =====================================================

      else if (savingsInsufficient) {

        title =
          "I'd think twice before using your savings";

        colour =
          "warning";

        advice = `
          Your monthly budget appears able to absorb the
          purchase, but your current savings aren't large
          enough to cover it outright.

          That means the purchase could leave you dependent
          on future income or credit if something unexpected
          happens.

          <strong>
            I'd build the cash buffer first unless the purchase
            is genuinely necessary.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 5 — VERY TIGHT CASHFLOW
      // =====================================================

      else if (cashflowTight) {

        title =
          "I'd wait and give yourself more breathing room";

        colour =
          "warning";

        advice = `
          You technically have enough money left after your
          normal expenses, but your monthly breathing room is
          quite small.

          After this purchase you'd have approximately
          <strong>
            £${moneyAfterPurchase.toFixed(2)}
          </strong>
          left.

          That's not much room for an unexpected bill,
          irregular expense or change in circumstances.

          <strong>
            I'd prefer to see a larger buffer before making
            the purchase.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 6 — HEAVY FINANCE COMMITMENT
      // =====================================================

      else if (financeVeryHeavy) {

        title =
          "I'd be very cautious with the finance option";

        colour =
          "warning";

        advice = `
          The purchase itself may fit within your current
          monthly budget, but the proposed finance payment
          would consume about
          <strong>
            ${financePercentage.toFixed(0)}%
          </strong>
          of your disposable income.

          That's a substantial ongoing commitment.

          <strong>
            I'd avoid taking on that payment unless you have
            plenty of room for unexpected costs as well.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 7 — HIGH EXPENSE BURDEN
      // =====================================================

      else if (expensesVeryHigh) {

        title =
          "I'd be cautious";

        colour =
          "warning";

        advice = `
          The purchase is possible based on the numbers
          you've entered, but your normal monthly expenses
          already use about
          <strong>
            ${expensePercentage.toFixed(0)}%
          </strong>
          of your income.

          That leaves relatively little flexibility.

          <strong>
            I'd treat your remaining money as a buffer rather
            than assuming it's all available to spend.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 8 — LARGE PURCHASE
      // =====================================================

      else if (purchaseVeryLarge) {

        title =
          "It's possible, but this is a big purchase for your budget";

        colour =
          "warning";

        advice = `
          You can cover the purchase from this month's
          disposable income, but it would use about
          <strong>
            ${purchasePercentage.toFixed(0)}%
          </strong>
          of the money you normally have left after expenses.

          That's a substantial amount of your available
          breathing room.

          <strong>
            I'd consider saving for it over a few months
            rather than using such a large portion of your
            available cash at once.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 9 — MEANINGFUL PURCHASE
      // =====================================================

      else if (purchaseLarge) {

        title =
          "Probably manageable, but don't rush it";

        colour =
          "good";

        advice = `
          You appear able to afford the purchase from your
          current monthly cash flow.

          However, it would use about
          <strong>
            ${purchasePercentage.toFixed(0)}%
          </strong>
          of your disposable income, so it isn't a trivial
          purchase relative to your budget.

          <strong>
            If you can make the purchase while keeping a
            comfortable cash buffer, it looks reasonable.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 10 — STRONG POSITION
      // =====================================================

      else if (
        score >= 80 &&
        cashflowComfortable &&
        !housingVeryHigh &&
        !financeHeavy
      ) {

        title =
          "Looks comfortably affordable";

        colour =
          "good";

        advice = `
          Your numbers show a relatively healthy position.

          After your listed monthly expenses, you have
          approximately
          <strong>
            £${disposableIncome.toFixed(2)}
          </strong>
          left, and this purchase would use only about
          <strong>
            ${purchasePercentage.toFixed(0)}%
          </strong>
          of that amount.

          <strong>
            Based on the information you've entered, this
            looks like a purchase your budget can comfortably
            absorb.
          </strong>
        `;

      }


      // =====================================================
      // PRIORITY 11 — DEFAULT
      // =====================================================

      else if (score >= 65) {

        title =
          "Probably manageable";

        colour =
          "good";

        advice = `
          Your current budget appears able to handle the
          purchase.

          You'd have approximately
          <strong>
            £${moneyAfterPurchase.toFixed(2)}
          </strong>
          left after your listed expenses and the purchase.

          <strong>
            I'd just make sure that remaining money isn't
            already needed for upcoming or irregular costs.
          </strong>
        `;

      }


      else {

        title =
          "I'd wait and plan for it";

        colour =
          "warning";

        advice = `
          The purchase isn't necessarily impossible, but the
          numbers suggest it would put more pressure on your
          budget than I'd be comfortable with.

          <strong>
            I'd consider waiting, saving more first, or
            choosing a cheaper option.
          </strong>
        `;

      }


      // =====================================================
      // BUDGET ADVICE
      // =====================================================

      let budgetAdvice = "";


      if (expensesVeryHigh) {

        budgetAdvice = `
          <p class="warning">
            ⚠️ Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            That leaves approximately
            <strong>
              £${disposableIncome.toFixed(2)}
            </strong>
            before this purchase.

            Your remaining money is therefore an important
            safety buffer, not necessarily spare spending
            money.
          </p>
        `;

      }

      else if (expensesHigh) {

        budgetAdvice = `
          <p class="warning">
            Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            You have some breathing room, but I'd avoid
            treating all of it as disposable spending money.
          </p>
        `;

      }

      else if (cashflowComfortable) {

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
            before this purchase.
          </p>
        `;

      }

      else {

        budgetAdvice = `
          <p>
            Your listed expenses use about
            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>
            of your monthly income.

            That leaves approximately
            <strong>
              £${disposableIncome.toFixed(2)}
            </strong>
            before this purchase.
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

            Because housing is often one of the largest
            monthly expenses, this makes the affordability
            result less reliable.

            <strong>
              Add it before relying heavily on this result.
            </strong>
          </p>
        `;

      }

      else if (housingVeryHigh) {

        housingAdvice = `
          <p class="warning">
            Your rent is about
            <strong>
              ${housingPercentage.toFixed(0)}%
            </strong>
            of your take-home income.

            That's a very large housing commitment.

            <strong>
              I'd be particularly careful about adding
              another significant monthly commitment.
            </strong>
          </p>
        `;

      }

      else if (housingHigh) {

        housingAdvice = `
          <p class="warning">
            Your rent is about
            <strong>
              ${housingPercentage.toFixed(0)}%
            </strong>
            of your take-home income.

            Housing is taking a meaningful share of your
            income, so keeping the rest of your spending
            flexible is particularly important.
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

            Housing doesn't appear to be creating an
            unusually high share of your monthly income
            based on the information entered.
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

            That means MoneyCheck can't tell whether this
            purchase would leave you with a comfortable
            cash buffer.

            <strong>
              For a significant purchase, I'd check your
              savings position before going ahead.
            </strong>
          </p>
        `;

      }

      else if (savingsInsufficient) {

        savingsAdvice = `
          <p class="bad">
            ⚠️ Your current savings wouldn't fully cover
            this purchase.

            Your monthly income may be able to handle it,
            but you don't currently have enough saved to
            pay for it outright.

            <strong>
              Saving first would give you more financial
              resilience.
            </strong>
          </p>
        `;

      }

      else if (emergencyFundBroken) {

        savingsAdvice = `
          <p class="warning">
            ⚠️ Your savings can cover the purchase, but
            doing so would take you below your emergency
            fund target.

            <strong>
              I'd protect that emergency buffer unless
              the purchase is genuinely necessary.
            </strong>
          </p>
        `;

      }

      else if (hasEmergency && emergency > 0) {

        savingsAdvice = `
          <p class="good">
            ✓ Your savings could cover the purchase while
            keeping the emergency-fund target you've
            entered intact.

            After the purchase you'd have approximately
            <strong>
              £${savingsAfterPurchase.toFixed(2)}
            </strong>
            in savings.
          </p>
        `;

      }

      else {

        savingsAdvice = `
          <p class="good">
            ✓ Your entered savings could cover the purchase
            without your savings becoming negative.

            I'd still keep a separate emergency buffer
            rather than treating all savings as available
            spending money.
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

              <strong>
                I would not consider that a comfortable
                level of affordability.
              </strong>
            </p>
          `;

        }

        else if (financeVeryHeavy) {

          financeAdvice = `
            <p class="warning">
              ⚠️ The proposed finance payment would use
              about
              <strong>
                ${financePercentage.toFixed(0)}%
              </strong>
              of your current disposable income.

              That's a significant ongoing commitment.

              <strong>
                Remember that a finance payment doesn't
                just affect this month — it reduces your
                flexibility in future months too.
              </strong>
            </p>
          `;

        }

        else if (financeHeavy) {

          financeAdvice = `
            <p class="warning">
              ⚠️ The proposed finance payment would use
              about
              <strong>
                ${financePercentage.toFixed(0)}%
              </strong>
              of your current disposable income.

              That's a meaningful monthly commitment,
              so I'd make sure you could still handle
              unexpected expenses comfortably.
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

              Based on the figures entered, the payment
              doesn't appear to consume an unusually large
              share of your available monthly cash flow.
            </p>
          `;

        }

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

            I'd save toward the purchase rather than
            stretching your budget.
          </p>
        `;

      }

      else if (purchaseVeryLarge) {

        purchaseAdvice = `
          <p class="warning">
            This purchase would use about
            <strong>
              ${purchasePercentage.toFixed(0)}%
            </strong>
            of the money you normally have left after
            your monthly expenses.

            That's a large hit to your available cash flow.

            After buying it, you'd have approximately
            <strong>
              £${moneyAfterPurchase.toFixed(2)}
            </strong>
            left.
          </p>
        `;

      }

      else if (purchaseMeaningful || purchaseLarge) {

        purchaseAdvice = `
          <p>
            This purchase would use about
            <strong>
              ${purchasePercentage.toFixed(0)}%
            </strong>
            of your disposable monthly income.

            After buying it, you'd have approximately
            <strong>
              £${moneyAfterPurchase.toFixed(2)}
            </strong>
            left.
          </p>
        `;

      }

      else {

        purchaseAdvice = `
          <p class="good">
            ✓ The purchase represents about
            <strong>
              ${purchasePercentage.toFixed(0)}%
            </strong>
            of your disposable monthly income.

            You'd have approximately
            <strong>
              £${moneyAfterPurchase.toFixed(2)}
            </strong>
            left after the purchase and your listed
            monthly expenses.
          </p>
        `;

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
              ⚠️ This result is based on incomplete
              expense information
            </strong>

            <p>
              The calculator has included every expense
              you've entered, but these categories are
              still blank:
            </p>

            <p>
              <strong>
                ${missingExpenseText}
              </strong>
            </p>

            <p>
              A blank category is not automatically assumed
              to mean you spend nothing on it.

              <strong>
                Add those costs for a more reliable
                affordability assessment.
              </strong>
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
      // PERSONAL CONTEXT MESSAGE
      // =====================================================

      let contextAdvice = "";


      if (
        hasSavings &&
        hasEmergency &&
        !emergencyFundBroken &&
        savingsAfterPurchase >= emergency &&
        moneyAfterPurchase >= 0
      ) {

        contextAdvice = `
          <div class="info-box good-box">

            <strong>
              🛡️ Your safety buffer matters
            </strong>

            <p>
              After the purchase, your entered savings would
              still be above your emergency-fund target.

              That's an important positive because the
              purchase isn't relying entirely on your next
              month's income to keep you financially secure.
            </p>

          </div>
        `;

      }

      else if (
        hasSavings &&
        hasEmergency &&
        emergencyFundBroken
      ) {

        contextAdvice = `
          <div class="info-box">

            <strong>
              🛡️ The main concern is your safety buffer
            </strong>

            <p>
              Your monthly cash flow may technically support
              the purchase, but using your savings would
              reduce your emergency cushion below the level
              you've chosen.

              That's why MoneyCheck is being more cautious
              about the purchase.
            </p>

          </div>
        `;

      }

      else if (
        !hasSavings &&
        purchasePercentage > 25
      ) {

        contextAdvice = `
          <div class="info-box">

            <strong>
              💡 The missing piece is your cash buffer
            </strong>

            <p>
              The monthly budget tells us you can potentially
              make the purchase, but we don't know how much
              money you'd have available if an unexpected
              expense appeared.

              That's particularly important because this
              purchase represents a meaningful share of your
              disposable income.
            </p>

          </div>
        `;

      }

      else if (
        hasFinance &&
        financePercentage > 20
      ) {

        contextAdvice = `
          <div class="info-box">

            <strong>
              🔄 The ongoing commitment matters
            </strong>

            <p>
              The purchase may fit today, but the finance
              payment would continue reducing your monthly
              flexibility.

              That's why the finance option deserves more
              caution than simply comparing the purchase
              price with your current savings.
            </p>

          </div>
        `;

      }


      // =====================================================
      // NEXT STEP / RECOMMENDATION
      // =====================================================

      let nextStep = "";


      if (disposableIncome <= 0) {

        nextStep = `
          <div class="info-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              Focus first on creating some positive monthly
              cash flow.

              Once your normal expenses are comfortably below
              your income, run the purchase through MoneyCheck
              again.
            </p>

          </div>
        `;

      }

      else if (moneyAfterPurchase < 0) {

        const amountToSave =
          Math.abs(moneyAfterPurchase);


        nextStep = `
          <div class="info-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              You'd need roughly
              <strong>
                £${amountToSave.toFixed(2)}
              </strong>
              more available money to cover the purchase
              without going into negative monthly cash flow.

              Saving that amount first would give you a
              cleaner starting point.
            </p>

          </div>
        `;

      }

      else if (emergencyFundBroken) {

        const emergencyShortfall =
          emergency - savingsAfterPurchase;


        nextStep = `
          <div class="info-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              If you want to make the purchase without
              breaking your emergency-fund target, you'd
              ideally want about
              <strong>
                £${Math.max(emergencyShortfall, 0).toFixed(2)}
              </strong>
              more in savings first.
            </p>

          </div>
        `;

      }

      else if (purchaseVeryLarge) {

        nextStep = `
          <div class="info-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              If you don't need the purchase immediately,
              consider spreading the cost over a few months
              of saving.

              That would let you buy it without taking such
              a large bite out of one month's available
              money.
            </p>

          </div>
        `;

      }

      else if (cashflowComfortable) {

        nextStep = `
          <div class="info-box good-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              If the purchase is planned and your upcoming
              expenses are already covered, your numbers
              suggest you have reasonable room for it.

              I'd still keep your emergency savings separate
              from money you intend to spend.
            </p>

          </div>
        `;

      }

      else {

        nextStep = `
          <div class="info-box">

            <strong>
              👉 What I'd do next
            </strong>

            <p>
              Before buying, check your next few weeks of
              expected spending and make sure no large
              irregular bills are about to arrive.

              If everything is covered, the purchase looks
              more manageable.
            </p>

          </div>
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
            Purchase vs monthly income
          </span>

          <strong>
            ${purchaseIncomePercentage.toFixed(1)}%
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


        ${contextAdvice}


        ${nextStep}


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
