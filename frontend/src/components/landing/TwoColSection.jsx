/**
 * Shared landing layout: a large section title on the left and content on the right.
 * Used by Affiliate Program, About Us, Mission, Vision, About Magazine.
 */
export default function TwoColSection({ id, title, children, className = '' }) {
  return (
    <section id={id} className={`px-5 py-14 md:py-20 ${className}`}>
      <div className="mx-auto flex max-w-[1245px] flex-col gap-8 md:flex-row md:justify-between md:gap-16">
        <div className="md:w-[325px] md:shrink-0">
          <h2 className="font-['Delight'] font-medium leading-[1.05] tracking-[-0.02em] text-[#1c1c1e] text-4xl sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h2>
        </div>
        <div className="md:max-w-[670px] md:flex-1">{children}</div>
      </div>
    </section>
  );
}
