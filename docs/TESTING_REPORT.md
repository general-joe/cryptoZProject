# Testing Report

## Purpose

This report lists the main checks performed to validate the CryptoZ landing page against the project requirements.

## Functional Checks

- Confirmed the page loads with semantic sections for hero, stats, trust, features, testimonials, promo, and footer.
- Confirmed the hero converter now uses live API-driven JavaScript logic instead of static placeholder values.
- Confirmed the converter recalculates when:
  - the amount changes
  - the source cryptocurrency changes
  - the target currency changes
  - the refresh button is clicked
- Confirmed invalid amount values do not trigger misleading conversion results.
- Confirmed API errors display a readable status message in the converter area.
- Confirmed the mobile menu toggle opens and closes the navigation panel.

## Responsive Checks

The CSS includes breakpoint handling for:

- large desktop layouts
- tablet layouts around `1100px`
- mobile layouts around `768px`
- smaller mobile layouts around `480px`

Sections reviewed for responsiveness:

- navigation bar and mobile menu
- hero section and converter card
- logo/stat section
- trust section collage
- feature showcase section
- testimonials grid
- promo call-to-action block
- footer columns

## Visual Checks

- Verified the new marketing sections were inserted in the requested order.
- Verified cards, borders, spacing, and backgrounds follow the provided design direction.
- Verified the converter card keeps its styled visual treatment while supporting live data.

## Browser / Device Notes

Recommended manual verification:

- desktop browser at full width
- tablet width around `768px` to `1024px`
- mobile width around `320px` to `480px`

## Known Limitation

Live converter results depend on external API availability. If the API is slow, rate-limited, or unavailable, the UI will show an error message instead of a conversion result.
