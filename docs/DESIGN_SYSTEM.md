# Design System

This document defines the visual design language and component guidelines for Stride.

## Brand Identity

### Name & Tagline
- **Name**: Stride
- **Tagline**: "Navigate smarter. Drive smoother."
- **Voice**: Confident, helpful, modern
- **Tone**: Friendly but professional, tech-forward

### Brand Values
- **Smart**: Intelligent routing and AI-powered features
- **Smooth**: Focus on driving comfort and quality
- **Community**: Built by drivers, for drivers
- **Reliable**: Accurate data and consistent performance

## Color Palette

### Primary Colors

#### Primary Blue
- **Main**: `#2196F3` - Primary actions, links, active states
- **Light**: `#64B5F6` - Hover states, backgrounds
- **Dark**: `#1976D2` - Active/pressed states
- **Lighter**: `#BBDEFB` - Subtle backgrounds

Usage: Primary buttons, navigation elements, map route lines

#### Success Green
- **Main**: `#4CAF50` - Success states, confirmations
- **Light**: `#81C784` - Hover states
- **Dark**: `#388E3C` - Active states
- **Lighter**: `#C8E6C9` - Success backgrounds

Usage: Verified obstacles, successful actions, positive feedback

#### Warning Orange
- **Main**: `#FF9800` - Warning states, moderate severity
- **Light**: `#FFB74D` - Hover states
- **Dark**: `#F57C00` - Active states
- **Lighter**: `#FFE0B2` - Warning backgrounds

Usage: Medium severity obstacles, caution messages

#### Danger Red
- **Main**: `#F44336` - Errors, high severity, destructive actions
- **Light**: `#E57373` - Hover states
- **Dark**: `#D32F2F` - Active states
- **Lighter**: `#FFCDD2` - Error backgrounds

Usage: High severity obstacles, errors, delete actions

### Neutral Colors

#### Grays
- **Gray 900**: `#212121` - Primary text
- **Gray 800**: `#424242` - Secondary text
- **Gray 700**: `#616161` - Tertiary text
- **Gray 600**: `#757575` - Disabled text
- **Gray 500**: `#9E9E9E` - Icons, borders
- **Gray 400**: `#BDBDBD` - Dividers
- **Gray 300**: `#E0E0E0` - Light borders
- **Gray 200**: `#EEEEEE` - Background accents
- **Gray 100**: `#F5F5F5` - Light backgrounds
- **Gray 50**: `#FAFAFA` - Page backgrounds

### Semantic Colors

#### Info Blue
- **Main**: `#2196F3` - Same as primary
- **Light**: `#64B5F6`

#### Premium Gold
- **Main**: `#FFD700` - Premium badges, features
- **Light**: `#FFE55C`
- **Dark**: `#FFC400`

Usage: Premium tier indicators, verified badges, achievements

### Obstacle Type Colors

For map markers and obstacle categories:

- **Speed Bump**: `#FF9800` (Warning Orange)
- **Pothole**: `#F44336` (Danger Red)
- **Rough Road**: `#FF6F00` (Deep Orange)
- **Construction**: `#FFC107` (Amber)
- **Flooding**: `#03A9F4` (Light Blue)
- **Railroad**: `#9E9E9E` (Gray)
- **Steep Grade**: `#795548` (Brown)

## Typography

### Font Families

#### Mobile (React Native)
- **iOS**: SF Pro Display, SF Pro Text (system)
- **Android**: Roboto (system)
- **Fallback**: System default

#### Web
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace**: "Roboto Mono", "Courier New", monospace

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis, labels
- **Semibold**: 600 - Headings, buttons
- **Bold**: 700 - Strong emphasis, titles

### Type Scale

#### Mobile
```
Display: 34px / 41px (34pt)
Title 1: 28px / 34px (28pt)
Title 2: 22px / 28px (22pt)
Title 3: 20px / 25px (20pt)
Headline: 17px / 22px (17pt, Semibold)
Body: 17px / 22px (17pt)
Callout: 16px / 21px (16pt)
Subheadline: 15px / 20px (15pt)
Footnote: 13px / 18px (13pt)
Caption 1: 12px / 16px (12pt)
Caption 2: 11px / 13px (11pt)
```

