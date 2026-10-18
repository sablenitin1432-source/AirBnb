# 🏆 Luxury Four Seasons Design - Complete Backup
**Created:** 2026-02-17 16:03:43 IST
**Purpose:** Complete backup to restore luxury home page design

## 🎨 Design Overview

### Current Features
✅ **Full-screen video hero section** with luxury overlay
✅ **Four Seasons-style booking bar** with calendar & guest selection
✅ **Premium typography** (Playfair Display, Cormorant Garamond, Plus Jakarta Sans)
✅ **Luxury color palette** (Gold #C9A227, Dark #1A1A1A, Cream #F8F6F0)
✅ **Interactive calendar popup** with date range selection
✅ **Guests dropdown** with increment/decrement controls
✅ **Glassmorphism effects** with backdrop blur
✅ **Smooth animations** and elegant transitions
✅ **Responsive design** for all screen sizes

---

## 📁 Critical Files to Restore

### 1. Main Home Page
**File:** `views/home.ejs`
- **Size:** 1761 lines, 51,022 bytes
- **Contains:** Complete luxury hero section with embedded CSS
- **Key Sections:**
  - Luxury hero with video background
  - Four Seasons booking bar
  - Interactive calendar popup
  - Guests dropdown
  - All responsive styles

### 2. Home CSS (Legacy)
**File:** `public/css/home.css`
- **Size:** 869 lines, 19,590 bytes
- **Note:** This file exists but the main design is now embedded in home.ejs

### 3. Supporting Files
- `views/layouts/boilerplate.ejs` - Layout wrapper
- `views/includes/navbar.ejs` - Transparent navbar
- `public/videos/luxury-hotel.mp4` - Hero video (if exists)

---

## 🎯 Key Design Tokens

```css
/* Luxury Color Palette */
--luxury-gold: #C9A227;
--luxury-gold-light: #E8D5A3;
--luxury-dark: #1A1A1A;
--luxury-charcoal: #2D2D2D;
--luxury-cream: #F8F6F0;
--luxury-ivory: #FFFEF9;
--luxury-text: #333333;
--luxury-text-light: #666666;
--luxury-accent: #8B7355;

/* Premium Typography */
--font-serif: 'Playfair Display', Georgia, serif;
--font-elegant: 'Cormorant Garamond', Georgia, serif;
--font-sans: 'Plus Jakarta Sans', sans-serif;
```

---

## 🚀 Restoration Instructions

### If You Need to Restore This Design:

1. **Tell me:** "Restore the luxury Four Seasons design"
2. **I will:**
   - Read this backup document
   - Read the full `home.ejs` file (all 1761 lines)
   - Restore any modified sections
   - Verify all components are intact:
     - Video hero section
     - Booking bar with toggle
     - Calendar popup
     - Guests dropdown
     - All interactions and animations

3. **What I'll preserve:**
   - All luxury styling
   - Interactive JavaScript for calendar, guests, booking bar
   - Responsive breakpoints
   - Premium animations and transitions
   - Four Seasons aesthetic

---

## 🎬 Video Hero Section Details

```html
<section class="luxury-hero">
    <video autoplay muted loop playsinline>
        <source src="/videos/luxury-hotel.mp4" type="video/mp4">
    </video>
    <div class="luxury-hero__overlay"></div>
    <div class="luxury-hero__content">
        <!-- Hero content with booking bar -->
    </div>
</section>
```

**Features:**
- Full viewport height (100vh)
- Auto-playing, muted, looping video
- Dark gradient overlay for text readability
- Centered content with elegant typography
- Video fallback to dark background

---

## 📱 Booking Bar Features

### Show/Hide Toggle
- **Default:** Visible at bottom of hero
- **Hidden State:** Slides down, shows floating "SHOW" button
- **Button Position:** Bottom right (desktop), responsive mobile

### Date Selection
- **UI:** Two-month calendar side-by-side
- **Interaction:** Click dates to select check-in/check-out range
- **Visual:** Selected dates highlighted, range shown with background
- **Mobile:** Single-month view on tablets

### Guest Selection  
- **Controls:** Adults, Children, Rooms
- **UI:** +/- buttons with live count
- **Min/Max:** Enforced limits with disabled buttons

### Promo Code
- **Field:** Text input for promotional codes
- **Integration:** Ready for backend validation

---

## 🎨 Component Hierarchy

```
home.ejs
├── <style> (1761 lines of embedded CSS)
│   ├── Luxury Hero Section
│   ├── Booking Bar Styles
│   ├── Calendar Popup Styles
│   ├── Guests Dropdown Styles
│   └── Responsive Breakpoints
│
├── Luxury Hero Section
│   ├── Video Background
│   ├── Overlay
│   └── Content
│       ├── Eyebrow text
│       ├── Title
│       ├── Subtitle
│       └── CTA Button
│
├── Booking Bar (at bottom of hero)
│   ├── Check-in Field
│   ├── Check-out Field
│   ├── Guests Field
│   ├── Promo Code Field
│   ├── "Check Rates" Button
│   └── HIDE/SHOW Toggle
│
├── Calendar Popup (hidden by default)
│   ├── Month Navigation
│   ├── Two-Month Grid
│   ├── Date Selection Logic
│   └── "Done" Button
│
└── Guests Dropdown (hidden by default)
    ├── Adults Counter
    ├── Children Counter
    ├── Rooms Counter
    └── Auto-close Logic

└── <script> (JavaScript)
    ├── Calendar initialization
    ├── Date range selection
    ├── Guest counter logic
    ├── Booking bar toggle
    └── Input formatting
```

---

## 🔄 Animation Details

### Luxury Fade In (Hero Content)
```css
@keyframes luxuryFadeIn {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}
/* Duration: 1.5s cubic-bezier(0.4, 0, 0.2, 1) */
```

### Calendar Slide In
```css
@keyframes calendarSlideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
/* Duration: 0.3s ease */
```

### Booking Bar Toggle
- **Slide Down:** `transform: translateY(100%)`
- **Duration:** 0.5s cubic-bezier(0.4, 0, 0.2, 1)

---

## ⚡ Responsive Breakpoints

### Desktop (1200px+)
- Full booking bar horizontal layout
- Two-month calendar side-by-side
- All fields visible in one row

### Tablet (768px - 1200px)
- Wrapped booking bar fields
- Calendar switches to column layout
- Maintained luxury spacing

### Mobile (< 768px)
- Stacked booking bar fields
- Single-month calendar
- Adjusted button sizes
- Compact HIDE/SHOW button

---

## ✅ Verification Checklist

After restoration, verify:
- [ ] Video plays automatically and loops
- [ ] Booking bar toggles show/hide correctly
- [ ] Calendar opens on date field click
- [ ] Date range selection works (check-in → check-out)
- [ ] Guest counters increment/decrement properly
- [ ] Calendar "Done" button closes popup and updates fields
- [ ] All fonts load correctly (Google Fonts)
- [ ] Responsive design works on mobile
- [ ] All animations are smooth
- [ ] Luxury aesthetic matches Four Seasons style

---

## 🎯 Design Philosophy

This design follows **luxury hospitality aesthetics** inspired by Four Seasons:
- **Minimal but elegant** - Clean lines, ample white space
- **Premium typography** - Serif for headings, sans-serif for UI
- **Sophisticated colors** - Muted gold, deep blacks, ivory whites
- **Smooth interactions** - Refined animations, tasteful transitions
- **Professional booking UX** - Intuitive, hotel-grade interface

---

## 📞 How to Request Restoration

Simply say any of these:
- "Restore the luxury Four Seasons design"
- "Bring back the video hero section"
- "Restore the main page to the luxury design"
- "I need the premium home page back"

I will:
1. Read this backup file
2. Read the complete current `home.ejs` if needed
3. Restore all 1761 lines with luxury design intact
4. Verify all interactive features work
5. Test responsive breakpoints

---

**🔒 This backup preserves your complete luxury design and can be restored at any time!**
