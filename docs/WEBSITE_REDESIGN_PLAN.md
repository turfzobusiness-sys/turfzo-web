# Turfzo website redesign plan

## 1. Outcome

Redesign Turfzo as a **trusted local sports marketplace**, not a dark, generic “sports SaaS” landing page.

The public website must make three things obvious within seconds:

1. Players can find and book a nearby Turf quickly.
2. Every Turf has clear, credible information and live availability.
3. Owners can understand the value of listing a Turf and begin registration without reading a long sales brochure.

This plan changes presentation, information architecture, and content hierarchy only. Convex remains the source of truth for every Turf, slot, price, booking, payment, Owner status, and tournament.

## 2. The new creative direction

### Design principle

**Real sport, real places, clear decisions.**

Use light surfaces, genuine-looking local sports environments, compact copy, ordinary sentence case, and one purposeful action per screen. Dark mode may remain available for the authenticated product, but it must not define the public marketing website.

### Remove these visual patterns

- Large condensed all-caps headlines.
- Black-on-black sections, glowing borders, and neon green used everywhere.
- Fake admin dashboards, invented metrics, and generated text within images.
- Large app-phone renderings that distract from booking.
- Long feature matrices and repetitive “without/with” comparison blocks.
- Multiple primary calls to action in the same section.

### Use these instead

- Warm off-white page backgrounds and white cards with subtle borders.
- Deep green text, restrained Turfzo-green action states, and one warm neutral surface colour.
- Real Turf photos for listings; real product screenshots for product evidence.
- Candid community sports photography used in only a few high-value locations.
- Clear search, map/location context, facilities, time, price, and ratings as HTML.

## 3. Visual system

| Token | Direction |
| --- | --- |
| Background | `#F7F8F5` warm off-white |
| Surface | `#FFFFFF` |
| Main text | `#162019` deep green-black |
| Supporting text | muted forest/grey; never low-contrast grey over photography |
| Primary action | Turfzo green, with dark text and strong focus state |
| Secondary action | white surface, deep-green border and text |
| Corners | 12px for cards, 10px for controls, 999px only for filters/tags |
| Shadows | one soft, low-opacity elevation shadow; no coloured glow |
| Type | one modern sans family (the existing Nunito may remain if it is applied consistently); headings in title/sentence case |

Keep the mascot as a small brand cue in the header and friendly empty states. It should not compete with booking/search content.

## 4. Information architecture

### Primary navigation

```text
Find a Turf     Tournaments     For Owners     Help
                                              Sign in     List your Turf
```

- `Find a Turf` → `/explore`
- `Tournaments` → `/tournaments`
- `For Owners` → `/owners`
- `Help` → `/contact` or a future help centre
- `List your Turf` → `/owners/register`

Do not use `Get Started` as a public action: it is vague. The user should choose between booking a Turf and listing a Turf.

### Pages that share templates

| Template | Routes |
| --- | --- |
| Player marketplace | `/`, `/explore`, `/cities/[city]`, `/cities/[city]/[sport]` |
| Turf detail and booking | `/venues/[venueId]`, booking-related routes |
| Tournament discovery | `/tournaments`, `/tournament/[tournamentId]` |
| Owner acquisition | `/owners`, `/owners/register`, `/owners/onboarding` |
| Trust/support | `/how-it-works`, `/contact`, `/refund-policy`, legal pages |
| Authenticated product | profile, bookings, owner dashboard, admin; retain dense task-oriented UI rather than marketing styling |

## 5. Page plans

### Homepage (`/`)

**Job:** get a player to `/explore` with a city, sport, and date preference.

