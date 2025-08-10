# Course Offer Functionality

## Overview

The course offer functionality allows courses to have time-limited promotional offers with discounts. When a valid offer exists, it displays the discounted price instead of the regular price, along with offer details and a countdown timer.

## Implementation Details

### Database Schema

Courses can have an optional `offer` field with the following structure:

```typescript
offer: {
  name: string,        // Name of the offer (e.g., "Early Bird Special")
  discount: number,    // Discount percentage (e.g., 20 for 20% off)
  startDate: string,   // Start date in YYYY-MM-DD format
  endDate: string      // End date in YYYY-MM-DD format
}
```

### Validation Logic

A course has a valid offer if:

1. The course has an `offer` field
2. Current date is between `startDate` and `endDate` (inclusive)

### Price Calculation

- **Original Price**: The course's base price
- **Discount Amount**: `(originalPrice * discount) / 100`
- **Offer Price**: `originalPrice - discountAmount`

### UI Display

When a valid offer exists:

1. **Main Price**: Shows the discounted offer price prominently
2. **Strikethrough Price**: Shows the original price with strikethrough
3. **Offer Name**: Displays the offer name next to "Inclusive of all taxes"
4. **Discount Badge**: Shows "🔥 X% OFF" with time remaining
5. **Countdown Timer**: Real-time countdown showing days, hours, and minutes left

### Real-time Updates

- The countdown timer updates every minute
- When the offer expires, it automatically switches back to showing the regular price
- Cart functionality uses the offer price when adding items

### Examples

#### Valid Offer (Active)

```
₹4,000          (offer price)
₹5,000          (strikethrough original price)
Inclusive of all taxes • Early Bird Special
🔥 20% OFF • 5d 12h 30m left
```

#### No Offer or Expired Offer

```
₹5,000          (regular price)
Inclusive of all taxes
```

## Testing

Use the test mutations in `convex/testOffer.ts`:

- `createTestCourseWithOffer`: Creates a course with an active offer
- `createTestCourseWithExpiredOffer`: Creates a course with an expired offer

## Cart Integration

When adding courses to cart:

1. Checks if the course has a valid offer
2. Uses the offer price if available, otherwise uses the regular price
3. Ensures consistent pricing throughout the checkout process