#### Web
```
h1: 48px / 56px (Bold)
h2: 36px / 44px (Bold)
h3: 28px / 36px (Semibold)
h4: 24px / 32px (Semibold)
h5: 20px / 28px (Semibold)
h6: 18px / 26px (Semibold)
Body Large: 18px / 28px
Body: 16px / 24px
Body Small: 14px / 20px
Caption: 12px / 16px
```

### Text Colors

- **Primary**: Gray 900 (`#212121`)
- **Secondary**: Gray 800 (`#424242`)
- **Tertiary**: Gray 700 (`#616161`)
- **Disabled**: Gray 600 (`#757575`)
- **Link**: Primary Blue (`#2196F3`)
- **Error**: Danger Red (`#F44336`)

## Spacing System

Based on 4px grid system:

```
xs: 4px   (0.25rem)
sm: 8px   (0.5rem)
md: 16px  (1rem)
lg: 24px  (1.5rem)
xl: 32px  (2rem)
2xl: 40px (2.5rem)
3xl: 48px (3rem)
4xl: 64px (4rem)
```

### Application
- Component padding: 16px (md)
- Section spacing: 32px (xl)
- Page margins: 16px mobile, 24px tablet, 32px desktop
- Button padding: 12px vertical, 24px horizontal
- Input padding: 12px vertical, 16px horizontal

## Border Radius

```
none: 0px
sm: 4px    - Small elements, tags
md: 8px    - Buttons, cards
lg: 12px   - Large cards, modals
xl: 16px   - Hero sections
full: 9999px - Pills, circular elements
```

## Shadows

### Mobile (iOS-style)
```
sm: 0 1px 3px rgba(0,0,0,0.12)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.1)
```

### Web (Material-style)
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px -1px rgba(0,0,0,0.1)
lg: 0 10px 15px -3px rgba(0,0,0,0.1)
xl: 0 20px 25px -5px rgba(0,0,0,0.1)
2xl: 0 25px 50px -12px rgba(0,0,0,0.25)
```

## Component Guidelines

### Buttons

#### Primary Button
- Background: Primary Blue (`#2196F3`)
- Text: White
- Padding: 12px vertical, 24px horizontal
- Border radius: 8px
- Font: 16px, Semibold
- Shadow: md

States:
- Hover: Background → `#1976D2`
- Active: Background → `#1565C0`
- Disabled: Background → Gray 300, Text → Gray 600

#### Secondary Button
- Background: Transparent
- Text: Primary Blue
- Border: 2px solid Primary Blue
- Padding: 10px vertical, 22px horizontal
- Other: Same as primary

#### Text Button
- Background: Transparent
- Text: Primary Blue
- Padding: 8px vertical, 16px horizontal
- No border or shadow

#### Destructive Button
- Background: Danger Red (`#F44336`)
- Text: White
- Other: Same as primary

### Input Fields

#### Text Input
- Border: 1px solid Gray 400
- Border radius: 8px
- Padding: 12px vertical, 16px horizontal
- Font: 16px
- Background: White

States:
- Focus: Border → Primary Blue (2px), Shadow → sm
- Error: Border → Danger Red, Helper text → Danger Red
- Disabled: Background → Gray 100, Text → Gray 600

#### Search Input
- Icon: Magnifying glass (left side)
- Clear button: X icon (right side, when text present)
- Border radius: full (pill shape)
- Other: Same as text input

### Cards

#### Standard Card
- Background: White
- Border radius: 12px
- Padding: 16px
- Shadow: md
- Border: 1px solid Gray 200 (optional)

#### Obstacle Card
- Avatar: Obstacle type icon (left)
- Title: Obstacle type (16px, Semibold)
- Subtitle: Distance, severity, votes
- Actions: Vote buttons, details link
- Padding: 12px

### Navigation

#### Bottom Tab Bar (Mobile)
- Height: 56px + safe area
- Background: White
- Shadow: lg (top only)
- Items: Icon + label
- Active color: Primary Blue
- Inactive color: Gray 600

