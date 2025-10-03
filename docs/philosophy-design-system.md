# Philosophy-Inspired Design System

## Overview
Complete redesign of Pocket Philosopher with a beautiful, contemplative aesthetic inspired by classical philosophy, ancient manuscripts, and Greco-Roman design principles.

## Design Philosophy

### Visual Principles
1. **Contemplative Beauty** - Warm, earthy tones that evoke parchment and ancient texts
2. **Classical Elegance** - Serif typography for headings (Crimson Pro, Cormorant)
3. **Thoughtful Spacing** - Tighter, more refined layouts for better flow
4. **Subtle Depth** - Layered shadows and textures for visual richness
5. **Philosophical Symbolism** - Decorative elements like ✦ dividers and golden accents

## Color Palette

### Light Mode
- **Background**: Warm parchment (`hsl(42 45% 97%)`)
- **Card**: Subtle ivory (`hsl(40 40% 99%)`)
- **Primary**: Deep philosophical blue-grey (`hsl(215 28% 45%)`)
- **Accent**: Classical ochre gold (`hsl(38 75% 58%)`)
- **Secondary**: Warm terracotta (`hsl(20 45% 88%)`)

### Dark Mode
- **Background**: Contemplative midnight (`hsl(220 25% 8%)`)
- **Card**: Subtle depth (`hsl(220 22% 11%)`)
- **Primary**: Luminous marble blue (`hsl(210 85% 68%)`)
- **Accent**: Warm golden glow (`hsl(38 85% 62%)`)

### Philosophy-Specific Colors
- **Gold**: `--philosophy-gold` - Manuscript gold leaf
- **Olive**: `--philosophy-olive` - Classical olive branch
- **Marble**: `--philosophy-marble` - Greco-Roman marble
- **Ink**: `--philosophy-ink` - Ancient manuscript ink
- **Scroll**: `--philosophy-scroll` - Aged parchment

## Typography

### Font Families
```css
font-sans: 'Inter' (body text)
font-serif: 'Crimson Pro' (headings, emphasis)
font-display: 'Cormorant' (special display text, quotes)
```

### Hierarchy
- **Page Titles**: 5xl-6xl, Cormorant, gradient text
- **Section Headers**: 2xl-3xl, Crimson Pro
- **Eyebrows**: 2xs, uppercase, wide tracking (0.35em)
- **Body**: Inter, comfortable line-height (1.6-1.75)
- **Quotes**: Cormorant, italic, larger size

## Components

### Cards (`.philosophy-card`)
- Rounded corners (border-radius: 1rem)
- Subtle borders with reduced opacity
- Radial gradient overlay for depth
- Hover effects with shadow transitions
- Parchment texture background

### Buttons
- Enhanced shadows (`.shadow-philosophy`)
- Smooth transitions (200ms)
- Hover states with border color changes
- Philosophy-scroll background on ghost variants

### Inputs
- Larger height (h-11)
- Rounded borders (border-radius: 0.5rem)
- Italic placeholders
- Smooth focus rings with primary color
- Hover border effects

### Decorative Elements

#### Philosophy Divider
```tsx
<div className="philosophy-divider">
  <span className="philosophy-divider-ornament text-xl">✦</span>
</div>
```

#### Virtue Badges
```tsx
<span className="virtue-badge">Wisdom</span>
```

#### Philosophy Quotes
```tsx
<p className="philosophy-quote">Quote text here</p>
```

## Textures & Effects

### Parchment Texture
Subtle repeating linear gradient for aged paper effect
```css
.parchment-texture
```

### Marble Texture
Radial gradients for classical marble appearance
```css
.marble-texture
```

### Gradient Backgrounds
```css
.bg-gradient-philosophy /* Primary to accent gradient */
```

### Text Gradients
```css
.text-gradient-philosophy /* Animated gradient text */
```

## Animations

### Fade In Up
Smooth entrance animation for cards and sections
```css
.animate-fade-in-up
```

### Shimmer
Subtle animated shimmer effect
```css
.animate-shimmer
```

### Glow
Pulsing glow for accent elements
```css
.animate-glow
```

## Spacing System

### Vertical Rhythm
- Page sections: `space-y-6`
- Card grids: `gap-4` to `gap-5`
- Card internal: `space-y-2` to `space-y-3`
- Tight elements: `gap-2` to `gap-3`

### Component Padding
- Cards: `p-6`
- Inner sections: `p-4`
- Buttons: `px-3 py-2` to `px-4 py-3.5`

## Implementation Notes

### Global Styles
All base styles are in `app/globals.css` with:
- CSS custom properties for theming
- Utility classes for common patterns
- Component-specific styles in `@layer components`

### Tailwind Config
Extended configuration in `tailwind.config.ts`:
- Custom philosophy colors
- Font family definitions
- Shadow utilities
- Animation keyframes
- Background gradients

### Key Files Modified
1. `app/globals.css` - Theme colors, typography, utilities
2. `tailwind.config.ts` - Extended configuration
3. Component files - Applied new styling classes
4. Layout files - Background and spacing updates

## Usage Examples

### Page Header
```tsx
<DashboardPageHeader
  eyebrow="Today"
  title="Daily focus"
  description="Your philosophical journey continues..."
/>
```

### Card Section
```tsx
<section className="philosophy-card p-6 animate-fade-in-up">
  <header className="space-y-2">
    <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
      Section Label
    </p>
    <h2 className="text-3xl font-serif font-semibold">Section Title</h2>
  </header>
  <div className="mt-5">
    {/* Content */}
  </div>
</section>
```

### Quote Display
```tsx
<div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 shadow-philosophy">
  <p className="philosophy-quote text-xl">
    "Philosophical wisdom here"
  </p>
</div>
```

## Browser Support
- Modern browsers with CSS custom properties
- Backdrop-filter support (with fallback)
- CSS Grid and Flexbox
- CSS animations and transitions

## Accessibility
- Maintained semantic HTML structure
- Proper heading hierarchy
- Sufficient color contrast ratios
- Focus indicators on interactive elements
- Screen reader labels preserved

## Future Enhancements
- Additional philosophical symbols and ornaments
- More complex texture overlays
- Theme variations (Stoic, Taoist, Existentialist)
- Animated philosophical quotes
- Virtue-specific color schemes
- Seasonal theme variations

---

*"First say to yourself what you would be; and then do what you have to do."* — Epictetus
