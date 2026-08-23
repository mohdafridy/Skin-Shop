# The Skin Shop — Ambient Negative-Space Motion Pass

This pass builds on the existing Premium Editorial Refinement + Motion Visibility Pass. It is decorative/frontend-only.

## Added ambient system

A new `src/components/AmbientDecor.tsx` component provides low-contrast, non-interactive SVG/CSS atmosphere. All elements are `aria-hidden`, pointer-events are disabled, and content remains above them with normal z-index stacking.

### Story chapter
- oversized low-opacity `KASHMIR` typography
- animated botanical stem line drawing
- subtle vertical `01 — ROOTED IN KASHMIR` editorial label

### Curated Rituals
- slowly rotating botanical/Kashmir seal
- animated geometric corner motif
- subtle vertical `02 — THE RITUAL` label

### Build Your Ritual
- oversized low-opacity `RITUAL` typography
- saffron-thread line draw animation
- three restrained antique-gold breathing dots

### Ingredients
- oversized low-opacity `BOTANICALS` typography
- animated botanical stem
- secondary saffron-thread line work
- subtle vertical `03 — INGREDIENT STUDY` label

### Newsletter
- softly drifting botanical leaf-shadow treatment
- restrained `FROM KASHMIR, WITH CARE` edge label on larger screens

## Motion behavior

- Ambient elements reveal only when their section enters the viewport.
- SVG paths draw once, then selected elements move with extremely slow drift.
- The seal rotates over 34 seconds, intentionally slow enough to read as atmosphere rather than an effect.
- Background typography is intentionally very low opacity.
- Decorative elements are reduced substantially on tablets and hidden further on small phones.
- `prefers-reduced-motion: reduce` removes the decorative animation and leaves only static final-state artwork.

## Exclusions maintained

This pass does **not** add:
- custom cursor
- pointer-following movement
- faux 3D product motion
- full-bleed editorial interlude sections
- floating petals or particle systems
- scroll hijacking
- sound
- glowing UI

## Business/backend safety

No intentional changes were made to:
- Supabase/database/auth
- Razorpay/payment logic
- Resend/email logic
- API routes
- Prisma schema/migrations
- product/price/combo data
- checkout calculations
- cart business logic
- environment variables

## Files changed in this pass

- `src/components/AmbientDecor.tsx` (new)
- `src/components/StorySection.tsx`
- `src/components/CuratedRituals.tsx`
- `src/components/BuildYourRitual.tsx`
- `src/components/IngredientStorytelling.tsx`
- `src/components/Newsletter.tsx`
- `src/app/globals.css`

## Validation performed here

- TypeScript/TSX syntax transpile check passed for all modified/new components.
- CSS brace/parenthesis balance check passed.
- Source diff confirms only the files listed above differ from the prior motion-pass source.

A full `npm ci`, lint, production build and browser visual QA should still be run in the normal development/staging environment before deployment.