#### Top Navigation Bar
- Height: 56px + status bar
- Background: White
- Shadow: sm
- Title: 20px, Semibold, centered
- Left action: Back arrow or menu
- Right action: Icon button

### Map Elements

#### Route Line
- Color: Primary Blue (`#2196F3`)
- Width: 6px
- Opacity: 0.8
- Alternative route: Gray 500, 4px, 0.6 opacity

#### Obstacle Markers
- Size: 40x40px
- Shape: Circle
- Color: Based on obstacle type
- Icon: White, 24x24px
- Border: 2px white
- Shadow: md

#### User Location
- Size: 20x20px
- Inner circle: Primary Blue
- Outer ring: Primary Blue 20% opacity (pulse animation)
- Accuracy circle: Primary Blue 10% opacity

#### Destination Marker
- Size: 48x48px
- Shape: Pin/teardrop
- Color: Success Green
- Icon: Flag or destination icon

### Modals & Dialogs

#### Modal
- Background: White
- Border radius: 16px (top corners)
- Shadow: 2xl
- Backdrop: Black 40% opacity
- Animation: Slide up from bottom

#### Alert Dialog
- Max width: 320px
- Padding: 24px
- Border radius: 12px
- Title: 20px, Semibold
- Message: 16px, Gray 800
- Buttons: Right-aligned, horizontal

### Lists

#### List Item
- Height: 56px minimum
- Padding: 12px 16px
- Divider: 1px Gray 200
- Left icon: 24x24px, Gray 600
- Right chevron: 20x20px, Gray 500

#### Section Header
- Height: 32px
- Padding: 8px 16px
- Background: Gray 50
- Text: 14px, Semibold, Gray 700, uppercase

### Badges & Pills

#### Badge (Notification)
- Size: 20px circle (or auto width)
- Background: Danger Red
- Text: White, 12px, Bold
- Position: Top-right corner

#### Status Pill
- Padding: 4px 12px
- Border radius: full
- Font: 12px, Semibold
- Colors:
  - Active: Success Green background, Dark Green text
  - Pending: Warning Orange background, Dark Orange text
  - Resolved: Gray 300 background, Gray 800 text

#### Premium Badge
- Background: Premium Gold gradient
- Icon: Crown or star
- Text: "Premium", 12px, Bold, White
- Border: 1px solid darker gold

## Icon System

### Icon Library
- **Mobile**: react-native-vector-icons (Material Icons)
- **Web**: Heroicons or Material Icons

### Icon Sizes
- **xs**: 16x16px - Inline with text
- **sm**: 20x20px - List items
- **md**: 24x24px - Standard buttons, navigation
- **lg**: 32x32px - Featured actions
- **xl**: 48x48px - Large headers, empty states

### Common Icons
- Navigation: arrow-back, menu, close
- Actions: add, edit, delete, share, favorite
- Map: location, navigation, map, compass
- Obstacles: warning, construction, car-crash
- Social: thumb-up, thumb-down, comment, person
- Status: check, close, info, warning, error

## Map Styling

### Light Mode (Default)

#### Base Map
- Water: `#AAD3DF`
- Land: `#F2EFE9`
- Parks: `#C8E6C9`
- Buildings: `#E0E0E0`
- Roads (major): `#FFFFFF`
- Roads (minor): `#F5F5F5`
- Road borders: `#BDBDBD`

#### Labels
- Major roads: Gray 900, 14px
- Minor roads: Gray 700, 12px
- POIs: Gray 800, 12px
- Cities: Gray 900, 16px, Bold

### Dark Mode

#### Base Map
- Water: `#1A2B3C`
- Land: `#1C1C1E`
- Parks: `#2C4A3F`
- Buildings: `#2C2C2E`
- Roads (major): `#3A3A3C`
- Roads (minor): `#2C2C2E`
- Road borders: `#48484A`

#### Labels
- Major roads: Gray 100, 14px
- Minor roads: Gray 300, 12px
- POIs: Gray 200, 12px
- Cities: Gray 100, 16px, Bold