1. Header.
2. Hero: short promise, `Find a Turf` primary action, `List your Turf` secondary action, and one high-quality evening-Turf photo.
3. Compact search module: location, date, sport, search. It must work or route directly to `/explore` with the selected filters.
4. Popular Turfs: real data when available; otherwise a clearly labelled discovery grid. Do not present mocked names, ratings, times, or prices as live marketplace inventory.
5. Three trust reasons: verified Turfs, live availability, clear checkout price.
6. Three-step booking explanation.
7. One owner acquisition strip: “Own a Turf? Fill more slots.”
8. Final booking CTA and a smaller footer.

**Remove/consolidate:** the app-download block in the hero, the oversized phone mockup, overlapping statistics, and duplicate end-of-page booking actions.

### Explore (`/explore`)

**Job:** help a player narrow choices and confidently open a Turf detail page.

1. Page title and search controls in the first viewport; no full-screen decorative hero.
2. Search controls: city/location, date, sport, optional time, filter button.
3. Result summary and sort control.
4. Responsive Turf card grid or list; a 4:3 real cover photo, name, city, sport, rating/reviews, facilities, starting price, and next available time.
5. Map is optional and must not displace useful results on mobile.
6. Empty state: explain that there are no matching Turfs; preserve filter controls and offer another city/date.

**Mobile rule:** search controls and the first result or empty-state explanation must be visible in the initial viewport.

### Turf detail (`/venues/[venueId]`)

**Job:** convert interest into a Slot Booking.

1. Turf photo gallery, name, city, rating, sport format, and key facilities.
2. Sticky or prominent slot-selection card: date, available slots, exact price preview from the backend, and booking action.
3. Location, facilities, venue rules, cancellation terms, and reviews below the booking decision.
4. A visible “what you pay” summary before checkout; never imply zero fees if a service fee applies.

Use actual venue photos and data only. This page should be product-first, not marketing-first.

### Tournaments (`/tournaments` and `/tournament/[tournamentId]`)

**Job:** discover, assess, and join an event.

1. Compact sport/city/date filters and tournament cards.
2. Cards show real date, city, format, team/participant capacity, entry fee, and registration status.
3. Event detail focuses on essentials first: schedule, venue, fee, capacity, rules, and registration action.
4. Use one community-tournament photograph in the page hero only; use real event/Turf imagery for cards.

### Owner acquisition (`/owners`)

**Job:** persuade an Owner to start registration.

1. Hero: “Fill more slots. Spend less time on WhatsApp.” with `List your Turf free` as the only primary action.
2. One authentic Owner-at-Turf image—not a fictional dashboard.
3. Four concise benefits: online slots, payment collection, blocked time/pricing, player discovery.
4. One genuine product screenshot: booking calendar or dashboard, with sensitive data removed.
5. Three-step onboarding explanation.
6. Real Owner proof only if names, quotes, Turfs, and consent are available; otherwise omit testimonials.
7. FAQ and a final registration CTA.

**Remove/consolidate:** the giant simulated dashboard, the long platform-capability tabs, technical backend claims, repeated revenue promises, comparison matrix, and multiple fabricated data cards.

### Owner registration and onboarding (`/owners/register`, `/owners/onboarding`)

**Job:** make registration feel short, predictable, and safe.

- Keep the existing multi-step onboarding flow; redesign its shell rather than its domain fields.
- State the step count and estimated time honestly.
- Use autosave/progress acknowledgement if already supported; otherwise do not claim it.
- Group fields into: business contact, Turf details, facilities/photos, payouts, review/submit.
- Put requirements and photo guidance beside the relevant upload field, not in a long preamble.
- Show `Pending review` clearly after submission; never promise 24-hour approval unless operations can meet it consistently.

### Support, blog, legal, auth, profile, bookings, and admin

- Support/legal/blog pages share the light reading layout, restrained header, and simplified footer.
- Auth uses a narrow, calm single-column card with only necessary actions.
- Bookings, profile, Owner dashboard, and admin retain information-dense product patterns, but adopt the same tokens, buttons, form states, and typography.
- Do not force large marketing imagery into authenticated task flows.

## 6. Component strategy

