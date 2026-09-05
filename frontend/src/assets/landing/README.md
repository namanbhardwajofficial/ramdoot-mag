# Landing page images

Drop a file here with one of the names below and it appears in that slot — no
code change needed. `LandingImage` finds it by basename, so `.webp`, `.jpg`,
`.jpeg` and `.png` all work.

A slot with no file shows the flat grey block the layout used before, so a
missing image degrades to the old placeholder rather than a broken-image icon.

| Filename | Where it appears | Shape | Suggested size |
|---|---|---|---|
| `about-project-1` | About Us → timeline, first image row | wide, short | 800 × 400 |
| `about-project-2` | About Us → timeline, second image row | wide, short | 800 × 400 |
| `how-it-works-wide` | How It Works → large left panel | landscape | 1400 × 900 |
| `how-it-works-tall` | How It Works → narrow right panel | portrait-ish | 700 × 900 |
| `why-buy-feature` | Why Buy → full-width band | wide banner | 1600 × 900 |
| `promo-temple` | Why Buy → "Temple Restoration" card | portrait | 900 × 1100 |
| `promo-gauseva` | Why Buy → "Feed Animals Do Gau Seva" card | portrait | 900 × 1100 |
| `promo-roots` | Why Buy → "Supporting your roots" card | portrait | 900 × 1100 |

Notes:

- **The three `promo-*` cards carry white text over the image.** Pick photographs
  with a darker or less busy lower half — the card lays a bottom-up gradient
  over them, but a bright, detailed bottom edge still fights the text.
- Prefer `.webp`. `hero-temple.webp` is 1420 × 868 at 93 KB, which is the sort
  of weight to aim for; a multi-megabyte JPEG will undo the lazy-loading.
- Images are `object-cover`, so they fill the slot and crop from the edges.
  Keep the subject near the centre.

Already in use and not part of the table above: `hero-temple.webp` (the hero
background, imported directly by `Hero.jsx`) and `magazine-collage.webp`
(imported by `MagazineCollage.jsx`).