#### UI Adjustments
- Route line: Lighter blue (`#42A5F5`)
- Obstacle markers: Brighter colors
- Cards: Dark gray background (`#1C1C1E`)

## Accessibility

### Color Contrast

All text must meet WCAG 2.1 AA standards:
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Touch Targets

Minimum touch target sizes:
- Mobile: 44x44pt (iOS), 48x48dp (Android)
- Web: 44x44px

### Focus Indicators

- Visible focus ring: 2px Primary Blue
- Offset: 2px from element
- Border radius: Matches element

### Screen Reader Support

- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive labels for all interactive elements
- Alternative text for all images
- Semantic HTML elements

## Animations & Transitions

### Duration
- **Instant**: 100ms - Micro-interactions
- **Fast**: 200ms - Button states, hover
- **Normal**: 300ms - Modal, drawer, transitions
- **Slow**: 500ms - Page transitions, complex animations

### Easing
- **Standard**: cubic-bezier(0.4, 0.0, 0.2, 1) - Most transitions
- **Decelerate**: cubic-bezier(0.0, 0.0, 0.2, 1) - Enter screen
- **Accelerate**: cubic-bezier(0.4, 0.0, 1, 1) - Exit screen
- **Sharp**: cubic-bezier(0.4, 0.0, 0.6, 1) - Temporary elements

### Common Animations

#### Button Press
- Scale: 0.98
- Duration: 100ms
- Easing: Standard

#### Modal Enter
- Transform: translateY(100%) → translateY(0)
- Opacity: 0 → 1
- Duration: 300ms
- Easing: Decelerate

#### Fade
- Opacity: 0 → 1 or 1 → 0
- Duration: 200ms
- Easing: Standard

#### Slide
- Transform: translateX(-100%) → translateX(0)
- Duration: 300ms
- Easing: Decelerate

## Responsive Breakpoints

### Mobile
- **Phone**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Layout Adjustments

#### Phone (< 768px)
- Single column layout
- Bottom navigation
- Hamburger menu
- Full-width cards

#### Tablet (768px - 1024px)
- Two-column layout (where appropriate)
- Side navigation option
- Larger map view
- Cards in grid (2 per row)

#### Desktop (> 1024px)
- Three-column layout
- Persistent sidebar
- Larger map with side panel
- Cards in grid (3-4 per row)
- Hover states more prominent

## Platform-Specific Considerations

### iOS
- Use SF Symbols where possible
- Follow iOS HIG
- Native gestures (swipe back, pull to refresh)
- Bottom tab bar for navigation
- Large titles in navigation bar

### Android
- Use Material Icons
- Follow Material Design 3
- Floating action button (FAB)
- Bottom navigation or drawer
- Standard app bar

### Web
- Keyboard navigation support
- Hover states
- Responsive layouts
- Progressive enhancement
- Print styles (for analytics/reports)

## Empty States

### No Data
- Icon: 48x48px, Gray 400
- Title: 18px, Semibold, Gray 900
- Message: 14px, Gray 700
- Action button: Primary (if applicable)
- Padding: 48px vertical

### Error State
- Icon: 48x48px, Danger Red
- Title: 18px, Semibold, Gray 900
- Message: 14px, Gray 700
- Action button: "Try Again" (Primary)
- Padding: 48px vertical

### Loading State
- Skeleton screens (preferred)
- Or spinner: Primary Blue, 32x32px
- Centered vertically and horizontally

## Component Library

Recommended implementation approach:

### Mobile
- Custom components with StyleSheet
- Reusable primitive components
- Theming with Context API
- Consistent prop interfaces

### Web
- TailwindCSS utility classes
- Custom component library
- CSS modules for complex components
- Storybook for documentation (future)

## Design Tokens

Export design tokens for easy maintenance:

```javascript
// tokens.js
export const colors = {
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  // ... more colors
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  // ... more spacing
};

export const typography = {
  h1: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
  },
  // ... more typography
};
```

## Future Considerations

- Dark mode throughout (planned Phase 2)
- Custom theme builder for premium users
- Accessibility improvements (voice control)
- Animation library for consistent motion
- Component library documentation site
- Design system versioning
