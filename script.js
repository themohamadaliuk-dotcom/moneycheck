
calculateButton.addEventListener("click", function () {

      // =====================================================
      // READ INPUTS
      // =====================================================

const income =
Number(document.getElementById("income").value) || 0;

@@ -53,7 +57,7 @@ document.addEventListener("DOMContentLoaded", function () {


// =====================================================
      // CHECK WHICH EXPENSES HAVE BEEN ENTERED
      // CHECK WHICH INFORMATION HAS BEEN ENTERED
// =====================================================

const hasRent =
@@ -180,7 +184,7 @@ document.addEventListener("DOMContentLoaded", function () {


// =====================================================
      // PERCENTAGES
      // CORE PERCENTAGES
// =====================================================

const housingPercentage =
@@ -201,6 +205,12 @@ document.addEventListener("DOMContentLoaded", function () {
: 100;


      const purchaseIncomePercentage =
        income > 0
          ? (purchase / income) * 100
          : 100;


// =====================================================
// MONEY LEFT AFTER PURCHASE
// =====================================================
@@ -224,7 +234,7 @@ document.addEventListener("DOMContentLoaded", function () {


// =====================================================
      // SAVINGS CHECK
      // SAVINGS / EMERGENCY FUND ANALYSIS
// =====================================================

let savingsAfterPurchase = null;
@@ -233,6 +243,8 @@ document.addEventListener("DOMContentLoaded", function () {

let emergencyFundBroken = false;

      let emergencyFundMonths = null;


if (hasSavings) {

@@ -256,29 +268,35 @@ document.addEventListener("DOMContentLoaded", function () {

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
      // AFFORDABILITY SCORE
      //
      // The score now considers:
      // NEW AFFORDABILITY ASSESSMENT
//
      // - disposable income
      // - total monthly expenses
      // - purchase size
      // - housing cost
      // - savings
      // - emergency fund
      // - finance payment
      // - missing expense information
      // Rather than relying entirely on a score, MoneyCheck
      // identifies the strongest financial signals and uses
      // those signals to shape the recommendation.
// =====================================================

let deductions = 0;


// -----------------------------------------------------
      // CASHFLOW
      // CASHFLOW PRESSURE
// -----------------------------------------------------

if (disposableIncome <= 0) {
@@ -456,10 +474,6 @@ document.addEventListener("DOMContentLoaded", function () {

// -----------------------------------------------------
// MISSING INFORMATION
      //
      // We still calculate using everything entered, but
      // reduce confidence in the score when categories
      // have been left blank.
// -----------------------------------------------------

deductions +=
@@ -480,6 +494,67 @@ document.addEventListener("DOMContentLoaded", function () {
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
@@ -491,9 +566,9 @@ document.addEventListener("DOMContentLoaded", function () {
let advice;


      // -----------------------------------------------------
      // NO DISPOSABLE MONEY
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 1 — NEGATIVE CASHFLOW
      // =====================================================

if (disposableIncome <= 0) {

@@ -504,23 +579,25 @@ document.addEventListener("DOMContentLoaded", function () {
"bad";

advice = `
          Your listed monthly expenses are using all of
          your take-home income or more.
          Your normal monthly expenses are currently using
          all of your take-home income or more.

          Based on the figures you've entered, this purchase
          isn't affordable without putting additional pressure
          on your finances.
          That means there isn't a reliable amount left over
          for this purchase without creating additional
          financial pressure.

          I'd focus on getting your monthly budget back into
          positive territory before making the purchase.
          <strong>
            I'd deal with the monthly cash-flow problem first,
            then come back to the purchase.
          </strong>
       `;

}


      // -----------------------------------------------------
      // PURCHASE IS LARGER THAN DISPOSABLE INCOME
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 2 — PURCHASE DOESN'T FIT THIS MONTH
      // =====================================================

else if (moneyAfterPurchase < 0) {

@@ -531,157 +608,342 @@ document.addEventListener("DOMContentLoaded", function () {
"bad";

advice = `
          The purchase is larger than your current monthly
          disposable income.
          Your normal monthly costs leave you with
          <strong>
            £${disposableIncome.toFixed(2)}
          </strong>,
          but the purchase costs
          <strong>
            £${purchase.toFixed(2)}
          </strong>.

          Buying it outright this month would leave your
          budget short after your normal monthly expenses.
          You'd therefore be approximately
          <strong>
            £${Math.abs(moneyAfterPurchase).toFixed(2)}
          </strong>
          short after paying your usual expenses.

          I'd save toward the purchase rather than putting
          pressure on your finances or relying on credit.
          <strong>
            I'd save toward the purchase rather than
            stretching your budget or relying on credit.
          </strong>
       `;

}


      // -----------------------------------------------------
      // EMERGENCY FUND WOULD BE USED
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 3 — EMERGENCY FUND WOULD BE BROKEN
      // =====================================================

else if (emergencyFundBroken) {

title =
          "I'd be cautious";
          "Your budget can handle it, but I'd protect your buffer";

colour =
"warning";

advice = `
          Your monthly budget may be able to handle the
          purchase, but buying it would take your savings
          below the emergency-fund target you've entered.
          Your monthly cash flow can technically handle the
          purchase, but there's another issue I'd pay attention
          to.

          Unless the purchase is necessary, I'd consider
          waiting until your emergency buffer is stronger.
          Paying for it from your savings would leave you below
          the emergency-fund target you entered.

          <strong>
            I'd wait if the purchase isn't necessary and keep
            that emergency buffer intact.
          </strong>
       `;

}


      // -----------------------------------------------------
      // SAVINGS DON'T COVER PURCHASE
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 4 — SAVINGS WOULD BE EXHAUSTED
      // =====================================================

else if (savingsInsufficient) {

title =
          "I'd think twice";
          "I'd think twice before using your savings";

colour =
"warning";

advice = `
          Your monthly budget has some room for the purchase,
          but your current savings wouldn't fully cover it.
          Your monthly budget appears able to absorb the
          purchase, but your current savings aren't large
          enough to cover it outright.

          That means the purchase could leave you dependent
          on future income or credit if something unexpected
          happens.

          I'd avoid leaving yourself without a cash buffer
          just to make the purchase.
          <strong>
            I'd build the cash buffer first unless the purchase
            is genuinely necessary.
          </strong>
       `;

}


      // -----------------------------------------------------
      // VERY STRONG POSITION
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 5 — VERY TIGHT CASHFLOW
      // =====================================================

      else if (score >= 80) {
      else if (cashflowTight) {

title =
          "Looks affordable";
          "I'd wait and give yourself more breathing room";

colour =
          "good";
          "warning";

advice = `
          Based on the income and expenses you've entered,
          you appear to have a healthy amount of money left
          after your normal monthly costs.
          You technically have enough money left after your
          normal expenses, but your monthly breathing room is
          quite small.

          The purchase is relatively manageable compared
          with your remaining monthly budget.
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


      // -----------------------------------------------------
      // REASONABLE BUT NOT TRIVIAL
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 6 — HEAVY FINANCE COMMITMENT
      // =====================================================

      else if (score >= 65) {
      else if (financeVeryHeavy) {

title =
          "Probably manageable";
          "I'd be very cautious with the finance option";

colour =
          "good";
          "warning";

advice = `
          You appear to have enough room in your monthly
          budget for this purchase, but it isn't insignificant
          compared with your available money.
          The purchase itself may fit within your current
          monthly budget, but the proposed finance payment
          would consume about
          <strong>
            ${financePercentage.toFixed(0)}%
          </strong>
          of your disposable income.

          That's a substantial ongoing commitment.

          I'd make sure you still have enough left for
          unexpected costs and other upcoming expenses.
          <strong>
            I'd avoid taking on that payment unless you have
            plenty of room for unexpected costs as well.
          </strong>
       `;

}


      // -----------------------------------------------------
      // BORDERLINE
      // -----------------------------------------------------
      // =====================================================
      // PRIORITY 7 — HIGH EXPENSE BURDEN
      // =====================================================

      else if (score >= 50) {
      else if (expensesVeryHigh) {

title =
          "I'd think twice";
          "I'd be cautious";

colour =
"warning";

advice = `
          The purchase appears possible, but it would take
          a meaningful amount of your available money.
          The purchase is possible based on the numbers
          you've entered, but your normal monthly expenses
          already use about
          <strong>
            ${expensePercentage.toFixed(0)}%
          </strong>
          of your income.

          That leaves relatively little flexibility.

          I'd consider waiting, saving more first, or looking
          for a cheaper option so the purchase doesn't put
          unnecessary pressure on your monthly budget.
          <strong>
            I'd treat your remaining money as a buffer rather
            than assuming it's all available to spend.
          </strong>
       `;

}


      // -----------------------------------------------------
      // LOW AFFORDABILITY
      // -----------------------------------------------------
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
          "bad";
          "warning";

advice = `
          Based on the numbers you've entered, this purchase
          would put a significant amount of pressure on your
          finances.
          The purchase isn't necessarily impossible, but the
          numbers suggest it would put more pressure on your
          budget than I'd be comfortable with.

          I'd wait and build up more available money before
          buying it.
          <strong>
            I'd consider waiting, saving more first, or
            choosing a cheaper option.
          </strong>
       `;

}
@@ -694,7 +956,7 @@ document.addEventListener("DOMContentLoaded", function () {
let budgetAdvice = "";


      if (expensePercentage >= 90) {
      if (expensesVeryHigh) {

budgetAdvice = `
         <p class="warning">
@@ -704,32 +966,38 @@ document.addEventListener("DOMContentLoaded", function () {
           </strong>
           of your monthly income.

            Your remaining budget is quite tight, so
            unexpected costs could make a noticeable
            difference.
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

      else if (expensePercentage >= 75) {
      else if (expensesHigh) {

budgetAdvice = `
         <p class="warning">
           Your listed expenses use about
           <strong>
             ${expensePercentage.toFixed(0)}%
           </strong>
            of your income.
            of your monthly income.

            You have some room left, but I wouldn't treat
            all of that remaining money as spare cash.
            You have some breathing room, but I'd avoid
            treating all of it as disposable spending money.
         </p>
       `;

}

      else {
      else if (cashflowComfortable) {

budgetAdvice = `
         <p class="good">
@@ -743,8 +1011,27 @@ document.addEventListener("DOMContentLoaded", function () {
           <strong>
             £${disposableIncome.toFixed(2)}
           </strong>
            before this purchase and any costs you haven't
            included.
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

@@ -764,15 +1051,19 @@ document.addEventListener("DOMContentLoaded", function () {
         <p class="warning">
           ⚠️ You haven't entered your housing cost.

            This makes the affordability result less
            reliable, so I'd add it before relying on
            the score.
            Because housing is often one of the largest
            monthly expenses, this makes the affordability
            result less reliable.

            <strong>
              Add it before relying heavily on this result.
            </strong>
         </p>
       `;

}

      else if (housingPercentage > 50) {
      else if (housingVeryHigh) {

housingAdvice = `
         <p class="warning">
@@ -782,18 +1073,21 @@ document.addEventListener("DOMContentLoaded", function () {
           </strong>
           of your take-home income.

            That's a very large housing commitment,
            so I'd be particularly careful about taking
            on additional spending.
            That's a very large housing commitment.

            <strong>
              I'd be particularly careful about adding
              another significant monthly commitment.
            </strong>
         </p>
       `;

}

      else if (housingPercentage > 35) {
      else if (housingHigh) {

housingAdvice = `
          <p>
          <p class="warning">
           Your rent is about
           <strong>
             ${housingPercentage.toFixed(0)}%
@@ -802,7 +1096,7 @@ document.addEventListener("DOMContentLoaded", function () {

           Housing is taking a meaningful share of your
           income, so keeping the rest of your spending
            under control is particularly important.
            flexible is particularly important.
         </p>
       `;

@@ -817,6 +1111,10 @@ document.addEventListener("DOMContentLoaded", function () {
             ${housingPercentage.toFixed(0)}%
           </strong>
           of your take-home income.

            Housing doesn't appear to be creating an
            unusually high share of your monthly income
            based on the information entered.
         </p>
       `;

@@ -836,9 +1134,14 @@ document.addEventListener("DOMContentLoaded", function () {
         <p class="warning">
           💡 You haven't entered your savings.

            For a significant purchase, I'd check that
            you still have a reasonable emergency buffer
            after buying it.
            That means MoneyCheck can't tell whether this
            purchase would leave you with a comfortable
            cash buffer.

            <strong>
              For a significant purchase, I'd check your
              savings position before going ahead.
            </strong>
         </p>
       `;

@@ -851,8 +1154,14 @@ document.addEventListener("DOMContentLoaded", function () {
           ⚠️ Your current savings wouldn't fully cover
           this purchase.

            I'd avoid using debt simply to make the purchase
            affordable if you can save for it instead.
            Your monthly income may be able to handle it,
            but you don't currently have enough saved to
            pay for it outright.

            <strong>
              Saving first would give you more financial
              resilience.
            </strong>
         </p>
       `;

@@ -862,29 +1171,54 @@ document.addEventListener("DOMContentLoaded", function () {

savingsAdvice = `
         <p class="warning">
            ⚠️ You could pay for the purchase from savings,
            but doing so would take your savings below your
            emergency-fund target.
            ⚠️ Your savings can cover the purchase, but
            doing so would take you below your emergency
            fund target.

            I'd consider rebuilding that buffer first.
            <strong>
              I'd protect that emergency buffer unless
              the purchase is genuinely necessary.
            </strong>
         </p>
       `;

}

      else {
      else if (hasEmergency && emergency > 0) {

savingsAdvice = `
         <p class="good">
            ✓ Your entered savings could cover the purchase
            while keeping your emergency-fund target intact.
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

      // =====================================================
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

@@ -901,14 +1235,16 @@ document.addEventListener("DOMContentLoaded", function () {
             essentially all of your current disposable
             income.

              I would not consider that a comfortable
              level of affordability.
              <strong>
                I would not consider that a comfortable
                level of affordability.
              </strong>
           </p>
         `;

}

        else if (financePercentage > 20) {
        else if (financeVeryHeavy) {

financeAdvice = `
           <p class="warning">
@@ -920,6 +1256,31 @@ document.addEventListener("DOMContentLoaded", function () {
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

@@ -935,6 +1296,10 @@ document.addEventListener("DOMContentLoaded", function () {
               ${financePercentage.toFixed(0)}%
             </strong>
             of your current disposable income.

              Based on the figures entered, the payment
              doesn't appear to consume an unusually large
              share of your available monthly cash flow.
           </p>
         `;

@@ -943,6 +1308,96 @@ document.addEventListener("DOMContentLoaded", function () {
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
@@ -960,14 +1415,14 @@ document.addEventListener("DOMContentLoaded", function () {
         <div class="info-box">

           <strong>
              ⚠️ Some expenses are missing
              ⚠️ This result is based on incomplete
              expense information
           </strong>

           <p>
             The calculator has included every expense
              you've entered.

              However, these categories are still blank:
              you've entered, but these categories are
              still blank:
           </p>

           <p>
@@ -977,8 +1432,13 @@ document.addEventListener("DOMContentLoaded", function () {
           </p>

           <p>
              Add those costs for a more complete
              affordability assessment.
              A blank category is not automatically assumed
              to mean you spend nothing on it.

              <strong>
                Add those costs for a more reliable
                affordability assessment.
              </strong>
           </p>

         </div>
@@ -1008,38 +1468,279 @@ document.addEventListener("DOMContentLoaded", function () {


// =====================================================
      // PURCHASE IMPACT
      // PERSONAL CONTEXT MESSAGE
// =====================================================

      let purchaseAdvice = "";
      let contextAdvice = "";


      if (moneyAfterPurchase < 0) {
      if (
        hasSavings &&
        hasEmergency &&
        !emergencyFundBroken &&
        savingsAfterPurchase >= emergency &&
        moneyAfterPurchase >= 0
      ) {

        contextAdvice = `
          <div class="info-box good-box">

        purchaseAdvice = `
          <p class="bad">
            ⚠️ After your normal monthly expenses, you would
            be approximately
           <strong>
              £${Math.abs(moneyAfterPurchase).toFixed(2)}
              🛡️ Your safety buffer matters
           </strong>
            short if you bought this outright this month.
          </p>

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

        purchaseAdvice = `
          <p>
            After your listed monthly expenses and this
            purchase, you'd have approximately
        nextStep = `
          <div class="info-box">

           <strong>
              £${moneyAfterPurchase.toFixed(2)}
              👉 What I'd do next
           </strong>
            left.
          </p>

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
@@ -1143,6 +1844,19 @@ document.addEventListener("DOMContentLoaded", function () {
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
@@ -1176,6 +1890,12 @@ document.addEventListener("DOMContentLoaded", function () {
       ${financeAdvice}


        ${contextAdvice}


        ${nextStep}


       ${dataMessage}

