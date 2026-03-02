export default function Card({
  title = "Ramdoot Magazine",
  description = "",
  image,
  price,
  onBuy,
  loading,
  onView,
  className = "",
  ...props
}) {
  return (
    <article
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      {...props}
    >
      {/* Responsive image heights: small screens shorter, larger screens taller */}
      <div className="bg-slate-200 w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1">{title}</h3>

        <p className="text-sm text-slate-600 mb-4 max-h-16 overflow-hidden text-ellipsis">
          {description}
        </p>

        {/* Stack on small screens, inline on sm+ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
          <span className="text-lg font-bold text-slate-900">
            &#8377;{price}
          </span>

          <button
            onClick={onBuy}
            disabled={loading}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-full shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            aria-label={`Buy ${title}`}
          >
            <span>{loading ? "Processing..." : "Buy Now"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
