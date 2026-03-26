// Grab the email form in the hero section so we can stop it from reloading the page.
const heroForm = document.querySelector(".hero-form");
// Grab the hamburger toggle used on smaller screens.
const toggle = document.getElementById("menu-toggle");
// Grab the mobile menu panel that opens and closes when the hamburger is clicked.
const menu = document.getElementById("mobile-menu");

// Grab the amount input where the user types the source value.
const amountInput = document.getElementById("amount-value");
// Grab the source currency dropdown shown on the left of the amount field.
const fromCurrencySelect = document.getElementById("from-currency");
// Grab the target currency dropdown shown on the left of the converted field.
const toCurrencySelect = document.getElementById("to-currency");
// Grab the readonly field where the converted value will be displayed.
const convertedValueInput = document.getElementById("converted-value");
// Grab the date field that remains in the UI for visual alignment with the design.
const dateValueInput = document.getElementById("date-value");
// Grab the button that opens the browser date picker.
const datePickerTrigger = document.getElementById("date-picker-trigger");
// Grab the small live region used for status and feedback messages.
const converterStatusText = document.getElementById("converter-status-text");
// Grab the refresh button in case we want to manually request the latest live rate again.
const refreshRateButton = document.getElementById("refresh-rate");
// Grab the quick target labels shown at the bottom of the converter card.
const quickTargetButtons = document.querySelectorAll(".converter-rate-option");

// Read the Abstract API key from the meta tag in index.html.
const abstractApiKey =
  // Look up the meta tag by name.
  document
    .querySelector('meta[name="abstract-api-key"]')
    // Read the value inside its content attribute.
    ?.getAttribute("content")
    // Remove accidental spaces before or after the key.
    ?.trim() || "";

// Store today's date in YYYY-MM-DD format for the date input.
const todayIsoDate = new Date().toISOString().split("T")[0];
// Provide a fallback set of currencies for older browsers that do not support Intl.supportedValuesOf.
const fallbackCurrencies = [
  // United States Dollar.
  "USD",
  // Euro.
  "EUR",
  // British Pound Sterling.
  "GBP",
  // Canadian Dollar.
  "CAD",
  // Australian Dollar.
  "AUD",
  // Nigerian Naira.
  "NGN",
  // Japanese Yen.
  "JPY",
  // Chinese Yuan.
  "CNY",
  // Indian Rupee.
  "INR",
  // United Arab Emirates Dirham.
  "AED",
  // South African Rand.
  "ZAR",
  // Brazilian Real.
  "BRL",
  // Mexican Peso.
  "MXN",
  // Singapore Dollar.
  "SGD",
  // Turkish Lira.
  "TRY",
  // Thai Baht.
  "THB",
  // Hong Kong Dollar.
  "HKD",
  // South Korean Won.
  "KRW",
  // Israeli New Shekel.
  "ILS",
  // Malaysian Ringgit.
  "MYR",
  // Norwegian Krone.
  "NOK",
  // New Zealand Dollar.
  "NZD",
  // Philippine Peso.
  "PHP",
  // Indonesian Rupiah.
  "IDR",
];

// Create a helper that can convert currency codes like USD into display names when the browser supports it.
const currencyNames =
  // Check whether the browser exposes Intl.DisplayNames.
  typeof Intl.DisplayNames === "function"
    ? // If supported, create a currency-name formatter.
      new Intl.DisplayNames(["en"], { type: "currency" })
    : // Otherwise, provide a tiny fallback object that just echoes the code.
      { of: (code) => code };

// Build the final list of supported currencies once when the page loads.
const supportedCurrencies = buildCurrencyList();
// Keep track of a debounce timer so typing does not fire conversion on every single keystroke instantly.
let conversionTimer = null;

// Build the list of currencies used by the native select elements.
function buildCurrencyList() {
  // Ask the browser for its full supported currency list when possible.
  const codes =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("currency")
      : fallbackCurrencies;

  // Remove duplicates and sort the list alphabetically for easier browsing.
  return [...new Set(codes)].sort((left, right) => left.localeCompare(right));
}

// Return a human-readable currency name for a currency code.
function getCurrencyName(code) {
  // Try the browser helper first.
  try {
    // If the browser knows the proper label, return it.
    return currencyNames.of(code) || code;
  } catch (error) {
    // If anything fails, return the raw code so the UI still works.
    return code;
  }
}

// Fill one of the currency dropdowns with the supported currency list.
function populateCurrencySelect(selectElement, selectedCode) {
  // Generate all <option> tags as one HTML string.
  const optionsMarkup = supportedCurrencies
    // Convert each currency code into an <option>.
    .map((code) => {
      // Mark the requested default code as selected.
      const isSelected = code === selectedCode ? " selected" : "";
      // Return the option markup for this one currency.
      return `<option value="${code}"${isSelected}>${code}</option>`;
    })
    // Join every option into one long string for insertion into the select.
    .join("");

  // Write the generated options into the select element.
  selectElement.innerHTML = optionsMarkup;
}

