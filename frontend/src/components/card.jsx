import Button from "@/components/Button.jsx";

export default function Card({
  title = "Ramdoot Magazine",
  description = "",
  image,
  handleViewClick,
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

      <div className="py-5">
        <h3 className="text-sm md:text-lg font-semibold text-slate-900 mb-1">{title}</h3>

        <p className="text-sm text-slate-600 mb-4 max-h-16 overflow-hidden text-ellipsis">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
          <Button handler={handleViewClick} text="View Magazine" />
        </div>
      </div>
    </article>
  );
}
