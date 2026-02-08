
# Plan: Harmonize Profile Page Colors with Settings Page Design

## Problem Identified
The Profile page uses a different color scheme than the Settings page, creating visual inconsistency. Looking at both screens:
- **Settings page** follows a structured color pattern by item category
- **Profile page** uses arbitrary color assignments that don't follow the same semantic logic

## Solution Approach
Align the Profile page's icon colors with a consistent semantic color scheme that matches the established Settings page patterns, organized by item purpose.

## Color Mapping Strategy

### Your Activity Section
| Item | Current Colors | Proposed Colors | Rationale |
|------|---------------|-----------------|-----------|
| Total Tests | Blue bg + Blue icon | Blue bg + Blue icon | Keep - represents data/stats |
| Average Rating | Green bg + Green icon | Blue bg + Blue icon | Match Total Tests - both are stats |
| Member Since | Purple bg + Purple icon | Green bg + Green icon | Match Country (location/profile info) |

### Quick Actions Section
| Item | Current Colors | Proposed Colors | Rationale |
|------|---------------|-----------------|-----------|
| My Results | Orange bg + Orange icon | Indigo bg + Indigo icon | Match FAQ (viewing content) |
| Add Test | Indigo bg + Indigo icon | Orange bg + Orange icon | Match Notifications (action-oriented) |

## Technical Changes

**File: `src/components/profile/ProfileContent.tsx`**

Update the color definitions for mobile stats and action items (lines 92-135):

```tsx
const statsItems: MobileMenuItem[] = [
  {
    icon: TrendingUp,
    iconBgColor: "#dbeafe",  // blue-100 (unchanged)
    iconColor: "#2563eb",    // blue-600 (unchanged)
    title: "Total Tests",
    value: totalTests.toString(),
  },
  {
    icon: TrendingUp,
    iconBgColor: "#dbeafe",  // Changed from green to blue
    iconColor: "#2563eb",    // Match Total Tests - both are stats
    title: "Average Rating",
    value: avgRating,
  },
  {
    icon: Calendar,
    iconBgColor: "#dcfce7",  // Changed from purple to green
    iconColor: "#16a34a",    // Match Country setting
    title: "Member Since",
    value: memberSince,
  },
];

const actionItems: MobileMenuItem[] = [
  {
    icon: ListPlus,
    iconBgColor: "#e0e7ff",  // Changed from orange to indigo
    iconColor: "#4f46e5",    // Match FAQ (viewing/reading content)
    title: "My Results",
    // ...
  },
  {
    icon: PlusCircle,
    iconBgColor: "#ffedd5",  // Changed from indigo to orange
    iconColor: "#ea580c",    // Match Notifications (action/alert oriented)
    title: "Add Test",
    // ...
  },
];
```

## Visual Consistency Achieved
After these changes:
- **Blue icons** = Data/statistics (Total Tests, Average Rating)
- **Green icons** = Profile/location info (Member Since, Country)
- **Orange icons** = Primary actions (Add Test, Notifications)
- **Indigo icons** = View/browse content (My Results, FAQ)
- **Purple icons** = Security-related (Security setting only)
- **Yellow icons** = Support/help (Contact)

## Impact
- Single file change: `src/components/profile/ProfileContent.tsx`
- No new dependencies
- Maintains the established design patterns from the Settings page
