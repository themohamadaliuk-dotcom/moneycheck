// =====================================================
// COMMON-SENSE AFFORDABILITY SCORE
//
      // ONLY information actually entered is used.
      // This is deliberately NOT a simple "100 minus
      // deductions" system.
//
      // Blank fields have ZERO effect.
      // The score starts with the person's actual cashflow
      // and then considers how significant the purchase is.
//
      // The main question is:
      //
      // "After the costs you've told us about, does this
      // purchase look sensible compared with the money
      // you have left?"
      //
      // Small purchases should stay small.
      // Larger purchases become increasingly important.
      // Blank fields have ZERO effect on the score.
// =====================================================

let score = 100;


// =====================================================
// 1. NEGATIVE CASHFLOW
      //
      // If entered expenses already exceed income, the
      // purchase is not affordable from the information
      // provided.
// =====================================================

if (disposableIncome < 0) {

        score = 5;
        score = 10;

}

@@ -364,247 +363,211 @@ document.addEventListener("DOMContentLoaded", function () {
else {

// ===================================================
        // 2. PURCHASE COMPARED WITH MONEY LEFT
        // 2. HOW MUCH OF AVAILABLE MONEY DOES THE PURCHASE USE?
        //
        // Small purchases receive very little penalty.
        // Larger purchases become increasingly significant.
// ===================================================

        const purchaseRatio =
          purchase / disposableIncome;
        if (purchasePercentage <= 5) {


        if (purchaseRatio <= 0.025) {

          // Up to 2.5%
score -= 0;

}

        else if (purchaseRatio <= 0.05) {
        else if (purchasePercentage <= 10) {

          // 2.5% - 5%
          score -= 1;

        }

        else if (purchaseRatio <= 0.10) {

          // 5% - 10%
          score -= 4;
          score -= 2;

}

        else if (purchaseRatio <= 0.15) {
        else if (purchasePercentage <= 15) {

          // 10% - 15%
          score -= 9;
          score -= 5;

}

        else if (purchaseRatio <= 0.20) {
        else if (purchasePercentage <= 20) {

          // 15% - 20%
          score -= 15;
          score -= 10;

}

        else if (purchaseRatio <= 0.30) {
        else if (purchasePercentage <= 30) {

          // 20% - 30%
          score -= 23;
          score -= 17;

}

        else if (purchaseRatio <= 0.40) {
        else if (purchasePercentage <= 40) {

          // 30% - 40%
          score -= 32;
          score -= 25;

}

        else if (purchaseRatio <= 0.50) {
        else if (purchasePercentage <= 50) {

          // 40% - 50%
          score -= 42;
          score -= 35;

}

        else if (purchaseRatio <= 0.65) {
        else if (purchasePercentage <= 65) {

          // 50% - 65%
          score -= 55;
          score -= 48;

}

        else if (purchaseRatio <= 0.80) {
        else if (purchasePercentage <= 80) {

          // 65% - 80%
          score -= 68;
          score -= 60;

}

        else if (purchaseRatio <= 1) {
        else if (purchasePercentage <= 100) {

          // 80% - 100%
          score -= 80;
          score -= 72;

}

else {

          // Purchase is bigger than the money left
          score -= 90;
          score -= 85;

}

      }

        // ===================================================
        // 3. MONEY LEFT AFTER BUYING
        // ===================================================

        const remainingAfterPurchase =
          disposableIncome - purchase;
      // =====================================================
      // 3. VERY TIGHT MONTHLY CASHFLOW
      //
      // This matters because even a purchase that technically
      // fits can be risky when almost nothing is left.
      //
      // It is deliberately a smaller adjustment than before.
      // =====================================================

      if (disposableIncome > 0) {

        const remainingAfterPurchasePercentage =
          income > 0
            ? (remainingAfterPurchase / income) * 100
            : 0;
        const remainingIncomePercentage =
          (disposableIncome / income) * 100;


        if (remainingAfterPurchase < 0) {
        if (remainingIncomePercentage < 5) {

          score -= 10;
          score -= 18;

}

        else if (remainingAfterPurchasePercentage < 5) {
        else if (remainingIncomePercentage < 10) {

score -= 12;

}

        else if (remainingAfterPurchasePercentage < 10) {
        else if (remainingIncomePercentage < 15) {

score -= 7;

}

        else if (remainingAfterPurchasePercentage < 15) {
        else if (remainingIncomePercentage < 20) {

score -= 3;

}

      }

        // ===================================================
        // 4. VERY HIGH KNOWN EXPENSES
        //
        // Only entered expenses are considered.
        // Blank fields have NO effect.
        // ===================================================

        if (expensePercentage >= 95) {
      // =====================================================
      // 4. SAVINGS
      //
      // Savings only meaningfully affects the score when
      // the purchase would actually use a significant amount
      // of available savings.
      //
      // A £20 or £50 purchase shouldn't suddenly become
      // "unaffordable" just because savings weren't entered.
      // =====================================================

          score -= 8;
      if (hasSavings && savings > 0) {

        }
        const purchaseToSavings =
          (purchase / savings) * 100;

        else if (expensePercentage >= 90) {

          score -= 5;
        if (purchaseToSavings > 100) {

          score -= 10;

}

        else if (expensePercentage >= 80) {
        else if (purchaseToSavings > 75) {

          score -= 2;
          score -= 7;

}

        else if (purchaseToSavings > 50) {

        // ===================================================
        // 5. SAVINGS
        //
        // Only considered if savings were actually entered.
        // ===================================================
          score -= 4;

        if (hasSavings && savings > 0) {
        }

          const purchaseToSavings =
            (purchase / savings) * 100;
        else if (purchaseToSavings > 25) {

          score -= 2;

          if (purchaseToSavings > 100) {
        }

            score -= 8;
      }

          }

          else if (purchaseToSavings > 75) {
      // =====================================================
      // 5. EMERGENCY FUND
      //
      // This is a meaningful warning rather than a giant
      // automatic penalty.
      // =====================================================

            score -= 5;
      if (emergencyFundBroken) {

          }
        score -= 12;

          else if (purchaseToSavings > 50) {
      }

            score -= 3;

          }
      // =====================================================
      // 6. FINANCE
      //
      // Financing is judged by the ongoing monthly payment,
      // not simply by the purchase price.
      // =====================================================

          else if (purchaseToSavings > 25) {
      if (hasFinance && disposableIncome > 0) {

            score -= 1;
        if (moneyAfterFinance <= 0) {

          }
          score -= 25;

}

        else if (financePercentage > 30) {

        // ===================================================
        // 6. EMERGENCY FUND
        //
        // Only relevant if savings and emergency target
        // were actually entered.
        // ===================================================

        if (emergencyFundBroken) {

          score -= 8;
          score -= 18;

}

        else if (financePercentage > 20) {

        // ===================================================
        // 7. FINANCE
        //
        // Judged using the ongoing monthly payment.
        // ===================================================

        if (hasFinance && disposableIncome > 0) {

          if (moneyAfterFinance <= 0) {

            score -= 20;

          }

          else if (financePercentage > 30) {

            score -= 15;

          }

          else if (financePercentage > 20) {

            score -= 8;

          }
          score -= 10;

          else if (financePercentage > 10) {
        }

            score -= 3;
        else if (financePercentage > 10) {

          }
          score -= 4;

}

@@ -2529,140 +2492,3 @@ document.addEventListener("DOMContentLoaded", function () {


});
/* =========================================================
   CURRENCY SUPPORT
   ========================================================= */

const currencySelector = document.getElementById("currency");

const currencySymbols = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
  CHF: "CHF",
  INR: "₹"
};

function getCurrency() {
  return currencySelector
    ? currencySelector.value
    : "GBP";
}

function getCurrencySymbol() {
  return currencySymbols[getCurrency()] || "£";
}

function formatMoney(amount) {
  const currency = getCurrency();

  return new Intl.NumberFormat(
    undefined,
    {
      style: "currency",
      currency: currency,
      maximumFractionDigits:
        currency === "JPY" ? 0 : 2
    }
  ).format(amount);
}


/* Update every currency symbol beside inputs */

function updateCurrencySymbols() {
  const symbol = getCurrencySymbol();

  document
    .querySelectorAll(".input-wrapper > span")
    .forEach((element) => {
      element.textContent = symbol;
    });
}


/* Remember selected currency */

if (currencySelector) {

  const savedCurrency =
    localStorage.getItem("worthchexCurrency");

  if (
    savedCurrency &&
    currencySymbols[savedCurrency]
  ) {
    currencySelector.value = savedCurrency;
  }

  updateCurrencySymbols();

  currencySelector.addEventListener(
    "change",
    () => {

      localStorage.setItem(
        "worthchexCurrency",
        currencySelector.value
      );

      updateCurrencySymbols();

      /*
       * If a result is already displayed,
       * recalculate it so the displayed
       * currency changes immediately.
       */

      const calculateButton =
        document.getElementById("calculateButton");

      const result =
        document.getElementById("result");

      if (
        calculateButton &&
        result &&
        !result.classList.contains("hidden")
      ) {
        calculateButton.click();
      }

      const savingsResult =
        document.getElementById("savingsResult");

      const savingsButton =
        document.getElementById(
          "savingsCalculateButton"
        );

      if (
        savingsResult &&
        savingsButton &&
        !savingsResult.classList.contains("hidden")
      ) {
        savingsButton.click();
      }

      const debtResult =
        document.getElementById("debtResult");

      const debtButton =
        document.getElementById(
          "debtCalculateButton"
        );

      if (
        debtResult &&
        debtButton &&
        !debtResult.classList.contains("hidden")
      ) {
        debtButton.click();
      }

    }
  );
}