Create a small page-system layer rather than rewriting styles inside every page.

```text
components/marketing/
  marketing-header.tsx
  marketing-footer.tsx
  hero-search.tsx
  section-heading.tsx
  turf-card.tsx
  trust-pillars.tsx
  steps.tsx
  owner-benefits.tsx
  image-frame.tsx

components/product/
  booking-panel.tsx
  slot-picker.tsx
  venue-gallery.tsx
  owner-onboarding-shell.tsx
```

- Replace page-specific marketing components gradually; do not copy header/footer/card markup into every route.
- Keep the existing shared header, footer, booking, auth, and onboarding domain behaviours intact until their visual replacements are ready.
- Design tokens belong in `app/globals.css`; pages consume tokens rather than hard-coded black, lime, and border values.
- Use Framer Motion only for short opacity/position transitions. Remove animations that hide essential content or delay interaction.

## 7. Image policy

Follow [MARKETING_IMAGE_IMPLEMENTATION_GUIDE.md](./MARKETING_IMAGE_IMPLEMENTATION_GUIDE.md).

- Homepage: 3–4 marketing images maximum, plus real Turf photos in the listing grid.
- Owner page: 3 marketing photographs maximum plus one real product screenshot.
- Explore and Turf detail: actual Turf photos take precedence over marketing assets.
- Store approved files under `public/images/marketing/` using meaningful names.
- Verify desktop, tablet, and 390px mobile crops before accepting each asset.

Existing uncommitted assets under `public/images/marketing/` should be audited against this plan before use. Do not discard them automatically: the homepage hero, sport-card set, Owner imagery, and tournament hero may be useful if they pass the crop and authenticity checks.

## 8. Delivery sequence

### Phase 0 — decisions and inventory

- Approve the visual direction, copy tone, and nav labels.
- Inventory which Turf photographs, Owner proof, product screenshots, and exact marketplace numbers are real and approved for use.
- Mark every current claim as verified, replace, or remove.
- Freeze a list of routes that must preserve their URLs for SEO and existing links.

### Phase 1 — foundation

- Establish the light public-page token set, type scale, spacing, button/form/card states, and responsive grid.
- Build the new marketing header, footer, section heading, image frame, Turf card, and search module.
- Validate contrast, keyboard focus, and desktop/tablet/mobile layout before starting individual pages.

### Phase 2 — player journey

- Rebuild Home.
- Rebuild Explore and empty states.
- Rebuild Turf detail and the booking decision area.
- Validate the flow: Home → Explore → Turf detail → checkout.

### Phase 3 — owner journey

- Rebuild Owner acquisition page.
- Reskin registration/onboarding shell and upload guidance.
- Validate: Owner page → register → complete onboarding → pending review.

### Phase 4 — tournament and supporting pages

- Rebuild tournament discovery/detail templates.
- Apply the support/blog/legal/auth reading templates.
- Align authenticated surfaces to the new system without making them marketing-heavy.

### Phase 5 — quality and release

- Replace mock marketplace statistics with backend data or neutral language.
- Test all routes at 390px, 768px, and 1440px.
- Check visual regression, keyboard navigation, image loading, empty states, authentication states, and booking/registration flows.
- Run website typecheck and build, then follow the repository’s required commit/PR/staging approval gates.

## 9. Acceptance criteria

The redesign is ready only when:

- The first mobile viewport clearly presents a heading, a useful action, and no unexplained blank space.
- A player can reach a Turf’s slot selection in three deliberate steps or fewer from Home.
- A live Turf card never shows made-up inventory data as if it were real.
- An Owner can start registration from the Owner page without scrolling through a long sales document.
- Every public image supports a specific decision and meets crop, contrast, performance, and source-register requirements.
- Public pages no longer depend on black backgrounds, oversized all-caps typography, neon styling, or fabricated dashboard visuals for their identity.
- The booking, price, payment, approval, and role rules remain exclusively in Convex.
