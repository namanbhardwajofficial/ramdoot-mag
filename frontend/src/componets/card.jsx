import React from "react";

export default function Card({
    title = "Ramdoot August 2026 Edition",
    subtitle = "",
    description = "Curated magazines delivering insights, trends, and inspiration across technology and design.",
    image,
    onView,
    className = "",
    ...props
}) {
    return (
        <article
            className={`bg-white rounded-2xl  overflow-hidden ${className}`}
            {...props}
        >
            {/* Image / cover */}
            <div className="bg-slate-200 w-full h-56 sm:h-58 md:h-86 rounded-2xl overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200" />
                )}
            </div>

            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
                {subtitle && (
                    <div className="text-xs text-slate-500 mb-2">{subtitle}</div>
                )}

                <p className="text-sm text-slate-600 mb-4 max-h-12 overflow-hidden text-ellipsis">
                    {description}
                </p>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onView}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-full shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        aria-label={`View ${title}`}
                    >
                        <span>View Magazine</span>
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

                    <div className="text-xs text-slate-400">&nbsp;</div>
                </div>
            </div>
        </article>
    );
}