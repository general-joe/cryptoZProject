# CryptoZ Landing Page

CryptoZ is a fully responsive cryptocurrency landing page built with HTML, CSS, and JavaScript. The project includes a live currency converter in the hero section, branded marketing sections, responsive layouts, and supporting documentation for API usage and testing.

## Project Summary

This project was built to satisfy the following goals:

- create a modern cryptocurrency landing page
- integrate a real-time currency converter using a public API
- make the website responsive across desktop, tablet, and mobile screen sizes
- keep the code organized, commented, and easy to learn from

## Features

- semantic HTML5 structure
- responsive layouts using CSS Grid, Flexbox, and media queries
- real-time crypto-to-fiat conversion in the hero section
- error handling and loading states for failed API requests
- interactive mobile navigation menu
- section-by-section comments in the source code for learning purposes

## Tech Stack

- `HTML5`
- `CSS3`
- `JavaScript (ES6+)`
- `CoinGecko Simple Price API`

## Live Converter

The converter currently supports these source cryptocurrencies:

- Bitcoin (`BTC`)
- Ethereum (`ETH`)
- Solana (`SOL`)
- Binance Coin (`BNB`)
- Cardano (`ADA`)
- Dogecoin (`DOGE`)

It converts them into these target currencies:

- `USD`
- `EUR`
- `GBP`
- `AUD`
- `CAD`
- `NGN`

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

1. Clone or download the project.
2. Open `index.html` in a browser.
3. Make sure you have internet access so the live currency converter can fetch exchange rates.

No build step or package installation is required.

## Notes About The API

The converter uses CoinGecko's `simple/price` endpoint to fetch live market prices.

Reference:

- [CoinGecko Simple Price API](https://docs.coingecko.com/v3.0.1/reference/simple-price)

If CoinGecko changes its public access or rate-limits your requests, you may need to update the implementation to use a demo or API key.

## Deliverables Included

- source code: `index.html`, `style.css`, `script.js`
- API notes: [docs/API_DOCUMENTATION.md](/d:/allMyProject_Current/cryptoZProject/docs/API_DOCUMENTATION.md)
- testing notes: [docs/TESTING_REPORT.md](/d:/allMyProject_Current/cryptoZProject/docs/TESTING_REPORT.md)

## What To Review

If you are reviewing this project against the brief, the most relevant areas are:

- `index.html` for semantic page structure
- `style.css` for responsive layouts and visual design
- `script.js` for API integration, error handling, and dynamic UI updates
