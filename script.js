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


      // What has actually been entered?

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


      const extraExpensesEntered =
        hasBills ||
        hasFood ||
        hasTransport ||
        hasSubscriptions ||
        hasDebt;


      const allMainExpensesEntered =
        hasBills &&
        hasFood &&
        hasTransport &&
        hasSubscriptions &&
        hasDebt;


      // Validation

      if (income <= 0) {

        showAffordabilityResult(`
          <h2 class="bad">
            Enter your income
          </h2>

          <p>
            Enter your monthly take-home income
            so we can work out how much room you
            have in your budget.
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
            Tell us how much the thing you want
            to buy costs.
          </p>
        `);

        return;
      }


      // Calculations

      const housingPercentage =
        (rent / income) * 100;


      const moneyAfterRent =
        income - rent;


      const totalListedExpenses =
        rent +
        bills +
        food +
        transport +
        subscriptions +
        debt;


      const actualDisposable =
        income - totalListedExpenses;


      let availableMoney;

      if (allMainExpensesEntered) {

        availableMoney =
          actualDisposable;

      } else {

        availableMoney =
          moneyAfterRent;

      }


      const purchasePercentage =
        availableMoney > 0
          ? (purchase / availableMoney) * 100
          : 100;


      // Score

      let score;
      let title;
      let colour;
      let advice;


      if (moneyAfterRent <= 0) {

        score = 10;

        title =
          "I wouldn't buy it right now";

        colour = "bad";

        advice = `
          After your rent, you have little or no
          money left from your monthly income.

          I wouldn't recommend making this purchase
          until you've looked at your full budget.
        `;

      }

      else if (
        allMainExpensesEntered &&
        actualDisposable <= 0
      ) {

        score = 10;

        title =
          "I wouldn't buy it right now";

        colour = "bad";

        advice = `
          Based on the expenses you've entered,
          your monthly spending is using all of
          your income or more.

          I'd sort out the monthly budget before
          making this purchase.
        `;

      }

      else if (purchasePercentage <= 5) {

        score = 95;

        title =
          "Looks reasonable";

        colour = "good";

        advice = `
          This purchase is relatively small compared
          with the money you've currently identified
          as available.

          Based on what you've entered, it looks
          reasonable.
        `;

      }

      else if (purchasePercentage <= 10) {

        score = 88;

        title =
          "Looks affordable";

        colour = "good";

        advice = `
          This purchase is a relatively small portion
          of the money you've currently identified
          as available.

          It looks manageable, assuming your other
          spending doesn't use most of that money.
        `;

      }

      else if (purchasePercentage <= 25) {

        score = 75;

        title =
          "Probably manageable";

        colour = "good";

        advice = `
          This purchase represents a noticeable portion
          of the money you've currently identified as
          available.

          It may be manageable, but I'd check your
          savings and upcoming expenses first.
        `;

      }

      else if (purchasePercentage <= 50) {

        score = 55;

        title =
          "I'd think twice";

        colour = "warning";

        advice = `
          This purchase would use a significant portion
          of the money you've currently identified as
          available.

          I'd check your savings and upcoming expenses
          before buying.
        `;

      }

      else if (purchasePercentage <= 100) {

        score = 40;

        title =
          "I'd wait and plan for it";

        colour = "warning";

        advice = `
          This is a large purchase compared with the
          money you've currently identified as available.

          I'd save toward it first rather than making
          the purchase immediately.
        `;

      }

      else {

        score = 25;

        title =
          "I'd save for it first";

        colour = "bad";

        advice = `
          The purchase is larger than the money you've
          currently identified as available for one month.

          I'd save toward it first rather than putting
          pressure on your finances.
        `;

      }


      // Housing advice

      let housingAdvice = "";

      if (rent <= 0) {

        housingAdvice = `
          You haven't entered a housing cost, so we
          can't assess how much of your income is
          already committed to housing.
        `;

      }

      else if (housingPercentage <= 25) {

        housingAdvice = `
          Your rent is about
          <strong>${housingPercentage.toFixed(0)}%</strong>
          of your take-home income.
          That leaves a relatively large amount before
          your other expenses.
        `;

      }

      else if (housingPercentage <= 35) {

        housingAdvice = `
          Your rent is about
          <strong>${housingPercentage.toFixed(0)}%</strong>
          of your take-home income.

          That's a meaningful housing cost, so your
          other spending matters when deciding whether
          this purchase fits.
        `;

      }

      else if (housingPercentage <= 50) {

        housingAdvice = `
          Your rent is about
          <strong>${housingPercentage.toFixed(0)}%</strong>
          of your take-home income.

          Housing is taking a large share of your income,
          so I'd be cautious with large purchases.
        `;

      }

      else {

        housingAdvice = `
          Your rent is about
          <strong>${housingPercentage.toFixed(0)}%</strong>
          of your take-home income.

          That's a very large share, so I'd be
          particularly careful with non-essential
          purchases.
        `;

      }


      // Savings advice

      let savingsAdvice = "";

      if (hasSavings) {

        const savingsAfterPurchase =
          savings - purchase;


        if (savingsAfterPurchase < 0) {

          savingsAdvice = `
            <p class="bad">
              ⚠️ Your current savings wouldn't fully
              cover this purchase.
            </p>
          `;

        }

        else if (
          hasEmergency &&
          savingsAfterPurchase < emergency
        ) {

          savingsAdvice = `
            <p class="warning">
              ⚠️ Buying this would take your savings
              below your emergency-fund target.
            </p>
          `;

        }

        else {

          savingsAdvice = `
            <p class="good">
              ✓ Your entered savings could cover
              the purchase without dropping below
              your emergency-fund target.
            </p>
          `;

        }

      }

      else {

        savingsAdvice = `
          <p class="warning">
            💡 You haven't entered your savings.
            For a large purchase, I'd check your
            savings before deciding.
          </p>
        `;

      }


      // Finance advice

      let financeAdvice = "";

      if (hasFinance) {

        const afterFinance =
          availableMoney - monthlyPayment;


        const paymentPercentage =
          availableMoney > 0
            ? (monthlyPayment / availableMoney) * 100
            : 100;


        if (afterFinance <= 0) {

          financeAdvice = `
            <p class="bad">
              ⚠️ The finance payment would use
              essentially all of the money you've
              currently identified as available.
            </p>
          `;

        }

        else if (paymentPercentage > 20) {

          financeAdvice = `
            <p class="warning">
              ⚠️ The finance payment would use about
              ${paymentPercentage.toFixed(0)}% of your
              currently available money.
              That's significant.
            </p>
          `;

        }

        else {

          financeAdvice = `
            <p class="good">
              ✓ The finance payment is about
              ${paymentPercentage.toFixed(0)}% of your
              currently available money.
            </p>
          `;

        }

      }


      // Information warning

      let dataMessage = "";


      if (!extraExpensesEntered) {

        dataMessage = `
          <div class="info-box">

            <strong>
              ⚠️ Preliminary estimate
            </strong>

            <p>
              You've only entered your income and
              housing cost so far.

              That's enough for a useful first estimate,
              but your food, bills, transport and other
              spending could change the result.
            </p>

          </div>
        `;

      }

      else if (!allMainExpensesEntered) {

        dataMessage = `
          <div class="info-box">

            <strong>
              Almost there
            </strong>

            <p>
              You've entered some of your expenses,
              but not all of them.

              Adding the remaining costs will make
              this estimate more realistic.
            </p>

          </div>
        `;

      }

      else {

        dataMessage = `
          <div class="info-box good-box">

            <strong>
              ✓ Full expense information entered
            </strong>

            <p>
              This result is based on all of the
              monthly expense categories provided.
            </p>

          </div>
        `;

      }


      // Display result

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
            Rent
          </span>

          <strong>
            £${rent.toFixed(2)}
          </strong>

        </div>


        <div class="stat">

          <span>
            Money left after rent
          </span>

          <strong>
            £${moneyAfterRent.toFixed(2)}
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
            ${purchasePercentage.toFixed(1)}%
          </strong>

        </div>


        <h3>
          🧠 MoneyCheck's advice
        </h3>


        <p>
          ${housingAdvice}
        </p>


        ${savingsAdvice}


        ${financeAdvice}


        ${dataMessage}


        <p class="disclaimer">
          This tool provides an estimate based on
          the information entered. It is not financial
          advice.
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

});
