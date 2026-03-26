# CryptoZ Landing Page

CryptoZ is a responsive cryptocurrency landing page built with HTML, CSS, and JavaScript. The hero section now includes an exchange-rate converter powered by the Abstract Exchange Rates API.

## Features

- responsive marketing landing page
- searchable source-currency picker on the left side of the `Amount` field
- right-side amount entry for the selected source currency
- searchable target-currency picker on the left side of the `Converted to` field
- converted value displayed on the right side of the target field
- date-based conversion using Abstract's historical `date` parameter
- mobile navigation toggle

## Tech Stack

- `HTML5`
- `CSS3`
- `JavaScript (ES6+)`
- `Abstract Exchange Rates API`

## Project Structure

```text
cryptoZProject/
├── assets/
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── TESTING_REPORT.md
├── index.html
├── style.css
├── script.js
└── README.md
```

## How To Run

1. Open `index.html` in a browser.
2. Add your Abstract Exchange Rates API key to the `abstract-api-key` meta tag in `index.html`.
3. Keep internet access enabled so the converter can fetch live or historical rates.

## API Reference

- https://docs.abstractapi.com/exchange-rates/convert

## Notes

- The converter builds its currency list from `Intl.supportedValuesOf("currency")` when available, with a fallback list for older environments.
- If the API key is missing, the converter shows a helpful setup message instead of failing silently.
