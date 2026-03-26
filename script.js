const heroForm = document.querySelector(".hero-form");
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");

const amountInput = document.getElementById("amount-value");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const convertedValueInput = document.getElementById("converted-value");
const dateValueInput = document.getElementById("date-value");
const datePickerTrigger = document.getElementById("date-picker-trigger");
const converterStatusText = document.getElementById("converter-status-text");
const refreshRateButton = document.getElementById("refresh-rate");
const quickTargetButtons = document.querySelectorAll(".converter-rate-option");

const abstractApiKey =
  document
    .querySelector('meta[name="abstract-api-key"]')
    ?.getAttribute("content")
    ?.trim() || "";

const todayIsoDate = new Date().toISOString().split("T")[0];
const fallbackCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "NGN",
  "JPY",
  "CNY",
  "INR",
  "AED",
  "ZAR",
  "BRL",
  "MXN",
  "SGD",
  "TRY",
  "THB",
  "HKD",
  "KRW",
  "ILS",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "IDR",
];

const currencyNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : { of: (code) => code };

const supportedCurrencies = buildCurrencyList();
let conversionTimer = null;

function buildCurrencyList() {
  const codes =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("currency")
      : fallbackCurrencies;

  return [...new Set(codes)].sort((left, right) => left.localeCompare(right));
}

function getCurrencyName(code) {
  try {
    return currencyNames.of(code) || code;
  } catch (error) {
    return code;
  }
}

function populateCurrencySelect(selectElement, selectedCode) {
  const optionsMarkup = supportedCurrencies
    .map((code) => {
      const isSelected = code === selectedCode ? " selected" : "";
      return `<option value="${code}"${isSelected}>${code}</option>`;
    })
    .join("");

  selectElement.innerHTML = optionsMarkup;
}

function updateConverterStatus(message) {
  converterStatusText.textContent = message;
}

function getSafeAmount() {
  const parsedAmount = Number.parseFloat(amountInput.value);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  return parsedAmount;
}

function formatMoney(value, currencyCode) {
  const maximumFractionDigits = Math.abs(value) >= 1 ? 2 : 6;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits,
  }).format(value);
}

function getSelectedDate() {
  return dateValueInput.value || "";
}

function setDateToToday() {
  dateValueInput.value = todayIsoDate;
  dateValueInput.max = todayIsoDate;
}

function updateQuickTargetState() {
  quickTargetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.currency === toCurrencySelect.value);
  });
}

function createConversionUrl() {
  const endpoint = new URL("https://exchange-rates.abstractapi.com/v1/convert");

  endpoint.searchParams.set("api_key", abstractApiKey);
  endpoint.searchParams.set("base", fromCurrencySelect.value);
  endpoint.searchParams.set("target", toCurrencySelect.value);

  const amount = getSafeAmount();

  if (amount) {
    endpoint.searchParams.set("base_amount", String(amount));
  }

  const selectedDate = getSelectedDate();

  if (selectedDate) {
    endpoint.searchParams.set("date", selectedDate);
  }

  return endpoint.toString();
}

function getLastUpdatedLabel(payload) {
  if (payload?.date) {
    return payload.date;
  }

  if (payload?.last_updated) {
    return new Date(payload.last_updated * 1000).toISOString().split("T")[0];
  }

  return getSelectedDate() || todayIsoDate;
}

async function runConversion() {
  updateQuickTargetState();

  if (!abstractApiKey) {
    convertedValueInput.value = "";
    updateConverterStatus(
      "Add your Abstract Exchange Rates API key in index.html before live conversion can run."
    );
    return;
  }

  const amount = getSafeAmount();

  if (!amount) {
    convertedValueInput.value = "";
    updateConverterStatus("Enter an amount greater than 0 to calculate the exchange rate.");
    return;
  }

  if (fromCurrencySelect.value === toCurrencySelect.value) {
    convertedValueInput.value = formatMoney(amount, toCurrencySelect.value);
    updateConverterStatus(`1 ${fromCurrencySelect.value} = 1 ${toCurrencySelect.value}`);
    return;
  }

  convertedValueInput.value = "Loading...";

  const selectedDate = getSelectedDate();
  updateConverterStatus(
    `Loading ${fromCurrencySelect.value} to ${toCurrencySelect.value} for ${selectedDate || "latest rate"}...`
  );

  try {
    const response = await fetch(createConversionUrl());

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const convertedAmount = Number(data?.converted_amount);
    const exchangeRate = Number(data?.exchange_rate);

    if (!Number.isFinite(convertedAmount) || !Number.isFinite(exchangeRate)) {
      throw new Error("The API response did not include a usable conversion result.");
    }

    convertedValueInput.value = formatMoney(convertedAmount, toCurrencySelect.value);
    updateConverterStatus(
      `1 ${fromCurrencySelect.value} = ${formatMoney(exchangeRate, toCurrencySelect.value)} on ${getLastUpdatedLabel(data)}.`
    );
  } catch (error) {
    console.error("Currency conversion failed:", error);
    convertedValueInput.value = "Unavailable";
    updateConverterStatus(
      "Live conversion could not be loaded right now. Check your API key, date, or network connection."
    );
  }
}

function scheduleConversion() {
  window.clearTimeout(conversionTimer);
  conversionTimer = window.setTimeout(runConversion, 300);
}

function initializeQuickTargets() {
  const quickTargets = ["EUR", "GBP", "BTC"];

  quickTargets.forEach((code, index) => {
    if (quickTargetButtons[index]) {
      quickTargetButtons[index].dataset.currency = code;
      quickTargetButtons[index].textContent = code;
    }
  });
}

if (heroForm) {
  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    menu.classList.toggle("active");
  });
}

populateCurrencySelect(fromCurrencySelect, "USD");
populateCurrencySelect(toCurrencySelect, "CAD");
initializeQuickTargets();
setDateToToday();
updateQuickTargetState();

amountInput?.addEventListener("input", scheduleConversion);
fromCurrencySelect?.addEventListener("change", runConversion);
toCurrencySelect?.addEventListener("change", runConversion);
dateValueInput?.addEventListener("change", runConversion);
refreshRateButton?.addEventListener("click", runConversion);

datePickerTrigger?.addEventListener("click", () => {
  if (typeof dateValueInput.showPicker === "function") {
    dateValueInput.showPicker();
    return;
  }

  dateValueInput.focus();
});

quickTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!supportedCurrencies.includes(button.dataset.currency)) {
      updateConverterStatus(
        `${button.dataset.currency} is not available in this fiat exchange list. Choose another target currency.`
      );
      return;
    }

    toCurrencySelect.value = button.dataset.currency;
    runConversion();
  });
});

runConversion();
