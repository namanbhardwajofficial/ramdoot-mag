import {
  SearchIcon,
  BellIcon,
  HeartIcon,
  SwapIcon,
  BanIcon,
  FileTextIcon,
  CalendarIcon,
  MailIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

const FAQS = [
  {
    Icon: HeartIcon,
    q: "Is there a free trial available?",
    a: "Yes, you can try us for free for 30 days. Our friendly team will work with you to get you up and running as soon as possible.",
  },
  {
    Icon: SwapIcon,
    q: "Can I change my plan later?",
    a: "Of course. Our pricing scales with your company. Chat to our friendly team to find a solution that works for you.",
  },
  {
    Icon: BanIcon,
    q: "What is your cancellation policy?",
    a: "We understand that things change. You can cancel your plan at any time and we'll refund you the difference already paid.",
  },
  {
    Icon: FileTextIcon,
    q: "Can other info be added to an invoice?",
    a: "At the moment, the only way to add additional information to invoices is to add the information to the workspace's name.",
  },
  {
    Icon: CalendarIcon,
    q: "How does billing work?",
    a: "Plans are per workspace, not per account. You can upgrade one workspace, and still have any number of free workspaces.",
  },
  {
    Icon: MailIcon,
    q: "How do I change my account email?",
    a: "You can change the email address associated with your account by going to account from a laptop or desktop.",
  },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-275">
      {/* Top bar: breadcrumb + search + notifications */}

      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-slate-900">Help</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Ask us anything
        </h1>
        <p className="mt-4 text-base text-slate-500">
          Need something cleared up? Here are our most frequently asked
          questions.
        </p>

        <div className="relative mx-auto mt-8 max-w-md">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* FAQ grid */}
      <div className="mt-10 rounded-2xl bg-slate-50 p-6 sm:p-10 lg:p-12">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FAQS.map(({ Icon, q, a }) => (
            <div key={q}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <Icon className="h-5 w-5 text-slate-700" strokeWidth={1.6} />
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Still have questions */}
      <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Still have questions?
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Can&rsquo;t find the answer you&rsquo;re looking for? Please chat to
            our friendly team.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 sm:self-auto"
        >
          Get in Touch
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
