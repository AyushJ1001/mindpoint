# Therapy Session Pricing System

## Overview

The therapy session pricing system has been updated to use database values instead of hardcoded prices. The system now dynamically loads pricing information from the database and displays it in the Choose Plan section.

## Database Structure

### Course Variants

Each therapy session type has multiple variants in the database, differentiated by:

- **Session Count**: 1, 3, 6 sessions (or any other counts as needed)
- **Price**: Base price for the Express (affordable) plan
- **Plan Calculation**: Connection (premium) plan is automatically 1.5x the base price

### Database Schema

The `courses` table includes:

- `name`: Course name (e.g., "Individual Therapy - 1 Session")
- `description`: Course description
- `type`: Set to "therapy"
- `sessions`: Number of sessions (1, 3, 6, etc.)
- `price`: **Total price for all sessions** (not per session)
- Other standard course fields

## Plan Types

### Connection (Premium)

- **Description**: Premium therapy with senior experts
- **Features**:
  - Connect with senior experts
  - Get a therapist in 60 mins
  - Session duration ~60 mins
- **Pricing**: Higher price point for premium service

### Express (Affordable)

- **Description**: Quick therapy at affordable rates
- **Features**:
  - Start at lower prices
  - Get a therapist in 24–36 hrs
  - Session duration ~40 mins
- **Pricing**: Lower price point for quick access

## Implementation Details

### Component Structure

1. **TherapyCourse**: Receives course and variants data
2. **ChoosePlan**: Processes variants and displays pricing plans
3. **CourseTypeRenderer**: Passes variants to TherapyCourse

### Pricing Logic

The system uses a simplified pricing approach:

1. **Base Prices**: Database prices are total prices for all sessions, converted to per-session prices
2. **Premium Pricing**: Connection (premium) plan prices are automatically calculated as 1.2x the base per-session prices
3. **Dynamic Session Options**: Session counts are extracted from the database variants
4. **Validity Periods**: Automatically calculated based on session count (1 session = 10 days, multiple sessions = session count × 30 days)

### Session Options

The system dynamically loads session options from the database. Common options include:

- **1 Session**: Single therapy session
- **3 Sessions**: Short-term therapy package
- **6 Sessions**: Extended therapy package

_Note: The actual session options depend on the variants available in the database for each therapy course._

## Testing

### Creating Test Data

Use the `createTherapyCourseVariants` mutation to create test data:

```typescript
// This creates 6 therapy course variants:
// - Connection: 1, 4, 7 sessions
// - Express: 1, 4, 7 sessions
```

### Expected Behavior

1. Variants are automatically categorized into Connection/Express plans
2. Prices are displayed per session
3. Total cost is calculated (price × session count)
4. Validity periods are shown for each option

## Future Enhancements

1. **Dynamic Validity**: Store validity periods in database
2. **Plan Features**: Store plan features in database
3. **Custom Session Counts**: Support for more session count options
4. **Regional Pricing**: Support for different pricing by region

## Usage

When a user visits a therapy course page:

1. The system fetches the course and its variants
2. Variants are processed and categorized into plans
3. The Choose Plan section displays dynamic pricing
4. Users can select session count and plan type
5. Booking functionality uses the selected variant's data
