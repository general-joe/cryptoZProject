// Cache the few interactive elements used across the page.
const heroForm = document.querySelector(".hero-form");
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");

// Converter controls keep the original card design but now drive live exchange logic.
const amountInput = document.getElementById("amount-value");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const fromCurrencyLabel = document.getElementById("from-currency-label");
const toCurrencyLabel = document.getElementById("to-currency-label");
const convertedValueInput = document.getElementById("converted-value");
const dateValueInput = document.getElementById("date-value");
const converterStatusText = document.getElementById("converter-status-text");
const refreshRateButton = document.getElementById("refresh-rate");
const targetPrevButton = document.getElementById("target-prev");
const targetNextButton = document.getElementById("target-next");
const quickTargetButtons = document.querySelectorAll(".converter-rate-option");

// Small curated list keeps the converter easy to use and matches the compact UI.
const supportedCurrencies = ["EUR", "GBP", "AUD", "USD", "CAD"];
let conversionTimer = null;

// Format the converted number so the result is readable inside the narrow input field.
function formatConvertedValue(value, currencyCode) {
  const digits = Math.abs(value) >= 1000 ? 2 : 6;

  return (
    new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    }).format(value) + ` ${currencyCode}`
  );
}

// Keep the text labels in the styled currency chips synced with the hidden selects.
function syncCurrencyLabels() {
  fromCurrencyLabel.textContent = fromCurrencySelect.value;
  toCurrencyLabel.textContent = toCurrencySelect.value;

  quickTargetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.currency === toCurrencySelect.value);
  });
}

// Helper for status updates beneath the converter.
function updateConverterStatus(message) {
  converterStatusText.textContent = message;
}

// Guard against empty, invalid, or negative values before calling the API.
function getSafeAmount() {
  const parsedAmount = Number.parseFloat(amountInput.value);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  return parsedAmount;
}

// Frankfurter provides a simple free exchange-rate endpoint for fiat currency conversion.
function createConversionUrl(baseCurrency) {
  const endpoint = new URL(`https://api.frankfurter.app/latest`);
  endpoint.searchParams.set("from", baseCurrency);

  return endpoint.toString();
}

// Update the text shown in the date row to reflect the latest successful data fetch.
function updateDateField(dateText) {
  dateValueInput.value = dateText.toLowerCase();
}

// Fetch a live rate and update the converter UI.
async function runConversion() {
  const amount = getSafeAmount();
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;

  syncCurrencyLabels();

  if (!amount) {
    convertedValueInput.value = "";
    updateDateField("enter valid amount");
    updateConverterStatus("Enter an amount greater than 0 to calculate a live conversion.");
    return;
  }

  convertedValueInput.value = "Loading...";
  updateDateField("fetching live rate");
  updateConverterStatus(`Fetching live ${fromCurrency} to ${toCurrency} exchange rate...`);

  try {
    const response = await fetch(createConversionUrl(fromCurrency));

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.rates?.[toCurrency];
    const rateDate = data?.date;

    if (typeof rate !== "number") {
      throw new Error("The API did not return a usable exchange rate.");
    }

    const convertedValue = amount * rate;
    convertedValueInput.value = formatConvertedValue(convertedValue, toCurrency);
    updateDateField(rateDate ?? "updated today");
    updateConverterStatus(
      `1 ${fromCurrency} = ${formatConvertedValue(rate, toCurrency)}`
    );
  } catch (error) {
    console.error("Currency conversion failed:", error);
    convertedValueInput.value = "Unavailable";
    updateDateField("service unavailable");
    updateConverterStatus("Live conversion could not be loaded right now. Try again shortly.");
  }
}

// Debounce typing so rapid input does not fire unnecessary requests.
function scheduleConversion() {
  window.clearTimeout(conversionTimer);
  conversionTimer = window.setTimeout(runConversion, 300);
}

// Cycle through the available target currencies using the date-row arrows.
function stepTargetCurrency(direction) {
  const currentIndex = supportedCurrencies.indexOf(toCurrencySelect.value);
  const nextIndex =
    (currentIndex + direction + supportedCurrencies.length) % supportedCurrencies.length;

  toCurrencySelect.value = supportedCurrencies[nextIndex];
  runConversion();
}

// Prevent the demo email form from reloading the page when submitted.
if (heroForm) {
  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

// Mobile menu toggle keeps the existing navigation interaction intact.
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    menu.classList.toggle("active");
  });
}

amountInput?.addEventListener("input", scheduleConversion);
fromCurrencySelect?.addEventListener("change", runConversion);
toCurrencySelect?.addEventListener("change", runConversion);
refreshRateButton?.addEventListener("click", runConversion);
targetPrevButton?.addEventListener("click", () => stepTargetCurrency(-1));
targetNextButton?.addEventListener("click", () => stepTargetCurrency(1));

// Quick targets provide one-tap switching for the small rate chips under the converter.
quickTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toCurrencySelect.value = button.dataset.currency;
    runConversion();
  });
});

// Initialize the hero card with the current selection and a live first result.
syncCurrencyLabels();
runConversion();
