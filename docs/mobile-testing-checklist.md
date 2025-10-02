# Mobile Testing Checklist

## Device Testing

### Required Devices
- [ ] **iPhone SE** (4.7", smallest modern iPhone)
  - [ ] Safari iOS
  - [ ] Chrome iOS
  
- [ ] **iPhone 14/15** (6.1", standard size)
  - [ ] Safari iOS (primary)
  - [ ] PWA installed mode
  - [ ] Safe area insets visible (notch)

- [ ] **iPhone 14/15 Pro Max** (6.7", large + Dynamic Island)
  - [ ] Safe area handling
  - [ ] Dynamic Island compatibility
  - [ ] Landscape orientation

- [ ] **Pixel 5/6** (Android standard)
  - [ ] Chrome Android (primary)
  - [ ] Firefox Android
  - [ ] PWA installed

- [ ] **Samsung Galaxy S21+** (curved edges)
  - [ ] Samsung Internet
  - [ ] Edge touch handling
  - [ ] PWA features

- [ ] **iPad** (tablet viewport)
  - [ ] Layout at 768px+
  - [ ] Touch targets still adequate
  - [ ] Both portrait and landscape

## Interaction Testing

### Touch Targets
- [ ] All buttons are 44x44px minimum
- [ ] Tap targets have adequate spacing (8px+)
- [ ] No accidental taps on adjacent elements
- [ ] Tap highlight removed (no blue flash)
- [ ] Touch delay eliminated (300ms → 0ms)

### Navigation
- [ ] Hamburger menu opens drawer smoothly
- [ ] Drawer closes when route changes
- [ ] Swipe left closes drawer
- [ ] Overlay click closes drawer
- [ ] Escape key closes drawer
- [ ] No layout shift when drawer opens
- [ ] Back button behavior correct

### Forms & Inputs
- [ ] Input focus doesn't trigger iOS zoom
- [ ] Keyboard appears correctly
- [ ] Inputs not obscured by keyboard
- [ ] Submit button accessible with keyboard open
- [ ] Appropriate keyboard types (number, email, etc.)
- [ ] Auto-capitalize disabled where appropriate

### Modals & Overlays
- [ ] Bottom sheets slide from bottom on mobile
- [ ] Swipe down to dismiss works
- [ ] Background scroll locked when open
- [ ] Content doesn't overflow
- [ ] Close button easily tappable
- [ ] Escape key closes modal

### Gestures
- [ ] Swipe gestures don't interfere with scroll
- [ ] Horizontal swipe doesn't trigger vertical scroll
- [ ] Pull-to-refresh (if implemented) works smoothly
- [ ] Pinch-to-zoom disabled on double-tap areas

## Layout Testing

### Responsive Breakpoints
- [ ] **Mobile** (320px - 639px)
  - [ ] All content visible
  - [ ] No horizontal scroll
  - [ ] Text readable without zoom
  - [ ] Images properly sized

- [ ] **Tablet** (640px - 1023px)
  - [ ] Optimal layout for medium screens
  - [ ] Good use of available space
  - [ ] Touch targets still adequate

- [ ] **Desktop** (1024px+)
  - [ ] Desktop navigation visible
  - [ ] Mobile drawer hidden
  - [ ] Proper max-width constraints

### Safe Areas
- [ ] Content not hidden by iPhone notch
- [ ] Content not hidden by Dynamic Island
- [ ] Bottom content not hidden by home indicator
- [ ] Left/right content visible on curved screens
- [ ] Status bar color appropriate

### Orientation
- [ ] Portrait mode works perfectly
- [ ] Landscape mode functional
- [ ] No awkward layouts in landscape
- [ ] Keyboard handling in landscape

## Performance Testing

### Loading Speed
- [ ] First Contentful Paint <1.5s on 3G
- [ ] Largest Contentful Paint <2.5s on 3G
- [ ] Time to Interactive <3.5s on 3G
- [ ] Total bundle size <300KB (gzipped)

### Runtime Performance
- [ ] Smooth 60fps scrolling
- [ ] No jank on animations
- [ ] Drawer slides smoothly
- [ ] Transitions feel responsive
- [ ] No memory leaks (long sessions)

### Network Conditions
Test on throttled connection (Chrome DevTools):
- [ ] Fast 3G (750ms RTT, 1.5 Mbps down)
- [ ] Slow 3G (2s RTT, 400 Kbps down)
- [ ] Offline mode (service worker)

## PWA Features

### Installation
- [ ] Install prompt appears
- [ ] Install button works
- [ ] App installs successfully
- [ ] App icon shows correctly
- [ ] Splash screen displays (iOS)

### Installed Experience
- [ ] Opens to correct start_url
- [ ] Runs in standalone mode
- [ ] No browser chrome visible
- [ ] Status bar color correct
- [ ] Shortcuts work (Android)

### Offline Functionality
- [ ] Service worker registers
- [ ] Critical assets cached
- [ ] Offline page displays
- [ ] Background sync works
- [ ] Cache updates on new version

## Accessibility Testing

### Screen Readers
- [ ] VoiceOver (iOS) announces all elements
- [ ] TalkBack (Android) navigation works
- [ ] Drawer has proper ARIA labels
- [ ] Modals announce focus changes
- [ ] Form validation errors announced

### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Shortcuts work (if any)
- [ ] Escape closes modals/drawers

### Visual
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible
- [ ] No information conveyed by color alone
- [ ] Text resizable without breaking layout

## Content Testing

### Typography
- [ ] Base font 16px (prevents iOS zoom)
- [ ] Line height adequate for reading
- [ ] Paragraph width comfortable
- [ ] Headings properly sized
- [ ] No text cut off

### Images
- [ ] All images have alt text
- [ ] Images lazy load
- [ ] Blur placeholders show
- [ ] Responsive images serve correct size
- [ ] Icons scale properly

### Persona-Specific Content
- [ ] Daily quote changes per persona
- [ ] Practice suggestions adapt
- [ ] Reflection prompts match time
- [ ] Persona theming applies
- [ ] Persona persists on refresh

## Browser-Specific Testing

### Safari iOS
- [ ] Safe area insets work
- [ ] Tap highlights removed
- [ ] Input zoom disabled
- [ ] Momentum scrolling smooth
- [ ] PWA features work

### Chrome Android
- [ ] Install prompt appears
- [ ] App shortcuts work
- [ ] Theme color applies
- [ ] Address bar hides in PWA
- [ ] Back button behavior correct

### Samsung Internet
- [ ] All features work
- [ ] Edge panel doesn't interfere
- [ ] Dark mode compatible
- [ ] Performance adequate

## Edge Cases

### Network Issues
- [ ] Graceful offline handling
- [ ] Retry on connection restore
- [ ] Error messages clear
- [ ] Queue actions for later sync

### Low Memory
- [ ] App doesn't crash
- [ ] Images degrade gracefully
- [ ] Service worker stays responsive

### Interruptions
- [ ] Phone call doesn't lose state
- [ ] App switch preserves form data
- [ ] Background/foreground transitions smooth

### Long Sessions
- [ ] No memory leaks
- [ ] Performance stays consistent
- [ ] Auth doesn't expire unexpectedly

## Lighthouse Audit

Run Lighthouse mobile audit and verify:
- [ ] Performance score >90
- [ ] Accessibility score 100
- [ ] Best Practices score >90
- [ ] SEO score >90
- [ ] PWA checklist passes

### Critical Metrics
- [ ] First Contentful Paint <1.8s
- [ ] Speed Index <3.4s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.8s
- [ ] Total Blocking Time <200ms
- [ ] Cumulative Layout Shift <0.1

## User Experience Validation

### First-Time User
- [ ] Onboarding clear
- [ ] Navigation intuitive
- [ ] No confusion about gestures
- [ ] Install prompt understandable

### Return User
- [ ] Persona preference saved
- [ ] Quick access to common tasks
- [ ] Offline mode works
- [ ] Performance feels fast

### Power User
- [ ] Shortcuts available
- [ ] Gestures work reliably
- [ ] No unnecessary steps
- [ ] Data syncs properly

## Sign-Off Criteria

All items must pass before considering mobile optimization complete:
- [ ] **Critical Issues**: 0 (blocking launch)
- [ ] **Major Issues**: 0 (must fix)
- [ ] **Minor Issues**: <5 (nice to have)
- [ ] **Lighthouse Mobile Score**: >90
- [ ] **Touch Target Compliance**: 100%
- [ ] **Real Device Testing**: All primary devices tested
- [ ] **User Feedback**: 3+ users tested successfully

## Testing Tools

### Browser DevTools
- Chrome DevTools Device Mode
- Safari Responsive Design Mode
- Firefox Responsive Design Mode

### Online Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [PWA Builder](https://www.pwabuilder.com/)

### Real Device Testing
- BrowserStack (cloud testing)
- LambdaTest (cloud testing)
- Physical devices (preferred)

### Automation
- Playwright for E2E testing
- Lighthouse CI for performance regression
- Visual regression testing (Percy, Chromatic)

## Notes

- Always test on real devices when possible
- Throttle network in DevTools doesn't perfectly simulate real conditions
- Test with various persona selections
- Check dark mode on all screens
- Verify with screen reader on at least one device
- Test with large font sizes (accessibility settings)
