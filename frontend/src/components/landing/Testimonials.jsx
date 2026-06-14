import { BadgeCheckIcon } from '@/components/ui/icons';

const TESTIMONIALS = [
  { quote: 'Finally a magazine that tells our history the way it actually happened. Beautifully researched.', name: 'Arjun Mehta', role: 'Subscriber, Pune' },
  { quote: 'The temple restoration coverage moved me. I subscribed and became an affiliate the same week.', name: 'Priya Nair', role: 'Affiliate Partner' },
  { quote: 'Every edition feels like a treasure. My whole family reads it together every month.', name: 'Rohan Shenoy', role: 'Subscriber, Bengaluru' },
  { quote: 'Authentic, original and fabricated-free. Exactly what our younger generation needs to read.', name: 'Kavya Iyer', role: 'Educator' },
  { quote: 'Sharing the link with my audience was effortless and the rewards were genuinely worth it.', name: 'Vikram Singh', role: 'Content Creator' },
  { quote: 'Deeply researched stories of ancient India that you simply will not find anywhere else.', name: 'Ananya Rao', role: 'Subscriber, Hyderabad' },
];

function TestimonialCard({ quote, name, role }) {
  return (
    <div className="mr-6 flex w-[300px] shrink-0 flex-col justify-between rounded-2xl bg-white p-8 shadow-sm sm:w-[380px]">
      <p className="font-['Delight'] leading-snug text-[#1c1c1e] text-lg">“{quote}”</p>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[#d9d7d8]" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[#1c1c1e]">{name}</span>
            <BadgeCheckIcon className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-sm text-[#1c1c1e]/55">{role}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Infinitely scrolling row. The cards are rendered twice so a -50% translate
 * loops seamlessly. `reverse` flips the direction. Pauses on hover.
 */
function MarqueeRow({ items, reverse = false }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
      >
        {items.map((t, i) => (
          <TestimonialCard key={`a-${i}`} {...t} />
        ))}
        {items.map((t, i) => (
          <TestimonialCard key={`b-${i}`} {...t} aria-hidden />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const rowOne = TESTIMONIALS;
  const rowTwo = [...TESTIMONIALS].reverse();

  return (
    <section id="testimonial" className="py-14 md:py-20">
      {/* Heading */}
      <div className="px-5 text-center">
        <h2 className="mx-auto max-w-[473px] font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl md:text-[2.25rem]">
          This is what people think about our inishitive
        </h2>
        <p className="mx-auto mt-3 max-w-[440px] text-xs leading-relaxed text-[#1c1c1e]/55 sm:text-sm">
          Choose your subscription plans to get magazines every month, subscription
          plans to get magazines every month.
        </p>
      </div>

      {/* Two rows scrolling in opposite directions */}
      <div className="mt-10 flex flex-col gap-6 md:mt-12">
        <MarqueeRow items={rowOne} />
        <MarqueeRow items={rowTwo} reverse />
      </div>
    </section>
  );
}
