# Turfzo marketing-image implementation guide

## Purpose

Use this guide to replace the current generic, dark “sports SaaS” treatment with a more credible marketplace: real-looking local sports facilities, clear booking information, and restrained use of the Turfzo green.

This is for public marketing pages only. Product UI, venue availability, prices, owner payouts, testimonials, and reviews must always use real Turfzo data or real product screenshots. Do not use generated images as evidence of a real Turf, Owner, booking, or payout.

## Visual direction

- **Mood:** premium local sports marketplace; calm, capable, active.
- **Location:** believable Indian urban settings—Bengaluru, Mumbai, Delhi, Hyderabad—not giant international stadiums.
- **Light:** golden hour, blue hour, or soft daylight. Avoid heavy HDR, neon glow, and black-on-black scenes.
- **People:** candid groups playing or arriving; everyday sportswear; no posed influencer portraits.
- **Colour:** deep green for text and structure; Turfzo green only for actions, tags, and active states. Keep public-page surfaces light.
- **Typography:** sentence/title case for marketing headings. Avoid oversized condensed all-caps display type except for a very small overline.

## Asset library

Store marketing assets by purpose, never as anonymous generated filenames.

```text
public/images/marketing/
  home/
    hero-turf-evening.webp
    how-it-works-players.webp
    cta-floodlit-turf.webp
  explore/
    football-card.webp
    cricket-card.webp
    badminton-card.webp
    tennis-card.webp
  owners/
    hero-owner-at-turf.webp
    venue-operations.webp
    onboarding-venue-exterior.webp
  tournaments/
    tournament-hero.webp
```

The current image files in `public/` may be retained only if they meet the standards below. Move approved marketing images into this structure when the relevant page is redesigned.

## Technical export settings

| Use | Aspect ratio | Desktop target | Mobile behaviour | Format |
| --- | --- | --- | --- | --- |
| Homepage or tournament hero | 16:9 | 2560 × 1440 | use a purpose-made 4:5 alternate if the focal subject is lost | WebP, quality 78–82 |
| Mobile hero alternate | 4:5 | 1440 × 1800 | serve only below 768px | WebP, quality 78–82 |
| Venue listing card | 4:3 | 1200 × 900 | same crop; no portrait source | WebP, quality 75–80 |
| Editorial / how-it-works block | 3:2 | 1800 × 1200 | crop around people/action | WebP, quality 78–82 |
| Owner onboarding companion | 4:5 | 1440 × 1800 | retain portrait | WebP, quality 78–82 |
| CTA background | 21:9 | 2520 × 1080 | replace with 4:5 on mobile | WebP, quality 78–82 |

- Keep a hero image below **350 KB** where possible; listing cards below **160 KB**.
- Export at 2× the largest rendered size, not at original camera resolution.
- Strip EXIF metadata before committing assets.
- Use `next/image` with `sizes`, explicit `width`/`height`, and `priority` only for the one LCP hero image.
- Do not use CSS background images for content images. Use an image element so responsive source selection and alt text work correctly.
- Use `object-fit: cover`; set the subject’s focal position with `object-position` rather than stretching an image.

## Accessibility and legal checklist

- Decorative image: empty alt text (`alt=""`).
- Informative image: describe what is visibly useful, e.g. `"Players warming up on a floodlit five-a-side turf"`.
- Do not repeat nearby heading text as alt text.
- Keep all live text, buttons, prices, and search controls in HTML—never bake them into an image.
- For third-party or generated images, keep a small source register: asset filename, source/generation date, licence or prompt, and the page using it.
- Do not use an image containing visible brand logos, copyrighted team kits, recognisable public figures, or an implied endorsement.

## Page-by-page application

### Homepage

| Area | Image | Layout and treatment |
| --- | --- | --- |
| Hero | `home/hero-turf-evening.webp` | Place a real-looking floodlit Turf on the right. Keep the left 40% visually quiet for heading, copy, and a booking CTA. Apply a subtle left-to-right deep-green overlay only behind copy. |
| Popular Turfs | `explore/*-card.webp` or actual approved Turf photos | Four-card grid. Each card must use a consistent 4:3 crop. Display actual Turf name, city, rating, next slot, and starting price as HTML. |
| How it works | `home/how-it-works-players.webp` | One 3:2 candid image next to three short steps: Find a Turf, Choose a slot, Play. Do not add a separate image for every step. |
| Final CTA | `home/cta-floodlit-turf.webp` | Wide, quiet 21:9 scene with short copy and a single `Find a Turf` action. |

Homepage image count: **four maximum**, excluding real venue-card photos.

### Explore

| Area | Image | Layout and treatment |
| --- | --- | --- |
| Search header | none by default | The search interface is the hero. Use a light surface and a small neutral turf texture only if contrast remains excellent. |
| Sport filters | `explore/*-card.webp` | Use small sport thumbnails only if each sport has a strong asset. Otherwise use consistent line icons. |
| Turf results | actual Turf photos | Never use generic stock images when a Turf has approved photos. Require a 4:3 cover image and fall back to a neutral Turfzo placeholder only when none exists. |
| Empty state | one subtle neutral illustration or cropped turf texture | Explain the city has no listed Turfs and offer city alerts. Do not show a large empty stadium image. |

### Owner registration

| Area | Image | Layout and treatment |
| --- | --- | --- |
| Hero | `owners/hero-owner-at-turf.webp` | Split layout: concise owner value proposition and CTA on the left; manager-at-Turf photograph on the right. Do not show a made-up complex dashboard. |
| Benefits | `owners/venue-operations.webp` | One practical operations image beside four concise benefits: online slots, payments, flexible blocking, more player discovery. |
| Product evidence | real Turfzo owner-dashboard screenshot | Show only a genuine calendar or booking view. Blur real personal data where necessary. |
| Onboarding | `owners/onboarding-venue-exterior.webp` | Place beside the three-step onboarding sequence. Registration should be reachable within one click from the hero. |
| Testimonials | real owner portraits or no portraits | Pair a named owner, real Turf, city, and approved quote. Do not place fictional faces beside testimonials. |

Owner-page image count: **three marketing photographs plus one genuine product screenshot**.

### Tournaments

| Area | Image | Layout and treatment |
| --- | --- | --- |
| Hero | `tournaments/tournament-hero.webp` | Use a believable amateur tournament at a local Turf. Keep the left side clear for title, city/sport filters, and CTA. |
| Tournament cards | actual tournament or Turf photos | Use 4:3 covers with date, city, format, capacity, and fee rendered as HTML. |
| Bracket / management explanation | actual product screenshot or clean CSS diagram | Never generate a pretend bracket UI. |

## Image selection checklist

Choose an image only if it passes every test:

1. It looks like a local Turf or community sport, not a professional international stadium.
2. The focal subject remains visible after the required crop.
3. It supports the section’s job rather than merely decorating it.
4. It leaves sufficient quiet space for copy when used in a hero.
5. It has no logos, unreadable generated text, fake interfaces, or visual clichés.
6. It matches the other images in lighting, colour temperature, and realism.

## Before shipping

- Verify desktop (1440px), tablet (768px), and mobile (390px) crops.
- Ensure hero copy has at least 4.5:1 contrast over the final image and overlay.
- Confirm the mobile hero shows its headline and CTA within the first viewport.
- Verify no image is the LCP blocker except the one priority homepage hero.
- Test with images disabled/slow: headings, calls to action, navigation, filters, and booking flows must remain usable.
- Keep the public site light and editorial; reserve dark, dense UI for authenticated dashboard experiences.
