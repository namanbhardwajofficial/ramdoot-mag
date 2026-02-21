import React from "react";
import { Download } from "lucide-react";
import { Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
    BreadcrumbList
} from "@/componets/ui/breadcrumb";

export default function MagazinesDetails({
    title = "Ramdoot August 2026 Edition",
    cover,
    pdfUrl,
    onDownload,
    onWriteReview,
}) {
    return (
        <div className="p-6">
            
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/magazines">Magazines</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink>{title}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column: actions */}
                <aside className="lg:col-span-3">
                    <h2 className="text-xl font-semibold mb-4">PDF Viewer</h2>
                    <p className="text-sm text-slate-500 mb-4">List of all the magazines you been looking for</p>

                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-slate-100">
                                    <Download className="w-5 h-5 text-slate-700" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">Download this edition</h3>
                                    <p className="text-xs text-slate-400">List of all the magazines you been looking for</p>
                                    <button
                                        onClick={() => onDownload && onDownload()}
                                        className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-full shadow-md hover:bg-slate-900 focus:outline-none"
                                    >
                                        <span>Download Magazine</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-yellow-50">
                                    <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 17l-5 3 1-6-4-4 6-1 3-6 3 6 6 1-4 4 1 6z"/></svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">Your view matters to us</h3>
                                    <p className="text-xs text-slate-400">List of all the magazines you been looking for</p>
                                    <button
                                        onClick={() => onWriteReview && onWriteReview()}
                                        className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-full shadow-md hover:bg-slate-900 focus:outline-none"
                                    >
                                        Write a Review
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4 h-48" />
                    </div>
                </aside>

                {/* Right/main column: PDF viewer */}
                <section className="lg:col-span-9">
                    <div className="bg-slate-800 rounded-2xl overflow-hidden">
                        {/* toolbar */}
                        <div className="flex items-center gap-3 p-3 bg-slate-900 text-white">
                            <div className="text-sm font-medium">File name</div>
                            <div className="mx-2 text-xs text-slate-400">1 / 2</div>
                            <div className="ml-auto flex items-center gap-2">
                                <button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">-</button>
                                <div className="px-2 py-1 bg-slate-800 rounded">100%</div>
                                <button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">+</button>
                                <button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">⤓</button>
                                <button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">⋯</button>
                            </div>
                        </div>

                        {/* viewer area */}
                        <div className="p-4 bg-white rounded-b-2xl">
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    title={title}
                                    className="w-full h-[600px] rounded-lg border border-slate-200"
                                />
                            ) : (
                                <div className="w-full h-[600px] rounded-lg border border-slate-200 overflow-hidden">
                                    {cover ? (
                                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}