// Update the small status message under the converter.
function updateConverterStatus(message) {
  // Replace the current text with the latest status message.
  converterStatusText.textContent = message;
}

// Read and validate the number the user typed into the amount field.
function getSafeAmount() {
  // Convert the string value from the input into a floating-point number.
  const parsedAmount = Number.parseFloat(amountInput.value);

  // Reject invalid, empty, or negative numbers.
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  // Return the valid amount when the check passes.
  return parsedAmount;
}

// Format a numeric result as a currency string for display.
function formatMoney(value, currencyCode) {
  // Use fewer decimal places for bigger numbers and more for smaller ones.
  const maximumFractionDigits = Math.abs(value) >= 1 ? 2 : 6;

  // Return the final formatted money string.
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits,
  }).format(value);
}

// Read the date currently shown in the date input.
function getSelectedDate() {
  // Return the current value or an empty string if nothing is present.
  return dateValueInput.value || "";
}

// Set the date field to today's date and prevent future dates from being selected.
function setDateToToday() {
  // Show today's date in the input to match the polished design.
  dateValueInput.value = todayIsoDate;
  // Prevent picking a future date.
  dateValueInput.max = todayIsoDate;
}

// Highlight whichever quick target text matches the selected target currency.
function updateQuickTargetState() {
  // Loop through each quick target label.
  quickTargetButtons.forEach((button) => {
    // Toggle the active class based on whether the label matches the current target code.
    button.classList.toggle(
      "is-active",
      button.dataset.currency === toCurrencySelect.value,
    );
  });
}

// Build the Abstract live endpoint URL for the current source currency.
function createConversionUrl() {
  // Start from the official Abstract live endpoint.
  const endpoint = new URL("https://exchange-rates.abstractapi.com/v1/live");

  // Attach the user's API key.
  endpoint.searchParams.set("api_key", abstractApiKey);
  // Attach the source currency code as the API base currency.
  endpoint.searchParams.set("base", fromCurrencySelect.value);

  // Return the completed URL as a string.
  return endpoint.toString();
}

// Fetch live exchange rate data from Abstract and normalize API errors.
async function fetchConversion() {
  // Send the request to Abstract.
  const response = await fetch(createConversionUrl());
  // Read the raw response body as text first so we can safely inspect it in all cases.
  const responseText = await response.text();

  // Prepare a variable that will hold the parsed JSON payload.
  let data = null;

  // Try to parse the body as JSON.
  try {
    // Parse the JSON only if there is text to parse.
    data = responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    // If parsing fails, leave data as null.
    data = null;
  }

  // If the HTTP response is not successful, create a friendlier error.
  if (!response.ok) {
    // Pull the most useful error message available from the payload or status code.
    const errorMessage =
      data?.error?.details ||
      data?.error?.message ||
      `API request failed with status ${response.status}`;
    // Build a regular Error object with that message.
    const requestError = new Error(errorMessage);
    // Store the HTTP status code on the error for troubleshooting.
    requestError.status = response.status;
    // Store the parsed payload too for deeper debugging if needed later.
    requestError.payload = data;
    // Throw the error so the caller can handle it.
    throw requestError;
  }

  // Return the parsed API payload for successful responses.
  return data;
}

// Convert the API timestamp into a YYYY-MM-DD label for status text.
function getLastUpdatedLabel(payload) {
  // If the API includes a last_updated timestamp, convert it into an ISO date.
  if (payload?.last_updated) {
    return new Date(payload.last_updated * 1000).toISOString().split("T")[0];
  }

  // Fall back to today's date when no timestamp is available.
  return todayIsoDate;
}

