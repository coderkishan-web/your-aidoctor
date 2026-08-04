# Hermes AI Design System

**Hermes AI** is an AI Personal Doctor platform. The design communicates trust, modern AI intelligence, premium quality, security, and minimalism. The aesthetic is enterprise-grade and scalable, drawing inspiration from industry leaders like OpenAI, Apple, Stripe, Linear, Notion, and Vercel.

## 1. Color System

The color system uses Tailwind-compatible values, ensuring WCAG AA compliance for accessibility.

### Primary Blue (Brand & Actions)
- `blue-50`: #F0F9FF
- `blue-100`: #E0F2FE
- `blue-200`: #BAE6FD
- `blue-300`: #7DD3FC
- `blue-400`: #38BDF8
- `blue-500`: #0EA5E9 (Base)
- `blue-600`: #0284C7
- `blue-700`: #0369A1
- `blue-800`: #075985
- `blue-900`: #0C4A6E
- `blue-950`: #082F49

### Secondary Blue (Supporting & Deep Actions)
- `slate-blue-500`: #334155 (Base)
- `slate-blue-900`: #0F172A

### Accent (AI Elements & Highlights)
- `indigo-500`: #6366F1 (Base)
- `violet-500`: #8B5CF6

### Neutral Gray Scale (Typography & Backgrounds)
- `gray-50`: #FAFAFA
- `gray-100`: #F4F4F5
- `gray-200`: #E4E4E7
- `gray-300`: #D4D4D8
- `gray-400`: #A1A1AA
- `gray-500`: #71717A
- `gray-600`: #52525B
- `gray-700`: #3F3F46
- `gray-800`: #27272A
- `gray-900`: #18181B
- `gray-950`: #09090B

