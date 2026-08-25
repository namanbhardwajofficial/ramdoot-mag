import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
  FaTelegram,
} from 'react-icons/fa6';
import Logo from '@/components/Logo';
import { ORG, SOCIAL_LINKS } from '@/config/constants';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About us', href: '#about' },
  { label: 'Vision', href: '#vision' },
  { label: 'Mission', href: '#mission' },
  { label: 'Testimonial', href: '#testimonial' },
];

/**
 * Every one of these was `href="#"` — seven icons that looked like the
 * foundation's social presence and scrolled to the top of the page instead.
 * They now read their URL from SOCIAL_LINKS (env-driven, see constants) and an
 * icon with no URL is not rendered at all. WhatsApp and Telegram are dropped
 * for now: neither has an env slot because neither is a profile URL the way the
 * others are — add them when there is a real invite link to point at.
 */
const SOCIALS = [
  { Icon: FaFacebook, label: 'Facebook', key: 'facebook' },
  { Icon: FaXTwitter, label: 'X', key: 'twitter' },
  { Icon: FaInstagram, label: 'Instagram', key: 'instagram' },
  { Icon: FaLinkedin, label: 'LinkedIn', key: 'linkedin' },
  { Icon: FaYoutube, label: 'YouTube', key: 'youtube' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-5 pb-10 pt-14 md:pt-16">
      <div className="mx-auto max-w-[1245px]">
        {/* Top: logo + links */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[320px] text-[#1c1c1e]">
            <Logo />
            <p className="mt-3 px-2 text-sm leading-relaxed text-[#1c1c1e]/55">
              Magazines which focus on real history, not pirated one. Your spiritual
              companion, every month.
            </p>
          </div>

          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#1c1c1e]/70">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="transition-colors hover:text-[#1c1c1e]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: copyright + socials */}
        <div className="mt-12 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#1c1c1e]/55">
            © {new Date().getFullYear()} {ORG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[#1c1c1e]/55">
            {SOCIALS.filter(({ key }) => SOCIAL_LINKS[key]).map(({ Icon, label, key }) => (
              <a
                key={label}
                href={SOCIAL_LINKS[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="transition-colors hover:text-[#1c1c1e]"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
