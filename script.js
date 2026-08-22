document.addEventListener("DOMContentLoaded", function () {

  "use strict";


  // =====================================================
  // HELPERS
  // =====================================================

  function getElement(id) {

    return document.getElementById(id);

  }


  function getNumber(id) {

    const element =
      getElement(id);

    if (!element) {
      return 0;
    }

    const value =
      Number(element.value);

    return Number.isFinite(value) &&
      value >= 0
        ? value
        : 0;
  }


  function hasValue(id) {

    const element =
      getElement(id);

    return !!element &&
      element.value.trim() !== "";
  }


  function money(value) {

    return `£${Number(value || 0).toLocaleString(
      "en-GB",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

  }


  function monthsLabel(months) {

    return `${months} month${
      months === 1
        ? ""
        : "s"
    }`;

  }


  function showResult(element, html) {

    if (!element) {
      return;
    }

    element.innerHTML =
      html;

    element.classList.remove(
      "hidden"
    );

    window.setTimeout(
      function () {

        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

      },
      50
    );
  }


  function clearResult(element) {

    if (!element) {
      return;
    }

    element.innerHTML =
      "";

    element.classList.add(
      "hidden"
    );
  }


  function clearSectionInputs(section) {

    if (!section) {
      return;
    }

    section
      .querySelectorAll("input")
      .forEach(
        function (input) {

          input.value =
            "";

          input.setCustomValidity(
            ""
          );

        }
      );

  }


  function validateFields(fields) {

    for (
      const field of fields
    ) {

      const input =
        getElement(field.id);

      if (!input) {
        continue;
      }

      if (
        input.value.trim() === ""
      ) {
        continue;
      }

      const value =
        Number(input.value);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {

        input.setCustomValidity(
          `${field.label} must be zero or more.`
        );

        input.reportValidity();

        return false;
      }

      input.setCustomValidity(
        ""
      );
    }

    return true;
  }


  function setupEnter(
    ids,
    buttonId
  ) {

    ids.forEach(
      function (id) {

        const input =
          getElement(id);

        if (!input) {
          return;
        }

        input.addEventListener(
          "keydown",
          function (event) {

            if (
              event.key === "Enter"
            ) {

              event.preventDefault();

              const button =
                getElement(buttonId);

              if (button) {
                button.click();
              }

            }

          }
        );

      }
    );

  }


  // =====================================================
  // AFFORDABILITY
  // =====================================================

  const affordabilityButton =
    getElement(
      "calculateButton"
    );

  const affordabilityReset =
    getElement(
      "resetButton"
    );

  const affordabilityResult =
    getElement(
      "result"
    );


  const affordabilityFields = [

    {
      id: "income",
      label: "Take-home income"
    },

    {
      id: "rent",
      label: "Rent or mortgage"
    },

    {
      id: "bills",
      label: "Bills and utilities"
    },

    {
      id: "food",
      label: "Food and groceries"
    },

    {
      id: "transport",
      label: "Transport"
    },

    {
      id: "subscriptions",
      label: "Subscriptions"
    },

    {
      id: "debt",
      label: "Debt payments"
    },

    {
      id: "savings",
      label: "Current savings"
    },

    {
      id: "emergency",
      label: "Emergency fund target"
    },

    {
      id: "purchase",
      label: "Purchase price"
    },

    {
      id: "monthlyPayment",
      label: "Monthly finance payment"
    }

  ];


  setupEnter(
    affordabilityFields.map(
      field => field.id
    ),
    "calculateButton"
  );


  if (affordabilityButton) {

    affordabilityButton.addEventListener(
      "click",
      function () {

        if (
          !validateFields(
            affordabilityFields
          )
        ) {
          return;
        }


        const income =
          getNumber("income");

        const purchase =
          getNumber("purchase");

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
          getNumber(
            "monthlyPayment"
          );


        const hasRent =
          hasValue("rent");

        const hasBills =
          hasValue("bills");

        const hasFood =
          hasValue("food");

        const hasTransport =
          hasValue("transport");

        const hasSubscriptions =
          hasValue(
            "subscriptions"
          );

        const hasDebt =
          hasValue("debt");

        const hasSavings =
          hasValue("savings");

        const hasEmergency =
          hasValue(
            "emergency"
          );

        const hasFinance =
          hasValue(
            "monthlyPayment"
          ) &&
          monthlyPayment > 0;


        if (
          income <= 0
        ) {

          showResult(
            affordabilityResult,
            `
              <h2 class="bad">
                Enter your income
              </h2>

              <p>
                Enter your monthly take-home income
                so we can work out what you can
                realistically afford.
              </p>
            `
          );

          return;
        }


        if (
          purchase <= 0
        ) {

          showResult(
            affordabilityResult,
            `
              <h2 class="warning">
                Enter the purchase price
              </h2>

              <p>
                Tell us how much the item you want
                to buy costs.
              </p>
            `
          );

          return;
        }


        // -------------------------------------------------
        // ONLY COUNT ENTERED EXPENSES
        // -------------------------------------------------

        const expenseItems = [

          {
            name: "rent / mortgage",
            entered: hasRent,
            value: rent
          },

          {
            name: "bills & utilities",
            entered: hasBills,
            value: bills
          },

          {
            name: "food & groceries",
            entered: hasFood,
            value: food
          },

          {
            name: "transport",
            entered: hasTransport,
            value: transport
          },

          {
            name: "subscriptions",
            entered: hasSubscriptions,
            value: subscriptions
          },

          {
            name: "debt payments",
            entered: hasDebt,
            value: debt
          }

        ];


        let totalExpenses =
          0;

        let expenseCount =
          0;


        expenseItems.forEach(
          function (item) {

            if (
              item.entered
            ) {

              totalExpenses +=
                item.value;

              expenseCount++;

            }

          }
        );


        const disposable =
          income -
          totalExpenses;


        const expensePercentage =
          income > 0

            ? (
                totalExpenses /
                income
              ) * 100

            : 0;


        const remainingPercentage =
          income > 0

            ? (
                disposable /
                income
              ) * 100

            : 0;


        const housingPercentage =
          hasRent

            ? (
                rent /
                income
              ) * 100

            : null;


        // -------------------------------------------------
        // CASH VS FINANCE
        // -------------------------------------------------

        const financed =
          hasFinance;


        const monthlyCost =
          financed
            ? monthlyPayment
            : purchase;


        const moneyAfter =
          disposable -
          monthlyCost;


        const impact =
          disposable > 0

            ? (
                monthlyCost /
                disposable
              ) * 100

            : null;


        const financePercentage =
          financed &&
          disposable > 0

            ? (
                monthlyPayment /
                disposable
              ) * 100

            : null;


        // -------------------------------------------------
        // SAVINGS SCENARIO
        // -------------------------------------------------

        let savingsAfter =
          null;

        let savingsCovers =
          null;

        let belowEmergency =
          false;


        if (
          hasSavings
        ) {

          savingsAfter =
            savings -
            purchase;

          savingsCovers =
            savingsAfter >= 0;


          if (
            hasEmergency
          ) {

            belowEmergency =
              savingsAfter <
              emergency;

          }

        }


        // -------------------------------------------------
        // DECISION
        // -------------------------------------------------

        const limitedInformation =
          expenseCount <= 1;


        let score =
          100;

        let title =
          "";

        let className =
          "good";

        let advice =
          "";


        if (
          disposable < 0
        ) {

          score = 5;

          className =
            "bad";

          title =
            "I wouldn't buy it right now";

          advice = `
            <div class="result-message bad">

              <p>
                The expenses you've entered are
                currently higher than your monthly
                take-home income.
              </p>

              <p>
                I'd avoid adding this purchase until
                the budget you've provided is back
                into positive territory.
              </p>

            </div>
          `;

        }


        else if (
          disposable === 0
        ) {

          score = 10;

          className =
            "bad";

          title =
            "I'd wait and plan for it";

          advice = `
            <div class="result-message bad">

              <p>
                The expenses you've entered use
                all of the income you've provided.
              </p>

              <p>
                There is currently no monthly
                breathing room for this purchase
                or an unexpected expense.
              </p>

            </div>
          `;

        }


        else if (
          moneyAfter < 0
        ) {

          score = 20;

          className =
            "bad";

          title =
            financed

              ? "The finance payment doesn't fit comfortably"

              : "I'd wait and save for it";


          advice = `

            <div class="result-message bad">

              <p>
                You have approximately
                <strong>
                  ${money(disposable)}
                </strong>
                left after the entered expenses.
              </p>

              <p>
                The ${
                  financed
                    ? "finance payment"
                    : "purchase"
                }
                would leave approximately
                <strong>
                  ${money(moneyAfter)}
                </strong>
                after it.
              </p>

            </div>
          `;

        }


        else if (
          financed
        ) {

          if (
            financePercentage <= 10
          ) {

            score = 92;

            className =
              "good";

            title =
              limitedInformation
                ? "It may be affordable"
                : "The finance looks manageable";

          }

          else if (
            financePercentage <= 20
          ) {

            score = 78;

            className =
              "good";

            title =
              "Probably manageable";

          }

          else if (
            financePercentage <= 30
          ) {

            score = 62;

            className =
              "warning";

            title =
              "I'd think twice";

          }

          else {

            score = 40;

            className =
              "bad";

            title =
              "I'd be cautious with this finance";

          }


          advice = `

            <div
              class="result-message ${className}"
            >

              <p>
                The proposed finance payment is
                <strong>
                  ${money(monthlyPayment)}
                </strong>
                per month.
              </p>

              <p>
                It would use approximately
                <strong>
                  ${financePercentage.toFixed(0)}%
                </strong>
                of the disposable income you've
                calculated.
              </p>

            </div>
          `;

        }


        else {

          if (
            impact <= 10
          ) {

            score = 95;

            className =
              "good";

            title =
              limitedInformation
                ? "It may be affordable"
                : "Looks affordable";

          }

          else if (
            impact <= 25
          ) {

            score = 82;

            className =
              "good";

            title =
              "Probably manageable";

          }

          else if (
            impact <= 50
          ) {

            score = 65;

            className =
              "warning";

            title =
              "I'd think twice";

          }

          else if (
            impact <= 75
          ) {

            score = 48;

            className =
              "warning";

            title =
              "I'd be cautious";

          }

          else {

            score = 30;

            className =
              "bad";

            title =
              "This would leave very little breathing room";

          }


          advice = `

            <div
              class="result-message ${className}"
            >

              <p>
                The purchase would use approximately
                <strong>
                  ${impact.toFixed(0)}%
                </strong>
                of the disposable income you've calculated.
              </p>

              <p>
                Approximately
                <strong>
                  ${money(moneyAfter)}
                </strong>
                would remain afterwards.
              </p>

            </div>
          `;

        }


        // -------------------------------------------------
        // TIGHT BUDGET ADJUSTMENT
        // -------------------------------------------------

        if (
          disposable > 0
        ) {

          if (
            remainingPercentage < 5
          ) {

            score -= 20;

          }

          else if (
            remainingPercentage < 10
          ) {

            score -= 12;

          }

          else if (
            remainingPercentage < 15
          ) {

            score -= 7;

          }

          else if (
            remainingPercentage < 20
          ) {

            score -= 3;

          }

        }


        score =
          Math.max(
            5,
            Math.min(
              100,
              Math.round(score)
            )
          );


        // -------------------------------------------------
        // BUDGET MESSAGE
        // -------------------------------------------------

        let budgetAdvice =
          "";


        if (
          expenseCount === 0
        ) {

          budgetAdvice = `

            <div class="info-box">

              <strong>
                ℹ️ Limited budget information
              </strong>

              <p>
                No monthly expense categories were
                entered, so the calculation is based
                only on your income and purchase.
              </p>

            </div>
          `;

        }


        else if (
          limitedInformation
        ) {

          budgetAdvice = `

            <div class="info-box">

              <strong>
                ℹ️ Limited expense information
              </strong>

              <p>
                Only the categories you entered were
                counted. Blank categories were not
                treated as £0.
              </p>

            </div>
          `;

        }


        else if (
          expensePercentage >= 90
        ) {

          budgetAdvice = `

            <p class="warning">

              Your entered expenses use approximately
              <strong>
                ${expensePercentage.toFixed(0)}%
              </strong>
              of your income.

            </p>
          `;

        }


        else {

          budgetAdvice = `

            <p class="good">

              ✓ Your entered expenses use approximately
              <strong>
                ${expensePercentage.toFixed(0)}%
              </strong>
              of income.

              Approximately
              <strong>
                ${money(disposable)}
              </strong>
              remains before the purchase.

            </p>
          `;

        }


        // -------------------------------------------------
        // HOUSING
        // -------------------------------------------------

        let housingAdvice =
          "";


        if (
          hasRent
        ) {

          if (
            housingPercentage > 50
          ) {

            housingAdvice = `

              <p class="warning">

                Your entered rent / mortgage is
                approximately
                <strong>
                  ${housingPercentage.toFixed(0)}%
                </strong>
                of take-home income.

              </p>
            `;

          }

          else {

            housingAdvice = `

              <p>

                Your entered rent / mortgage is
                approximately
                <strong>
                  ${housingPercentage.toFixed(0)}%
                </strong>
                of take-home income.

              </p>
            `;

          }

        }


        // -------------------------------------------------
        // SAVINGS
        // -------------------------------------------------

        let savingsAdvice =
          "";


        if (
          hasSavings
        ) {

          if (
            !savingsCovers
          ) {

            savingsAdvice = `

              <div class="info-box">

                <strong>
                  Savings check
                </strong>

                <p>
                  Your savings would not fully cover
                  the purchase.

                  Savings are not automatically assumed
                  to be used for the purchase.
                </p>

              </div>
            `;

          }

          else if (
            belowEmergency
          ) {

            savingsAdvice = `

              <div class="info-box">

                <strong>
                  ⚠️ Emergency fund check
                </strong>

                <p>
                  Paying from savings would leave
                  approximately
                  <strong>
                    ${money(savingsAfter)}
                  </strong>
                  against an emergency target of
                  <strong>
                    ${money(emergency)}
                  </strong>.
                </p>

              </div>
            `;

          }

          else {

            savingsAdvice = `

              <div class="info-box good-box">

                <strong>
                  ✓ Savings buffer
                </strong>

                <p>
                  Paying from savings would leave
                  approximately
                  <strong>
                    ${money(savingsAfter)}
                  </strong>.
                </p>

              </div>
            `;

          }

        }


        // -------------------------------------------------
        // MISSING INFO
        // -------------------------------------------------

        const missing =
          expenseItems
            .filter(
              item => !item.entered
            )
            .map(
              item => item.name
            );


        const missingMessage =
          missing.length > 0

            ? `

              <div class="info-box">

                <strong>
                  ℹ️ Blank categories were excluded
                </strong>

                <p>
                  Still blank:
                  <strong>
                    ${missing.join(", ")}
                  </strong>
                </p>

              </div>
            `

            : `

              <div class="info-box good-box">

                <strong>
                  ✓ All listed expense categories entered
                </strong>

                <p>
                  All six main expense categories were included.
                </p>

              </div>
            `;


        // -------------------------------------------------
        // RESULT
        // -------------------------------------------------

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


            <h2 class="${className}">
              ${title}
            </h2>


            ${advice}


            <div class="result-message">

              <span class="mini-label">
                Money left after entered costs
              </span>

              <strong class="big-number">
                ${money(disposable)}
              </strong>

            </div>


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
                ${expenseCount}
              </strong>

            </div>


            <div class="stat">

              <span>
                Total entered expenses
              </span>

              <strong>
                ${money(totalExpenses)}
              </strong>

            </div>


            <div class="stat">

              <span>
                Money left after ${
                  financed
                    ? "finance payment"
                    : "purchase"
                }
              </span>

              <strong>
                ${money(moneyAfter)}
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


            ${
              financed

                ? `

                  <div class="stat">

                    <span>
                      Monthly finance payment
                    </span>

                    <strong>
                      ${money(monthlyPayment)}
                    </strong>

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

            ${missingMessage}


            <p class="disclaimer">

              This is a planning estimate based on
              the figures you entered.

              Blank affordability fields are excluded
              rather than treated as £0.

              It is not financial advice.

            </p>

          `
        );

      }
    );

  }


  if (
    affordabilityReset
  ) {

    affordabilityReset.addEventListener(
      "click",
      function () {

        clearSectionInputs(
          document.querySelector(
            ".calculator-page"
          )
        );

        clearResult(
          affordabilityResult
        );

      }
    );

  }


  // =====================================================
  // SAVINGS
  // =====================================================

  const savingsButton =
    getElement(
      "savingsCalculateButton"
    );

  const savingsReset =
    getElement(
      "savingsResetButton"
    );

  const savingsResult =
    getElement(
      "savingsResult"
    );


  const savingsFields = [

    {
      id: "currentSavings",
      label: "Current savings"
    },

    {
      id: "savingsGoal",
      label: "Savings goal"
    },

    {
      id: "monthlySaving",
      label: "Monthly saving"
    }

  ];


  setupEnter(
    savingsFields.map(
      field => field.id
    ),
    "savingsCalculateButton"
  );


  if (
    savingsButton
  ) {

    savingsButton.addEventListener(
      "click",
      function () {

        if (
          !validateFields(
            savingsFields
          )
        ) {
          return;
        }


        const current =
          getNumber(
            "currentSavings"
          );

        const goal =
          getNumber(
            "savingsGoal"
          );

        const monthly =
          getNumber(
            "monthlySaving"
          );


        if (
          goal <= 0
        ) {

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


        if (
          current >= goal
        ) {

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
                <strong>
                  ${money(current)}
                </strong>
                against a target of
                <strong>
                  ${money(goal)}
                </strong>.
              </p>

            `
          );

          return;
        }


        if (
          monthly <= 0
        ) {

          showResult(
            savingsResult,
            `
              <h2 class="warning">
                Enter a monthly saving amount
              </h2>

              <p>
                You still need
                <strong>
                  ${money(
                    goal -
                    current
                  )}
                </strong>
                to reach the goal.
              </p>
            `
          );

          return;
        }


        const remaining =
          goal -
          current;


        const months =
          Math.ceil(
            remaining /
            monthly
          );


        const weekly =
          monthly *
          12 /
          52;


        const progress =
          Math.min(
            (
              current /
              goal
            ) * 100,
            100
          );


        const plus25 =
          Math.ceil(
            remaining /
            (
              monthly +
              25
            )
          );


        const plus50 =
          Math.ceil(
            remaining /
            (
              monthly +
              50
            )
          );


        const saved25 =
          Math.max(
            months -
            plus25,
            0
          );


        const saved50 =
          Math.max(
            months -
            plus50,
            0
          );


        const targetDate =
          new Date();

        targetDate.setMonth(
          targetDate.getMonth() +
          months
        );


        const targetText =
          targetDate.toLocaleDateString(
            "en-GB",
            {
              month: "long",
              year: "numeric"
            }
          );


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

              At your current saving rate,
              you could reach the goal in
              approximately
              <strong>
                ${monthsLabel(months)}
              </strong>.

            </p>


            <div class="progress-container">

              <div
                class="progress-bar"
                style="width: ${progress}%"
              ></div>

            </div>


            <div class="result-message">

              <span class="mini-label">
                Monthly saving
              </span>

              <strong class="big-number">
                ${money(monthly)}
              </strong>

              <small>
                About
                ${money(weekly)}
                per week
              </small>

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
                Estimated goal date
              </span>

              <strong>
                ${targetText}
              </strong>

            </div>


            <h3>
              🚀 What if you saved more?
            </h3>


            <div class="what-if-box">

              <div class="what-if-grid">

                <div class="what-if-card">

                  <span>
                    Save £25 more
                  </span>

                  <strong>
                    ${monthsLabel(plus25)}
                  </strong>

                  <small>

                    ${
                      saved25 > 0

                        ? `${saved25} month${saved25 === 1 ? "" : "s"} sooner`

                        : "No change in estimated time"
                    }

                  </small>

                </div>


                <div class="what-if-card featured">

                  <span>
                    Save £50 more
                  </span>

                  <strong>
                    ${monthsLabel(plus50)}
                  </strong>

                  <small>

                    ${
                      saved50 > 0

                        ? `${saved50} month${saved50 === 1 ? "" : "s"} sooner`

                        : "No change in estimated time"
                    }

                  </small>

                </div>

              </div>

            </div>


            <p class="disclaimer">

              This estimate assumes a consistent monthly
              contribution and does not include savings
              interest, withdrawals or missed contributions.

            </p>

          `
        );

      }
    );

  }


  if (
    savingsReset
  ) {

    savingsReset.addEventListener(
      "click",
      function () {

        clearSectionInputs(
          document.querySelector(
            ".calculator-page"
          )
        );

        clearResult(
          savingsResult
        );

      }
    );

  }


  // =====================================================
  // DEBT
  // =====================================================

  const debtButton =
    getElement(
      "debtCalculateButton"
    );

  const debtReset =
    getElement(
      "debtResetButton"
    );

  const debtResult =
    getElement(
      "debtResult"
    );


  const debtFields = [

    {
      id: "debtBalance",
      label: "Current debt"
    },

    {
      id: "interestRate",
      label: "Interest rate"
    },

    {
      id: "debtPayment",
      label: "Monthly payment"
    }

  ];


  setupEnter(
    debtFields.map(
      field => field.id
    ),
    "debtCalculateButton"
  );


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
      annualRate /
      100 /
      12;


    if (
      monthlyRate === 0
    ) {

      return {

        months:
          Math.ceil(
            balance /
            payment
          ),

        totalInterest:
          0,

        totalPaid:
          balance

      };

    }


    const firstInterest =
      balance *
      monthlyRate;


    if (
      payment <=
      firstInterest
    ) {

      return null;
    }


    let remaining =
      balance;

    let totalInterest =
      0;

    let months =
      0;


    while (
      remaining > 0.005 &&
      months < 1200
    ) {

      const interest =
        remaining *
        monthlyRate;

      const actualPayment =
        Math.min(
          payment,
          remaining +
          interest
        );

      const principal =
        actualPayment -
        interest;


      if (
        principal <= 0
      ) {

        return null;
      }


      totalInterest +=
        interest;

      remaining -=
        principal;

      months++;

    }


    if (
      remaining > 0.005 ||
      months >= 1200
    ) {

      return null;
    }


    return {

      months,

      totalInterest,

      totalPaid:
        balance +
        totalInterest

    };

  }


  if (
    debtButton
  ) {

    debtButton.addEventListener(
      "click",
      function () {

        if (
          !validateFields(
            debtFields
          )
        ) {

          return;
        }


        const balance =
          getNumber(
            "debtBalance"
          );

        const rate =
          getNumber(
            "interestRate"
          );

        const payment =
          getNumber(
            "debtPayment"
          );


        if (
          balance <= 0
        ) {

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


        if (
          payment <= 0
        ) {

          showResult(
            debtResult,
            `
              <h2 class="warning">
                Enter your monthly payment
              </h2>

              <p>
                Enter how much you can pay
                each month.
              </p>
            `
          );

          return;
        }


        const plan =
          calculateDebtPlan(
            balance,
            rate,
            payment
          );


        if (!plan) {

          const monthlyRate =
            rate /
            100 /
            12;

          const interest =
            balance *
            monthlyRate;


          showResult(
            debtResult,
            `
              <h2 class="bad">
                This payment may not repay the debt
              </h2>

              <p>

                At an APR of
                <strong>
                  ${rate.toFixed(2)}%
                </strong>,

                the first month's estimated
                interest is
                <strong>
                  ${money(interest)}
                </strong>.

              </p>


              <div class="info-box">

                <strong>
                  ⚠️ Important
                </strong>

                <p>
                  Under this simplified model,
                  the payment needs to be greater
                  than the interest being added
                  each month for the balance to fall.
                </p>

              </div>
            `
          );

          return;
        }


        const plus25 =
          calculateDebtPlan(
            balance,
            rate,
            payment +
            25
          );


        const plus50 =
          calculateDebtPlan(
            balance,
            rate,
            payment +
            50
          );


        const saved25 =
          plus25

            ? Math.max(
                plan.months -
                plus25.months,
                0
              )

            : 0;


        const saved50 =
          plus50

            ? Math.max(
                plan.months -
                plus50.months,
                0
              )

            : 0;


        const interestSaved25 =
          plus25

            ? Math.max(
                plan.totalInterest -
                plus25.totalInterest,
                0
              )

            : 0;


        const interestSaved50 =
          plus50

            ? Math.max(
                plan.totalInterest -
                plus50.totalInterest,
                0
              )

            : 0;


        const payoffDate =
          new Date();


        payoffDate.setMonth(
          payoffDate.getMonth() +
          plan.months
        );


        const payoffText =
          payoffDate.toLocaleDateString(
            "en-GB",
            {
              month: "long",
              year: "numeric"
            }
          );


        showResult(
          debtResult,
          `

            <div class="score-circle">

              <span>
                ${plan.months}
              </span>

              <small>
                months
              </small>

            </div>


            <h2>
              Debt-free in approximately
              ${monthsLabel(plan.months)}
            </h2>


            <p>

              At a monthly payment of
              <strong>
                ${money(payment)}
              </strong>,

              your estimated payoff date is
              <strong>
                ${payoffText}
              </strong>.

            </p>


            <div class="result-message">

              <span class="mini-label">
                Estimated interest
              </span>

              <strong class="big-number">
                ${money(
                  plan.totalInterest
                )}
              </strong>

              <small>
                Estimated total paid:
                ${money(
                  plan.totalPaid
                )}
              </small>

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
                ${rate.toFixed(2)}%
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
                      plus25
                        ? monthsLabel(
                            plus25.months
                          )
                        : "Very long"
                    }

                  </strong>

                  <small>

                    ${
                      plus25 && saved25 > 0

                        ? `${saved25} month${saved25 === 1 ? "" : "s"} sooner · Save ${money(interestSaved25)} interest`

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
                      plus50
                        ? monthsLabel(
                            plus50.months
                          )
                        : "Very long"
                    }

                  </strong>

                  <small>

                    ${
                      plus50 && saved50 > 0

                        ? `${saved50} month${saved50 === 1 ? "" : "s"} sooner · Save ${money(interestSaved50)} interest`

                        : "No major time change"
                    }

                  </small>

                </div>


              </div>

            </div>


            <p class="disclaimer">

              This is a simplified estimate.
              Actual lender calculations can differ
              because of fees, payment timing,
              variable rates and account rules.

            </p>

          `
        );

      }
    );

  }


  if (
    debtReset
  ) {

    debtReset.addEventListener(
      "click",
      function () {

        clearSectionInputs(
          document.querySelector(
            ".calculator-page"
          )
        );

        clearResult(
          debtResult
        );

      }
    );

  }

});
