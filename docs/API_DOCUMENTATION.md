# API Documentation

## Chosen API

This project now uses the Abstract Exchange Rates API.

Official documentation:

- https://docs.abstractapi.com/exchange-rates/convert

## Why This API Was Chosen

- it supports fiat currency conversion with a simple REST endpoint
- it accepts a historical `date` value for date-based conversion
- it returns both the converted amount and the exchange rate used
- it fits a lightweight frontend-only demo

## Endpoint Used

```text
GET https://exchange-rates.abstractapi.com/v1/convert
```

## Query Parameters Used

- `api_key`: your Abstract Exchange Rates API key
- `base`: the source currency code, for example `USD`
- `target`: the destination currency code, for example `EUR`
- `base_amount`: the number the user entered
- `date`: an optional historical date in `YYYY-MM-DD` format

## Example Request

```text
https://exchange-rates.abstractapi.com/v1/convert?api_key=YOUR_API_KEY&base=USD&target=EUR&base_amount=125&date=2026-03-20
```

## Example Response

```json
{
  "base": "USD",
  "target": "EUR",
  "date": "2026-03-20",
  "base_amount": 125,
  "converted_amount": 115.420125,
  "exchange_rate": 0.923361,
  "last_updated": 1716297300
}
```

## How It Works In This Project

1. The user clicks the left side of the `Amount` field to open a searchable list of world currencies.
2. The user enters the source amount on the right side of the `Amount` field.
3. The user clicks the left side of the `Converted to` field to choose the destination currency.
4. The user can click the date control and choose a date for historical conversion.
5. `script.js` sends a request to Abstract's `convert` endpoint.
6. The converted value is rendered on the right side of the `Converted to` field.

## Files That Use The API

- `index.html`
- `script.js`

## Configuration

Add your key to the meta tag in `index.html`:

```html
<meta name="abstract-api-key" content="YOUR_ABSTRACT_API_KEY" />
```

## Error Handling

The implementation handles these cases:

- missing API key
- empty or invalid amount input
- unsupported or invalid API response
- failed network request
- historical date fetch problems

When any of these issues happen, the UI shows a status message below the converter.
