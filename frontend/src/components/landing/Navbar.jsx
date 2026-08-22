import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import useLandingNav from './useLandingNav';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About us', href: '#about' },
  { label: 'Vision', href: '#vision' },
  { label: 'Mission', href: '#mission' },
  { label: 'Testimonial', href: '#testimonial' },
];

export default function Navbar() {
  const nav = useLandingNav();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-[#1c1c1e]/85 shadow-lg backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-22 max-w-[1440px] items-center justify-between px-5 md:px-10">
        {/* Logo */}
        <a href="#home" className="text-white" aria-label="Ramdoot Foundation home">
          <Logo />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 text-sm text-white/85 md:flex">
          {NAV_LINKS.map((l, i) => (
            <li key={l.label} className="relative">
              <a href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
              {i === 0 && (
                <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
              )}
            </li>
          ))}
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Button text="Login" handler={nav.login} />
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-white md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden">
          <ul className="mx-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/60 p-4 text-white backdrop-blur-md">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <Button
                text="Login"
                handler={() => {
                  setOpen(false);
                  nav.login();
                }}
                width="100%"
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
