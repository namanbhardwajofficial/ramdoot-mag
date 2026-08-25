import TwoColSection from '@/components/landing/TwoColSection';
import { ChevronRightIcon } from '@/components/ui/icons';
import { ORG } from '@/config/constants';

const BODY =
  'Choose your subscription plans to get magazines every month, subscription plans to get magazines every month.';

const STATUS = {
  ongoing: {
    label: 'Currently Ongoing',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  planned: {
    label: 'Future Planned',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
  },
};

const TIMELINE = [
  { type: 'project', title: 'Ramdoot Restore Project 1', status: 'ongoing' },
  { type: 'image' },
  { type: 'project', title: 'Ramdoot Restore Project 1', status: 'ongoing' },
  { type: 'image' },
  { type: 'project', title: 'Ramdoot Restore Project 1', status: 'planned' },
];

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function AboutUs() {
  return (
    <TwoColSection id="about" title="About Us">
      {/* Intro */}
      <h3 className="max-w-[420px] font-['Delight'] font-medium leading-[1.2] tracking-[-0.01em] text-[#1c1c1e] text-xl sm:text-2xl">
        A complete guide for Santan Dharma - Your Spiritual Campanion
      </h3>
      <p className="mt-4 max-w-[480px] text-sm leading-relaxed text-[#1c1c1e]/55">
        Choose your subscription plans to get magazines every month, subscription
        plans to get magazines every month. Choose your subscription plans to get
        magazines every month, subscription plans to get magazines every month.
      </p>

      {/* Timeline */}
      <h4 className="mt-12 font-['Delight'] font-medium tracking-[-0.01em] text-[#bdbbbc] text-xl sm:text-2xl">
        On Going &amp; Future Project
      </h4>

      <div className="relative mt-7">
        {/* continuous vertical rail */}
        <span className="absolute left-[3px] top-2 bottom-2 w-px bg-black/10" />

        {TIMELINE.map((item, i) => (
          <div key={i} className="relative flex gap-5 pb-9 last:pb-0">
            <span className="relative z-10 mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[#1c1c1e]" />

            <div className="min-w-0 flex-1">
              {item.type === 'project' ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h5 className="font-medium text-[#1c1c1e] text-lg">
                      {item.title}
                    </h5>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 max-w-[400px] text-sm leading-relaxed text-[#1c1c1e]/55">
                    {BODY}
                  </p>
                  {/* Was a handler-less <button>. There is no per-project page
                      in this app — the restoration projects live on the
                      foundation's own site, which is where the donation CTAs
                      already point. */}
                  <a
                    href={ORG.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1c1c1e] transition-opacity hover:opacity-70"
                  >
                    View Details
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </a>
                </>
              ) : (
                <div className="h-[150px] w-full rounded-2xl bg-[#d9d7d8] sm:h-[170px]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </TwoColSection>
  );
}
