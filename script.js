document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
     SHARED HELPERS
     ========================================================= */

  const money = function (value) {
    return "£" + Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };


  const getValue = function (id) {

    const element = document.getElementById(id);

    if (!element) {
      return 0;
    }

    const value = Number(element.value);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;

  };


  const hasValue = function (id) {

    const element = document.getElementById(id);

    return !!(
      element &&
      element.value.trim() !== ""
    );

  };


  const scrollToResult = function (element) {

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  };


  /* =========================================================
     AFFORDABILITY
     ========================================================= */

  const calculateButton =
    document.getElementById("calculateButton");

  const resetButton =
    document.getElementById("resetButton");

  const result =
    document.getElementById("result");


  if (calculateButton && result) {

    calculateButton.addEventListener("click", function () {

      const income = getValue("income");
      const rent = getValue("rent");
      const bills = getValue("bills");
      const food = getValue("food");
      const transport = getValue("transport");
      const subscriptions = getValue("subscriptions");
      const debt = getValue("debt");

      const savings = getValue("savings");
      const emergency = getValue("emergency");

      const purchase = getValue("purchase");
      const monthlyPayment = getValue("monthlyPayment");


      /* =====================================================
         VALIDATION
         ===================================================== */

      if (!hasValue("income") || income <= 0) {

        showAffordabilityResult(`
          <div class="result-status">
            <h2 class="bad">Enter your monthly income</h2>

            <p>
              We need your take-home income before we can
              assess whether the purchase fits your budget.
            </p>
          </div>
        `);

        return;
      }


      if (!hasValue("purchase") || purchase <= 0) {

        showAffordabilityResult(`
          <div class="result-status">
            <h2 class="warning">Enter the purchase price</h2>

            <p>
              Enter the amount you would actually pay for
              the purchase.
            </p>
          </div>
        `);

        return;
      }


      /* =====================================================
         ENTERED EXPENSES
         ===================================================== */

      const expenseFields = [
        ["rent", rent],
        ["bills", bills],
        ["food", food],
        ["transport", transport],
        ["subscriptions", subscriptions],
        ["debt", debt]
      ];


      let totalExpenses = 0;
      let expenseCount = 0;


      expenseFields.forEach(function (item) {

        const id = item[0];
        const value = item[1];

        if (hasValue(id)) {

          totalExpenses += value;
          expenseCount++;

        }

      });


      const disposable =
        income - totalExpenses;


      const moneyAfterPurchase =
        disposable - purchase;


      const expensePercentage =
        income > 0
          ? (totalExpenses / income) * 100
          : 0;


      const remainingPercentage =
        income > 0
          ? (disposable / income) * 100
          : 0;


      const purchasePercentage =
        disposable > 0
          ? (purchase / disposable) * 100
          : null;


      /* =====================================================
         SAVINGS
         ===================================================== */

      let savingsAfterPurchase = null;
      let savingsBelowEmergency = false;
      let savingsCannotCover = false;

      if (hasValue("savings")) {

        savingsAfterPurchase =
          savings - purchase;

        savingsCannotCover =
          savingsAfterPurchase < 0;

        if (
          hasValue("emergency") &&
          emergency > 0 &&
          savingsAfterPurchase < emergency
        ) {

          savingsBelowEmergency = true;

        }

      }


      /* =====================================================
         FINANCE
         ===================================================== */

      const hasFinance =
        hasValue("monthlyPayment") &&
        monthlyPayment > 0;


      const financeAfter =
        disposable - monthlyPayment;


      const financePercentage =
        disposable > 0
          ? (monthlyPayment / disposable) * 100
          : null;


      /* =====================================================
         COMPLETENESS
         ===================================================== */

      const mainExpenseIds = [
        "rent",
        "bills",
        "food",
        "transport",
        "subscriptions",
        "debt"
      ];


      const missingExpenses =
        mainExpenseIds.filter(function (id) {

          return !hasValue(id);

        });


      /* =====================================================
         DECISION ENGINE
         
         Rather than pretending affordability is an exact
         science, we use a hierarchy of real-world conditions.
         ===================================================== */

      let status;
      let title;
      let advice;
      let statusClass;


      /* -----------------------------------------------------
         1. ALREADY NEGATIVE
         ----------------------------------------------------- */

      if (disposable < 0) {

        status = "not comfortable";
        title = "I'd wait before buying this";
        statusClass = "bad";

        advice = `
          <p>
            The expenses you've entered are already
            approximately <strong>${money(Math.abs(disposable))}</strong>
            higher than your monthly take-home income.
          </p>

          <p>
            On these numbers, adding this purchase would
            increase the shortfall rather than leaving you
            with a comfortable monthly buffer.
          </p>
        `;

      }


      /* -----------------------------------------------------
         2. EXACTLY ZERO
         ----------------------------------------------------- */

      else if (disposable === 0) {

        status = "no monthly buffer";
        title = "I'd wait and plan for it";
        statusClass = "bad";

        advice = `
          <p>
            The expenses you've entered currently use
            essentially all of your monthly income.
          </p>

          <p>
            Even if the purchase itself is relatively small,
            your current budget doesn't show any spare
            monthly cash to absorb it comfortably.
          </p>
        `;

      }


      /* -----------------------------------------------------
         3. PURCHASE DOESN'T FIT
         ----------------------------------------------------- */

      else if (moneyAfterPurchase < 0) {

        status = "doesn't fit";
        title = "I'd save for it first";
        statusClass = "bad";

        advice = `
          <p>
            Buying this outright would leave you approximately
            <strong>${money(Math.abs(moneyAfterPurchase))}</strong>
            short based on the expenses you've entered.
          </p>

          <p>
            I'd avoid borrowing simply to make a purchase fit
            when the underlying monthly budget doesn't currently
            support it.
          </p>
        `;

      }


      /* -----------------------------------------------------
         4. VERY LARGE SHARE OF AVAILABLE CASH
         ----------------------------------------------------- */

      else if (purchasePercentage > 75) {

        status = "high impact";
        title = "I'd be very cautious";
        statusClass = "warning";

        advice = `
          <p>
            You can technically cover the purchase from this
            month's available money, but it would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of what you've got left after the expenses entered.
          </p>

          <p>
            That would leave approximately
            <strong>${money(moneyAfterPurchase)}</strong>.
            A large purchase can make unexpected costs much
            harder to absorb.
          </p>
        `;

      }


      /* -----------------------------------------------------
         5. 50–75%
         ----------------------------------------------------- */

      else if (purchasePercentage > 50) {

        status = "significant";
        title = "I'd think twice";
        statusClass = "warning";

        advice = `
          <p>
            The purchase fits your current monthly budget,
            but it would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of the money you've got left after the expenses
            entered.
          </p>

          <p>
            You'd have approximately
            <strong>${money(moneyAfterPurchase)}</strong>
            remaining. I'd make sure you don't have upcoming
            bills, annual costs or other commitments that
            aren't included here.
          </p>
        `;

      }


      /* -----------------------------------------------------
         6. 30–50%
         ----------------------------------------------------- */

      else if (purchasePercentage > 30) {

        status = "manageable with care";
        title = "Probably manageable";
        statusClass = "good";

        advice = `
          <p>
            The purchase appears to fit your current budget,
            although it would use a noticeable share of the
            money you've got available.
          </p>

          <p>
            After the purchase, you'd have approximately
            <strong>${money(moneyAfterPurchase)}</strong>
            left based on the expenses you've entered.
          </p>
        `;

      }


      /* -----------------------------------------------------
         7. 15–30%
         ----------------------------------------------------- */

      else if (purchasePercentage > 15) {

        status = "reasonable";
        title = "Looks reasonably affordable";
        statusClass = "good";

        advice = `
          <p>
            The purchase appears to fit comfortably within
            the money you've got left after the expenses
            you've entered.
          </p>

          <p>
            It would use about
            <strong>${purchasePercentage.toFixed(0)}%</strong>
            of that available amount, leaving approximately
            <strong>${money(moneyAfterPurchase)}</strong>.
          </p>
        `;

      }


      /* -----------------------------------------------------
         8. SMALL PURCHASE
         ----------------------------------------------------- */

      else {

        status = "low impact";
        title = "Looks affordable";
        statusClass = "good";

        advice = `
          <p>
            Based on the information you've entered, this
            purchase is relatively small compared with the
            money you have left after your regular expenses.
          </p>

          <p>
            You'd have approximately
            <strong>${money(moneyAfterPurchase)}</strong>
            left afterwards.
          </p>
        `;

      }


      /* =====================================================
         SAVINGS WARNING
         ===================================================== */

      let savingsAdvice = "";


      if (hasValue("savings")) {

        if (savingsCannotCover) {

          savingsAdvice = `
            <div class="info-box warning">

              <strong>
                Savings check
              </strong>

              <p>
                Your current savings of
                <strong>${money(savings)}</strong>
                wouldn't fully cover this purchase.
              </p>

              <p>
                That's not automatically a problem if you're
                paying from your monthly budget, but don't
                assume savings can act as a backup if they
                aren't actually available.
              </p>

            </div>
          `;

        }

        else if (savingsBelowEmergency) {

          savingsAdvice = `
            <div class="info-box warning">

              <strong>
                Your emergency buffer would be affected
              </strong>

              <p>
                Paying the full purchase from savings would
                leave approximately
                <strong>${money(savingsAfterPurchase)}</strong>,
                below your chosen emergency-fund target of
                <strong>${money(emergency)}</strong>.
              </p>

              <p>
                If the purchase isn't urgent, rebuilding that
                buffer first may give you more financial
                breathing room.
              </p>

            </div>
          `;

        }

        else {

          savingsAdvice = `
            <div class="info-box good-box">

              <strong>
                Savings check
              </strong>

              <p>
                If you chose to pay from savings, the purchase
                would leave approximately
                <strong>${money(savingsAfterPurchase)}</strong>
                in savings.
              </p>

            </div>
          `;

        }

      }
      else {

        savingsAdvice = `
          <div class="info-box">

            <strong>
              Savings weren't included
            </strong>

            <p>
              You left current savings blank, so this result
              doesn't assess whether the purchase would leave
              you with an adequate cash buffer.
            </p>

          </div>
        `;

      }


      /* =====================================================
         FINANCE WARNING
         ===================================================== */

      let financeAdvice = "";


      if (hasFinance) {

        if (disposable <= 0) {

          financeAdvice = `
            <div class="info-box warning">

              <strong>
                Finance needs extra caution
              </strong>

              <p>
                The monthly finance payment cannot comfortably
                be assessed because your entered expenses already
                leave no positive monthly surplus.
              </p>

            </div>
          `;

        }

        else if (financeAfter < 0) {

          financeAdvice = `
            <div class="info-box warning">

              <strong>
                The finance payment doesn't fit
              </strong>

              <p>
                A payment of
                <strong>${money(monthlyPayment)}</strong>
                would be greater than the money currently left
                after your entered expenses.
              </p>

              <p>
                That makes the proposed finance commitment
                uncomfortable on these numbers.
              </p>

            </div>
          `;

        }

        else if (financePercentage > 30) {

          financeAdvice = `
            <div class="info-box warning">

              <strong>
                Large ongoing commitment
              </strong>

              <p>
                The proposed finance payment would use about
                <strong>${financePercentage.toFixed(0)}%</strong>
                of your current disposable income.
              </p>

              <p>
                Remember that finance payments continue every
                month, so don't judge the purchase only by
                whether you can cover it this month.
              </p>

            </div>
          `;

        }

        else if (financePercentage > 15) {

          financeAdvice = `
            <div class="info-box">

              <strong>
                Check the ongoing payment
              </strong>

              <p>
                The proposed finance payment would use about
                <strong>${financePercentage.toFixed(0)}%</strong>
                of your current disposable income.
              </p>

              <p>
                Make sure the payment remains comfortable
                during more expensive months too.
              </p>

            </div>
          `;

        }

        else {

          financeAdvice = `
            <div class="info-box good-box">

              <strong>
                Finance payment looks manageable
              </strong>

              <p>
                The proposed payment would use about
                <strong>${financePercentage.toFixed(0)}%</strong>
                of your current disposable income.
              </p>

            </div>
          `;

        }

      }


      /* =====================================================
         BUDGET QUALITY
         ===================================================== */

      let budgetMessage = "";


      if (expenseCount === 0) {

        budgetMessage = `
          <div class="info-box warning">

            <strong>
              Your result is based on limited information
            </strong>

            <p>
              You haven't entered any regular monthly expenses.
              That means the calculator is effectively comparing
              your income with the purchase alone.
            </p>

            <p>
              Add your normal costs for a much more useful
              affordability assessment.
            </p>

          </div>
        `;

      }

      else if (missingExpenses.length > 0) {

        budgetMessage = `
          <div class="info-box">

            <strong>
              Your result is based on ${expenseCount} expense
              ${expenseCount === 1 ? "category" : "categories"}
            </strong>

            <p>
              You left
              <strong>${missingExpenses.length}</strong>
              main expense
              ${missingExpenses.length === 1 ? "category" : "categories"}
              blank.
            </p>

            <p>
              Blank fields are not assumed to be £0. If you have
              costs in those areas, adding them could change the
              result.
            </p>

          </div>
        `;

      }

      else {

        budgetMessage = `
          <div class="info-box good-box">

            <strong>
              Your main monthly expenses are included
            </strong>

            <p>
              You've entered rent, bills, food, transport,
              subscriptions and debt payments.
            </p>

          </div>
        `;

      }


      /* =====================================================
         RESULT
         ===================================================== */

      const resultMarkup = `

        <div class="result-top">

          <span class="result-label">
            WORTHCHEX ASSESSMENT
          </span>

          <h2 class="${statusClass}">
            ${title}
          </h2>

          <div class="result-status-pill ${statusClass}">
            ${status}
          </div>

        </div>


        ${advice}


        <div class="stats">

          <div class="stat">

            <span>
              Monthly take-home income
            </span>

            <strong>
              ${money(income)}
            </strong>

          </div>


          <div class="stat">

            <span>
              Entered monthly expenses
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
              Money left after purchase
            </span>

            <strong class="${moneyAfterPurchase < 0 ? "bad" : ""}">
              ${money(moneyAfterPurchase)}
            </strong>

          </div>


          ${
            purchasePercentage !== null
              ? `
                <div class="stat">

                  <span>
                    Purchase as share of available money
                  </span>

                  <strong>
                    ${purchasePercentage.toFixed(1)}%
                  </strong>

                </div>
              `
              : ""
          }


          <div class="stat">

            <span>
              Income used by entered expenses
            </span>

            <strong>
              ${expensePercentage.toFixed(0)}%
            </strong>

          </div>

        </div>


        <h3>
          Your budget
        </h3>

        ${budgetMessage}


        <h3>
          Savings & safety buffer
        </h3>

        ${savingsAdvice}


        ${
          hasFinance
            ? `
              <h3>
                Finance payment
              </h3>

              ${financeAdvice}
            `
            : ""
        }


        <div class="result-note">

          <strong>
            How to read this result
          </strong>

          <p>
            WorthChex doesn't treat a purchase as automatically
            affordable just because your account balance could
            technically cover it. The assessment considers your
            entered monthly cash flow and how much of your
            remaining money the purchase would consume.
          </p>

        </div>


        <p class="disclaimer">
          This is an estimate based on the information you entered.
          It is not a guarantee that a purchase or finance agreement
          is suitable for you. Regular, irregular and future costs
          may change the picture.
        </p>

      `;


      showAffordabilityResult(resultMarkup);

    });

  }


  if (resetButton && result) {

    resetButton.addEventListener("click", function () {

      [
        "income",
        "rent",
        "bills",
        "food",
        "transport",
        "subscriptions",
        "debt",
        "savings",
        "emergency",
        "purchase",
        "monthlyPayment"
      ].forEach(function (id) {

        const element =
          document.getElementById(id);

        if (element) {
          element.value = "";
        }

      });


      result.innerHTML = "";

      result.classList.add("hidden");

    });

  }


  function showAffordabilityResult(html) {

    result.innerHTML = html;

    result.classList.remove("hidden");

    scrollToResult(result);

  }


  /* =========================================================
     SAVINGS GOAL
     ========================================================= */

  const savingsCalculateButton =
    document.getElementById(
      "savingsCalculateButton"
    );

  const savingsResetButton =
    document.getElementById(
      "savingsResetButton"
    );

  const savingsResult =
    document.getElementById(
      "savingsResult"
    );


  if (
    savingsCalculateButton &&
    savingsResult
  ) {

    savingsCalculateButton.addEventListener(
      "click",
      function () {

        const current =
          getValue("currentSavings");

        const goal =
          getValue("savingsGoal");

        const monthly =
          getValue("monthlySaving");


        if (!hasValue("savingsGoal") || goal <= 0) {

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

              <span>100</span>

              <small>%</small>

            </div>


            <h2 class="good">
              You've already reached your goal 🎉
            </h2>


            <p>
              You have
              <strong>${money(current)}</strong>
              against a target of
              <strong>${money(goal)}</strong>.
            </p>


            <div class="info-box good-box">

              <strong>
                Goal reached
              </strong>

              <p>
                You don't need to save anything further
                to reach the target you've entered.
              </p>

            </div>

          `);

          return;
        }


        if (!hasValue("monthlySaving") || monthly <= 0) {

          const remaining =
            goal - current;


          showSavingsResult(`

            <h2 class="warning">
              Enter your monthly saving amount
            </h2>

            <p>
              You have
              <strong>${money(remaining)}</strong>
              left to reach your goal.
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
            Your goal is relatively close. The most useful
            thing now is consistency: keep the monthly amount
            realistic rather than setting a target that makes
            your normal budget uncomfortable.
          `;

        }

        else if (months <= 12) {

          advice = `
            This is a manageable medium-term target based
            on the amount you've entered. An automatic transfer
            shortly after payday can make consistency easier.
          `;

        }

        else if (months <= 24) {

          advice = `
            This is a longer-term target. Consider breaking it
            into smaller milestones so you can see progress
            along the way.
          `;

        }

        else {

          advice = `
            This is a substantial target at your current rate.
            You could either accept the longer timeline or
            explore whether a small increase in monthly saving
            is realistic without putting pressure on essentials.
          `;

        }


        showSavingsResult(`

          <div class="score-circle">

            <span>
              ${progress.toFixed(0)}
            </span>

            <small>%</small>

          </div>


          <h2>
            You're ${progress.toFixed(0)}% there
          </h2>


          <p>
            At
            <strong>${money(monthly)}</strong>
            per month, you could reach your goal in
            approximately
            <strong>
              ${months}
              ${months === 1 ? "month" : "months"}
            </strong>.
          </p>


          <div class="progress-container">

            <div
              class="progress-bar"
              style="width:${Math.max(progress, 1)}%"
            ></div>

          </div>


          <div class="stats">

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

          </div>


          <h3>
            WorthChex's advice
          </h3>


          <p>
            ${advice}
          </p>


          <div class="what-if-box">

            <h3>
              What if you saved more?
            </h3>

            <p>
              Even a relatively small increase can shorten
              the timeline.
            </p>


            <div class="what-if-grid">

              <div class="what-if-card">

                <span>
                  Save £25 more
                </span>

                <strong>
                  ${monthsPlus25}
                  ${monthsPlus25 === 1 ? "month" : "months"}
                </strong>

                <small>
                  ${
                    saved25 > 0
                      ? `${saved25} ${saved25 === 1 ? "month" : "months"} sooner`
                      : "No change"
                  }
                </small>

              </div>


              <div class="what-if-card featured">

                <span>
                  Save £50 more
                </span>

                <strong>
                  ${monthsPlus50}
                  ${monthsPlus50 === 1 ? "month" : "months"}
                </strong>

                <small>
                  ${
                    saved50 > 0
                      ? `${saved50} ${saved50 === 1 ? "month" : "months"} sooner`
                      : "No change"
                  }
                </small>

              </div>

            </div>

          </div>


          <p class="disclaimer">
            This estimate assumes the monthly amount remains
            consistent and does not include investment returns,
            interest or changes to your savings rate.
          </p>

        `);

      });

  }


  if (
    savingsResetButton &&
    savingsResult
  ) {

    savingsResetButton.addEventListener(
      "click",
      function () {

        [
          "currentSavings",
          "savingsGoal",
          "monthlySaving"
        ].forEach(function (id) {

          const element =
            document.getElementById(id);

          if (element) {
            element.value = "";
          }

        });


        savingsResult.innerHTML = "";

        savingsResult.classList.add("hidden");

      }
    );

  }


  function showSavingsResult(html) {

    savingsResult.innerHTML = html;

    savingsResult.classList.remove("hidden");

    scrollToResult(savingsResult);

  }


  /* =========================================================
     DEBT PAYOFF
     ========================================================= */

  const debtCalculateButton =
    document.getElementById(
      "debtCalculateButton"
    );

  const debtResetButton =
    document.getElementById(
      "debtResetButton"
    );

  const debtResult =
    document.getElementById(
      "debtResult"
    );


  if (
    debtCalculateButton &&
    debtResult
  ) {

    debtCalculateButton.addEventListener(
      "click",
      function () {

        const balance =
          getValue("debtBalance");

        const annualRate =
          getValue("interestRate");

        const payment =
          getValue("debtPayment");


        if (
          !hasValue("debtBalance") ||
          balance <= 0
        ) {

          showDebtResult(`

            <h2 class="warning">
              Enter your current debt
            </h2>

            <p>
              Enter the amount you currently owe.
            </p>

          `);

          return;

        }


        if (
          !hasValue("debtPayment") ||
          payment <= 0
        ) {

          showDebtResult(`

            <h2 class="warning">
              Enter your monthly payment
            </h2>

            <p>
              Enter the amount you plan to pay each month.
            </p>

          `);

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

          showDebtResult(`

            <h2 class="bad">
              This payment may not reduce the debt
            </h2>

            <p>
              At an APR of
              <strong>${annualRate.toFixed(2)}%</strong>,
              the first month's estimated interest is
              approximately
              <strong>${money(firstMonthInterest)}</strong>.
            </p>


            <div class="info-box warning">

              <strong>
                Important
              </strong>

              <p>
                Your payment needs to be greater than the
                interest being added for the balance to
                start falling under this simplified model.
              </p>

              <p>
                Check the actual terms of your debt or speak
                with your lender if you're unsure.
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
              This repayment plan takes a very long time
            </h2>

            <p>
              The calculator couldn't produce a practical
              payoff timeline within 100 years.
            </p>

            <p>
              Increasing the monthly payment may shorten the
              timeline considerably.
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
            This is a relatively short repayment timeline.
            The key is keeping the payment affordable and
            consistent.
          `;

        }

        else if (months <= 36) {

          advice = `
            You're looking at a medium-term repayment plan.
            If your budget allows, additional payments could
            shorten the timeline and reduce interest.
          `;

        }

        else {

          advice = `
            This is a long repayment timeline. If you're
            comfortably able to increase the payment, even
            a modest increase may make a meaningful difference.
            Don't increase payments to the point where essential
            bills become difficult to cover.
          `;

        }


        showDebtResult(`

          <div class="score-circle">

            <span>
              ${months}
            </span>

            <small>
              mo
            </small>

          </div>


          <h2>
            Approximately ${months} months to repay
          </h2>


          <p>
            At a monthly payment of
            <strong>${money(payment)}</strong>,
            the estimated payoff date is
            <strong>${payoffDateText}</strong>.
          </p>


          <div class="stats">

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

          </div>


          <h3>
            What if you paid more?
          </h3>


          <div class="what-if-box">

            <div class="what-if-grid">

              <div class="what-if-card">

                <span>
                  Pay £25 more
                </span>

                <strong>
                  ${extra25}
                  ${extra25 === 1 ? "month" : "months"}
                </strong>

                <small>
                  ${
                    saved25 > 0
                      ? `${saved25} ${saved25 === 1 ? "month" : "months"} sooner`
                      : "No change"
                  }
                </small>

              </div>


              <div class="what-if-card featured">

                <span>
                  Pay £50 more
                </span>

                <strong>
                  ${extra50}
                  ${extra50 === 1 ? "month" : "months"}
                </strong>

                <small>
                  ${
                    saved50 > 0
                      ? `${saved50} ${saved50 === 1 ? "month" : "months"} sooner`
                      : "No change"
                  }
                </small>

              </div>

            </div>

          </div>


          <h3>
            WorthChex's advice
          </h3>


          <p>
            ${advice}
          </p>


          <div class="info-box">

            <strong>
              Remember
            </strong>

            <p>
              This calculation is a simplified estimate. Actual
              lender calculations can differ because of payment
              dates, daily interest, fees, promotional rates and
              other terms.
            </p>

          </div>


          <p class="disclaimer">
            Educational estimate only. This is not personalised
            debt advice and does not recommend a particular debt
            solution.
          </p>

        `);

      });

  }


  if (
    debtResetButton &&
    debtResult
  ) {

    debtResetButton.addEventListener(
      "click",
      function () {

        [
          "debtBalance",
          "interestRate",
          "debtPayment"
        ].forEach(function (id) {

          const element =
            document.getElementById(id);

          if (element) {
            element.value = "";
          }

        });


        debtResult.innerHTML = "";

        debtResult.classList.add("hidden");

      }
    );

  }


  function showDebtResult(html) {

    debtResult.innerHTML = html;

    debtResult.classList.remove("hidden");

    scrollToResult(debtResult);

  }


  /* =========================================================
     DEBT CALCULATION HELPER
     ========================================================= */

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

});