### Semantic Colors
- **Success**: `emerald-500` (#10B981)
- **Warning**: `amber-500` (#F59E0B)
- **Error**: `red-500` (#EF4444)
- **Information**: `sky-500` (#0EA5E9)

### System Colors (Light / Dark)
- **Background**: `gray-50` / `gray-950`
- **Surface**: `#FFFFFF` / `gray-900`
- **Card**: `#FFFFFF` / `gray-900`
- **Border**: `gray-200` / `gray-800`
- **Divider**: `gray-200` / `gray-800`
- **Hover**: `gray-100` / `gray-800`
- **Focus**: Ring `blue-500`
- **Disabled**: `gray-300` / `gray-700`

## 2. Typography

**Font Family**: `Inter` (Primary, UI), `Geist` (Headings & AI Elements).

### Typography Scale
| Role | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display XL** | 72px (4.5rem) | Bold (700) | 1.1 | -0.02em |
| **Display L** | 60px (3.75rem) | Bold (700) | 1.1 | -0.02em |
| **Heading 1** | 48px (3rem) | SemiBold (600) | 1.2 | -0.02em |
| **Heading 2** | 36px (2.25rem) | SemiBold (600) | 1.2 | -0.01em |
| **Heading 3** | 30px (1.875rem) | SemiBold (600) | 1.3 | -0.01em |
| **Heading 4** | 24px (1.5rem) | Medium (500) | 1.4 | normal |
| **Heading 5** | 20px (1.25rem) | Medium (500) | 1.4 | normal |
| **Body Large** | 18px (1.125rem) | Regular (400) | 1.6 | normal |
| **Body** | 16px (1rem) | Regular (400) | 1.6 | normal |
| **Body Small** | 14px (0.875rem) | Regular (400) | 1.5 | normal |
| **Caption** | 12px (0.75rem) | Regular (400) | 1.5 | normal |
| **Label** | 12px (0.75rem) | Medium (500) | 1.4 | 0.05em (Uppercase) |
| **Button** | 14px (0.875rem) | Medium (500) | 1.5 | normal |

## 3. Spacing System

Based on an 8px grid system.

- `space-1`: 4px (0.25rem)
- `space-2`: 8px (0.5rem)
- `space-3`: 12px (0.75rem)
- `space-4`: 16px (1rem)
- `space-5`: 20px (1.25rem)
- `space-6`: 24px (1.5rem)
- `space-8`: 32px (2rem)
- `space-10`: 40px (2.5rem)
- `space-12`: 48px (3rem)
- `space-16`: 64px (4rem)
- `space-20`: 80px (5rem)
- `space-24`: 96px (6rem)
- `space-32`: 128px (8rem)

## 4. Border Radius

- **Buttons**: `6px` (Modern, slightly rounded)
- **Cards**: `12px` (Soft but structured)
- **Dialogs/Modals**: `16px` (Premium feel)
- **Inputs**: `6px` (Matches buttons)
- **Badges**: `9999px` (Fully rounded/Pill)
- **Images**: `8px` (Standard) or `12px` (Large hero images)

## 5. Shadow System

- **XS**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (Subtle borders/inputs)
- **SM**: `0 1px 3px 0 rgb(0 0 0 / 0.1)` (Buttons)
- **MD**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` (Cards)
- **LG**: `0 10px 15px -3px rgb(0 0 0 / 0.1)` (Dropdowns, Popovers)
- **XL**: `0 20px 25px -5px rgb(0 0 0 / 0.1)` (Modals)
- **Glass**: `inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.05)` (AI elements, overlays) - requires backdrop-blur.

## 6. Button System

### Variants
- **Primary**: Background `blue-500`, Text `white`. Hover: `blue-600`.
- **Secondary**: Background `gray-100`, Text `gray-900`. Hover: `gray-200`. (Dark mode: `gray-800` bg, `white` text).
- **Outline**: Background `transparent`, Border `gray-300`, Text `gray-700`. Hover: Background `gray-50`.
- **Ghost**: Background `transparent`, Text `gray-600`. Hover: Background `gray-100`, Text `gray-900`.
- **Danger**: Background `red-500`, Text `white`. Hover: `red-600`.
- **Success**: Background `emerald-500`, Text `white`. Hover: `emerald-600`.
- **Icon Button**: Ghost or Outline variant with a centralized icon.
- **Floating Button (FAB)**: Primary variant, rounded-full, Shadow LG.

### States
- **Hover**: Transition backgrounds/borders seamlessly.
- **Active**: Slight scale down (`scale-95`).
- **Focus**: `ring-2 ring-offset-2 ring-blue-500`.
- **Disabled**: Opacity 50%, `cursor-not-allowed`, grayscale if applicable.
- **Loading**: Show a spinner icon replacing the primary icon, maintain width, text "Loading...".

## 7. Form Components

- **Input**: Border `gray-200`, rounded `6px`, padding `12px 16px`, focus `ring-2 ring-blue-500`.
- **Textarea**: Same styling as input, resizable vertically.
- **Select**: Custom dropdown with shadow LG, elegant chevron icon.
- **Checkbox**: `blue-500` accent, rounded `4px`.
- **Radio**: `blue-500` accent, rounded full.
- **Toggle**: iOS-style smooth toggle, `blue-500` when active.
- **OTP**: 6 distinct square inputs, auto-focus next on type.
- **Search**: Left icon (magnifying glass), muted placeholder.
- **Date Picker**: Calendar dropdown, shadow LG, hover states on days.
- **Upload**: Dashed border `gray-300`, centered upload icon & text. Hover state with primary color border.
- **Password**: Toggle visibility icon (eye/eye-off) on the right.
- **Validation**: Error message in `red-500` (12px Caption) below input, border turns `red-500`.

## 8. Card System

- **Feature Card**: Icon top left, Title, Body text. Subtle hover lift (`-translate-y-1`, shadow MD to LG).
- **Disease Card**: Medical severity badge, Title, Description, "Read more" ghost button.
- **Blog Card**: Image top (rounded top 12px), tag, Title, snippet, author info.
- **Team Card**: Circular avatar, Name, Role, Social links.
- **Pricing Card**: Plan name, Price (Display scale), List of features (check icons), full-width Primary/Secondary button. Highlighted variant uses Accent border/ring.
- **Testimonial Card**: Quote icon, italicized text, user avatar, name, condition/role.
- **Dashboard Card**: Stat label, large number, trend indicator (Success/Error).
- **Statistic Card**: Clean layout, Number and Label.

## 9. Badges

Using Pill shape (`rounded-full`), small text (`12px` font, semi-bold).

- **Severity**: Red/Orange/Yellow background with dark text.
- **Verified**: Blue background (`blue-100`), Blue text (`blue-700`), check icon.
- **New**: Accent background (`indigo-100`), Accent text (`indigo-700`).
- **Popular**: Warning background (`amber-100`), text (`amber-700`).
- **AI**: Premium gradient background (Indigo to Violet), white text, sparkle icon.
- **Medical**: Green background (`emerald-100`), Green text (`emerald-700`).
- **Updated**: Gray background (`gray-100`), Gray text (`gray-700`).

## 10. Icons

Using **Lucide Icons** across the platform. Size standard is `20px` for buttons, `24px` for headers/cards. Stroke width `2px`.

## 11. Animations

Keep animations elegant, subtle, and quick (`150ms - 300ms`).

- **Hover**: Color fades, slight `-translate-y-0.5` for cards.
- **Buttons**: `active:scale-95`, transition `background-color`.
- **Page Load**: Subtle stagger fade-in up (`translate-y-4` to `0`, `opacity 0` to `1`).
- **Fade**: Basic opacity transition (`duration-200`).
- **Slide**: Slide in from right (drawers) or bottom (modals).
- **Accordion**: Smooth height transition (0 to auto) with opacity fade.
- **Navbar**: Glassmorphism effect appears on scroll.
- **Modal**: Scale in from `0.95` to `1`, opacity fade in.
- **Drawer**: Slide in from right edge, backdrop fade in.
- **Tooltip**: Fade in, slight scale up (`duration-150`).

## 12. Layout System

- **Container Width**: Max `1200px` for dashboard, `800px` for readable articles.
- **Grid**: 12-column grid.
- **Gap**: `24px` (Desktop), `16px` (Mobile).

### Breakpoints
- **Small Mobile**: `< 375px`
- **Mobile** (`sm`): `640px`
- **Tablet** (`md`): `768px`
- **Laptop** (`lg`): `1024px`
- **Desktop** (`xl`): `1280px`
- **Wide** (`2xl`): `1536px`

## 13. Accessibility

- **WCAG AA**: All text color contrast ratios are at least 4.5:1.
- **Keyboard Navigation**: Full logical tab flow support.
- **Focus Rings**: Universal focus ring (`ring-2 ring-blue-500 ring-offset-2`) on all interactive elements.
- **Color Contrast**: Critical UI elements don't rely solely on color (using icons and labels alongside colors).

## 14. SEO & Semantic Structure

To ensure the layout performs like top-tier tech platforms (Vercel, Notion):
- **Semantic HTML**: Strictly use `<nav>`, `<header>`, `<main>`, `<article>`, `<section>`, and `<footer>`.
- **Heading Hierarchy**: Only one `<h1>` per page (Display XL/L). Ensure strict sequential descending order (`<h2>`, `<h3>`).
- **Metadata**: Every page must have optimized title tags, meta descriptions, and Open Graph images utilizing the abstract glassmorphic assets.

## 15. Performance & Asset Optimization

A premium feel requires instantaneous load times (comparable to Linear/Apple):
- **Asset Formats**: All abstract medical illustrations must be served in `WebP` or `AVIF` formats.
- **Lazy Loading**: Native lazy loading (`loading="lazy"`) for all images below the fold.
- **Typography Subsetting**: Sub-set the `Inter` and `Geist` fonts to include only the necessary Latin characters, utilizing `font-display: swap` to prevent FOIT (Flash of Invisible Text).

## 16. Component Architecture & Reuse

- **Atomic Design**: Never build one-off components. Build a core library of reusable atoms (Buttons, Badges, Inputs) and molecules (Disease Cards, Feature Cards).
- **CSS Utility Abstraction**: While using Tailwind, extract highly repeated complex patterns (like the glassmorphic card effect) into reusable React/Next.js components to reduce visual clutter in the markup and ensure absolute visual consistency across the entire platform.
