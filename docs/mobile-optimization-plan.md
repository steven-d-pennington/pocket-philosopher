# Mobile Optimization Plan

## Current State Analysis

### ✅ What's Working
- PWA manifest configured (`manifest.webmanifest`)
- Mobile viewport meta tags set
- Responsive grid layouts with Tailwind breakpoints (sm:, md:, lg:, xl:)
- Service worker infrastructure in place
- Touch-capable UI with shadcn/ui components

### 🔴 Areas for Improvement

#### 1. **Touch Interactions**
- No touch-specific gesture handlers
- Button/interactive element sizes may be below 44x44px minimum
- No swipe gestures for navigation
- Pull-to-refresh not implemented

#### 2. **Responsive Layout**
- Top navigation gets cramped on small screens
- Persona switcher may be difficult to use on mobile
- Modal dialogs could overflow on small screens
- Forms need mobile keyboard optimization

#### 3. **Performance**
- No lazy loading for images
- Bundle size not analyzed for mobile networks
- No resource hints (preconnect, prefetch)
- Critical CSS not inlined

#### 4. **Mobile-Specific Features**
- No install prompt for PWA
- No haptic feedback
- No safe area inset handling (notches)
- No orientation lock guidance

## Implementation Phases

### Phase 1: Touch & Interaction Improvements (Priority: High)

#### 1.1 Touch Target Sizing
**Files to Update:**
- `components/shared/top-bar.tsx` - Increase button sizes
- `components/shared/persona-switcher-compact.tsx` - Larger touch targets
- `components/ui/button.tsx` - Add mobile size variants
- `components/practices/practice-list.tsx` - Touch-friendly action buttons

**Changes:**
- Minimum 44x44px touch targets
- Increase spacing between interactive elements
- Add larger padding on mobile breakpoints

#### 1.2 Swipe Gestures
**New Files:**
- `lib/hooks/use-swipe.ts` - Swipe gesture detection hook
- `components/shared/swipeable-drawer.tsx` - Bottom sheet component

**Features:**
- Swipe to open/close navigation
- Swipe between reflection types
- Swipe to dismiss toasts

#### 1.3 Mobile Navigation
**Files to Update:**
- `components/shared/top-bar.tsx` - Hamburger menu
- `app/(dashboard)/layout.tsx` - Mobile drawer navigation

**Features:**
- Slide-out drawer navigation
- Bottom navigation bar option
- Fixed position controls

### Phase 2: Responsive Layout Enhancements (Priority: High)

#### 2.1 Viewport Optimization
**Files to Update:**
- `app/layout.tsx` - Enhanced viewport config
- `app/globals.css` - Safe area insets

**Changes:**
```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  viewportFit: 'cover', // Handle notches
}
```

#### 2.2 Safe Area Handling
**Files to Create:**
- `lib/hooks/use-safe-area.ts` - Safe area hook
- CSS updates for notch/island support

#### 2.3 Mobile-First Components
**Files to Update:**
- `components/dashboard/daily-quote.tsx` - Stack vertically on mobile
- `components/marcus/coach-preview.tsx` - Simplified mobile view
- `components/reflections/reflection-composer.tsx` - Mobile keyboard handling

### Phase 3: Performance Optimizations (Priority: Medium)

#### 3.1 Image Optimization
**Files to Update:**
- Replace `<img>` with Next.js `<Image>` component
- Add blur placeholders
- Implement lazy loading

#### 3.2 Code Splitting
**New Configuration:**
- Dynamic imports for heavy components
- Route-based code splitting
- Vendor chunking optimization

