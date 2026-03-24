# API Documentation

## Chosen API

This project uses the CoinGecko Simple Price API.

Official documentation:

- https://docs.coingecko.com/v3.0.1/reference/simple-price

## Why This API Was Chosen

- it is widely used for cryptocurrency price data
- it supports direct price lookup by coin ID
- it can return values in multiple fiat currencies
- it is simple enough for a frontend landing page demo

## Endpoint Used

```text
GET https://api.coingecko.com/api/v3/simple/price
```

## Query Parameters Used

- `ids`: the cryptocurrency ID, for example `bitcoin`
- `vs_currencies`: the target currency code, for example `usd`
- `include_last_updated_at=true`: returns the timestamp of the latest update

## Example Request

```text
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true
```

## Example Response

```json
{
  "bitcoin": {
    "usd": 67187.3358936566,
    "last_updated_at": 1711356300
  }
}
```

## How It Works In This Project

1. The user enters an amount.
2. The user selects a source cryptocurrency.
3. The user selects a target fiat currency.
4. `script.js` sends a request to the CoinGecko API.
5. The script multiplies the entered amount by the returned live rate.
6. The converted result and latest update message are shown in the converter UI.

## Files That Use The API

- `script.js`

## Error Handling

The implementation handles these cases:

- empty or invalid amount input
- network failure
- non-200 API response
- missing rate data in the API response

When any of these issues happen, the UI shows a helpful status message instead of silently failing.

## Important Note

CoinGecko may apply rate limits or change access requirements over time. If public unauthenticated access becomes restricted, the project may need to be updated to use CoinGecko's demo or authenticated access pattern.