// Main converter workflow that reads user input, fetches rates, and updates the UI.
async function runConversion() {
  // Make sure the quick target labels reflect the active target currency.
  updateQuickTargetState();

  // Stop early if the API key is missing.
  if (!abstractApiKey) {
    // Keep the converted field empty instead of showing a noisy placeholder.
    convertedValueInput.value = "";
    // Tell the user what is missing.
    updateConverterStatus(
      "Add your Abstract Exchange Rates API key in index.html before live conversion can run.",
    );
    // Exit the function because the request cannot work without a key.
    return;
  }

  // Read the amount entered by the user.
  const amount = getSafeAmount();

  // Stop if the amount is invalid.
  if (!amount) {
    // Clear the result field.
    convertedValueInput.value = "";
    // Explain what the user needs to fix.
    updateConverterStatus(
      "Enter an amount greater than 0 to calculate the exchange rate.",
    );
    // Exit the function.
    return;
  }

  // If the user picked the same source and target currency, we can skip the API.
  if (fromCurrencySelect.value === toCurrencySelect.value) {
    // Show the same amount using the selected currency format.
    convertedValueInput.value = formatMoney(amount, toCurrencySelect.value);
    // Let the user know this is a one-to-one match.
    updateConverterStatus(
      `1 ${fromCurrencySelect.value} = 1 ${toCurrencySelect.value}`,
    );
    // Exit early because no network request is needed.
    return;
  }

  // Show a loading placeholder while the request is running.
  convertedValueInput.value = "Loading...";

  // Tell the user that a live rate is being loaded.
  updateConverterStatus(
    `Loading live ${fromCurrencySelect.value} to ${toCurrencySelect.value} rate...`,
  );

  // Start the asynchronous request workflow.
  try {
    // Fetch the live rate payload from Abstract.
    const data = await fetchConversion();
    // Pull the selected target rate out of the exchange_rates object.
    const exchangeRate = Number(data?.exchange_rates?.[toCurrencySelect.value]);

    // Guard against malformed or missing rate values.
    if (!Number.isFinite(exchangeRate)) {
      throw new Error(
        "The live API response did not include a usable exchange rate.",
      );
    }

    // Multiply the entered amount by the live exchange rate.
    const convertedAmount = amount * exchangeRate;
    // Show the converted result in the readonly field.
    convertedValueInput.value = formatMoney(
      convertedAmount,
      toCurrencySelect.value,
    );
    // Show a compact status message describing the rate used.
    updateConverterStatus(
      `1 ${fromCurrencySelect.value} = ${formatMoney(exchangeRate, toCurrencySelect.value)} on ${getLastUpdatedLabel(data)}.`,
    );
  } catch (error) {
    // Log the real error to the console for debugging.
    console.error("Currency conversion failed:", error);
    // Show a visible failure message in the result field.
    convertedValueInput.value = "Unavailable";
    // Show a friendlier explanation under the converter.
    updateConverterStatus(
      "Live conversion could not be loaded right now. Check your API key, date, or network connection.",
    );
  }
}

// Delay conversion slightly while the user is typing so the UI feels smoother.
function scheduleConversion() {
  // Clear any pending timer from a previous keystroke.
  window.clearTimeout(conversionTimer);
  // Start a fresh short timer before running the conversion.
  conversionTimer = window.setTimeout(runConversion, 300);
}

// Fill the small bottom text row with the exact quick targets used in the design.
function initializeQuickTargets() {
  // These are the three labels shown at the bottom of the card.
  const quickTargets = ["EUR", "GBP", "BTC"];

  // Apply those values to the visible quick target elements.
  quickTargets.forEach((code, index) => {
    // Only update the element if it exists.
    if (quickTargetButtons[index]) {
      // Store the target code in a data attribute for click handling.
      quickTargetButtons[index].dataset.currency = code;
      // Show the code as visible text.
      quickTargetButtons[index].textContent = code;
    }
  });
}

// Prevent the hero form from refreshing the page when submitted.
if (heroForm) {
  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

// Attach the mobile menu toggle only when both elements are present.
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    // Animate the hamburger icon into or out of its active state.
    toggle.classList.toggle("active");
    // Open or close the mobile menu panel.
    menu.classList.toggle("active");
  });
}

// Fill the source currency dropdown and default it to USD.
populateCurrencySelect(fromCurrencySelect, "USD");
// Fill the target currency dropdown and default it to CAD.
populateCurrencySelect(toCurrencySelect, "CAD");
// Apply the bottom quick target labels.
initializeQuickTargets();
// Set the date input to today for a polished default value.
setDateToToday();
// Sync the quick target active styles with the current target dropdown.
updateQuickTargetState();

// Recalculate shortly after the user changes the amount.
amountInput?.addEventListener("input", scheduleConversion);
// Recalculate immediately when the source currency changes.
fromCurrencySelect?.addEventListener("change", runConversion);
// Recalculate immediately when the target currency changes.
toCurrencySelect?.addEventListener("change", runConversion);
// Keep the date field in the design, but explain that live mode ignores it.
dateValueInput?.addEventListener("change", () => {
  updateConverterStatus(
    "Abstract live rates use the latest available rate. The date field is display-only in this mode.",
  );
});
// Allow manual refresh of the latest live rate.
refreshRateButton?.addEventListener("click", runConversion);

// Open the browser's native date picker when the date icon is clicked.
datePickerTrigger?.addEventListener("click", () => {
  // Use the modern showPicker API when available.
  if (typeof dateValueInput.showPicker === "function") {
    dateValueInput.showPicker();
    return;
  }

  // Fall back to focusing the input if showPicker is not supported.
  dateValueInput.focus();
});

// Let the bottom quick target labels switch the target currency when possible.
quickTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // If the quick label points to a currency not in the dropdown, explain why it cannot be used.
    if (!supportedCurrencies.includes(button.dataset.currency)) {
      updateConverterStatus(
        `${button.dataset.currency} is not available in this fiat exchange list. Choose another target currency.`,
      );
      return;
    }

    // Update the target dropdown to the chosen quick target.
    toCurrencySelect.value = button.dataset.currency;
    // Run a new conversion immediately.
    runConversion();
  });
});

// Perform an initial conversion so the card is populated as soon as the page loads.
runConversion();
