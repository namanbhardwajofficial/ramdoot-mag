/**
 * An image slot on the landing page.
 *
 * Several sections were laid out with grey blocks where a photograph belongs
 * (`bg-[#d9d7d8]`), which read as unstyled boxes rather than as anything
 * deliberate. This fills those slots from `src/assets/landing/`, and keeps the
 * grey block as the fallback for a slot whose photo has not been supplied yet —
 * so an unfilled slot looks the same as it did rather than showing a broken
 * image icon.
 *
 * Drop a file into `src/assets/landing/` and add it to LANDING_IMAGES below; the
 * slot picks it up with no other change.
 *
 * `overlay` darkens the image from the bottom, for slots with text sitting on
 * top of them. Slots that carry their own gradient (the promo cards) pass
 * `overlay={false}` so the two do not stack into a muddy double-darkening.
 */

// Vite resolves these at build time, so a missing file is a build error rather
// than a 404 at runtime. `eager` because these are landing-page images that
// should be in the initial CSS/JS graph, not fetched later.
const FILES = import.meta.glob('@/assets/landing/*.{webp,jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Look a slot's file up by basename, whatever extension it was supplied with.
function resolve(name) {
  if (!name) return null;
  const hit = Object.entries(FILES).find(([path]) => {
    const base = path.split('/').pop().replace(/\.[^.]+$/, '');
    return base === name;
  });
  return hit ? hit[1] : null;
}

export default function LandingImage({
  name,
  alt = '',
  className = '',
  overlay = false,
  priority = false,
  children,
}) {
  const src = resolve(name);

  return (
    <div className={`relative overflow-hidden bg-[#d9d7d8] ${className}`}>
      {src && (
        <img
          src={src}
          alt={alt}
          // The hero is the only above-the-fold image; everything using this
          // component sits below it and should not compete for bandwidth.
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {overlay && src && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      )}
      {children}
    </div>
  );
}