#### 3.3 Resource Hints
**Files to Update:**
- `app/layout.tsx` - Add preconnect hints

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://api.supabase.com" />
```

### Phase 4: PWA Enhancements (Priority: Medium)

#### 4.1 Install Prompt
**New Files:**
- `components/shared/pwa-install-prompt.tsx` - Install banner
- `lib/hooks/use-pwa-install.ts` - Install detection hook

#### 4.2 Manifest Improvements
**File to Update:**
- `public/manifest.webmanifest`

**Enhancements:**
```json
{
  "name": "Pocket Philosopher",
  "short_name": "Philosopher",
  "start_url": "/today",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "description": "Daily Stoic and philosophical coaching",
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Today",
      "url": "/today",
      "icons": [{ "src": "/icons/today-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Reflect",
      "url": "/reflections/new",
      "icons": [{ "src": "/icons/reflect-icon.png", "sizes": "96x96" }]
    }
  ]
}
```

### Phase 5: Mobile-Specific Features (Priority: Low)

#### 5.1 Haptic Feedback
**New File:**
- `lib/utils/haptics.ts` - Vibration API wrapper

#### 5.2 Pull-to-Refresh
**New Hook:**
- `lib/hooks/use-pull-to-refresh.ts`

#### 5.3 Orientation Handling
**New Hook:**
- `lib/hooks/use-orientation.ts`

## Implementation Checklist

### Phase 1: Touch & Interaction (Week 1)
- [ ] Audit all touch targets (minimum 44x44px)
- [ ] Create swipe gesture hook
- [ ] Implement mobile drawer navigation
- [ ] Add touch-friendly button sizes
- [ ] Test on real devices (iOS Safari, Chrome Android)

### Phase 2: Responsive Layout (Week 1-2)
- [ ] Add safe area insets support
- [ ] Update viewport configuration
- [ ] Optimize modal behavior on mobile
- [ ] Improve form input handling for mobile keyboards
- [ ] Test landscape orientation

### Phase 3: Performance (Week 2)
- [ ] Analyze bundle size with @next/bundle-analyzer
- [ ] Implement dynamic imports for heavy components
- [ ] Add resource hints
- [ ] Optimize font loading
- [ ] Test on slow 3G connection

### Phase 4: PWA Enhancements (Week 2-3)
- [ ] Create PWA install prompt
- [ ] Generate app icons (72px to 512px)
- [ ] Add app shortcuts
- [ ] Test offline functionality
- [ ] Add iOS splash screens

### Phase 5: Advanced Features (Week 3)
- [ ] Implement haptic feedback
- [ ] Add pull-to-refresh
- [ ] Handle orientation changes
- [ ] Test on various devices
- [ ] Performance audit with Lighthouse

## Testing Strategy

### Device Testing Matrix
- **iOS**: iPhone SE, iPhone 12/13/14, iPad
- **Android**: Pixel 5/6, Samsung Galaxy S21, OnePlus
- **Browsers**: Safari iOS, Chrome Android, Firefox Android

### Test Scenarios
1. **Touch Interaction**: All buttons/links tappable, no accidental taps
2. **Navigation**: Drawer opens/closes smoothly, no layout shift
3. **Forms**: Keyboard appears correctly, inputs not obscured
4. **Modals**: Dialogs fit on screen, scrollable content works
5. **Performance**: <3s load time on 3G, smooth 60fps animations
6. **PWA**: Install works, offline mode functions, icons correct

### Tools
- Chrome DevTools Device Mode
- Lighthouse Mobile Audit
- BrowserStack for real device testing
- WebPageTest for performance
- PWA Builder for validation

## Success Metrics

### Performance Targets
- **First Contentful Paint**: <1.5s on 3G
- **Largest Contentful Paint**: <2.5s on 3G
- **Time to Interactive**: <3.5s on 3G
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Mobile-Specific Metrics
- **Touch Target Pass Rate**: 100%
- **Viewport Fit**: No horizontal scroll
- **Install Rate**: >5% of mobile visitors
- **PWA Engagement**: 2x session length vs web

## Resources

### Documentation
- [Web.dev Mobile Guidelines](https://web.dev/mobile/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://m3.material.io/foundations/accessible-design/overview)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [App Manifest Generator](https://app-manifest.firebaseapp.com/)
