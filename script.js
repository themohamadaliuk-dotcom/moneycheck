

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
