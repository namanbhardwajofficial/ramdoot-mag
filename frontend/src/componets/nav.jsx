import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/componets/ui/avatar";


const navItems = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "magazine", label: "Magazine", icon: MagazineIcon },
    { key: "library", label: "Library", icon: LibraryIcon },
];

export default function Nav() {
	const [active, setActive] = useState("magazine");

    return (
        <aside
            className="w-64 bg-[#f0eeef]  border-slate-200 h-screen flex flex-col justify-between"
            aria-label="Primary Navigation"
        >
            <div className="px-6 pt-6">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-lg font-semibold">RAMDOOT</div>
                        <div className="text-xs text-slate-400">foundation</div>
                    </div>
                </div>

                <nav className="mt-8 space-y-1" aria-label="Sidebar">
                    {navItems.map((item) => {
                        const isActive = item.key === active;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setActive(item.key)}
                                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                                    isActive
                                        ? "bg-white text-slate-900 font-medium shadow-sm"
                                        : "text-slate-700 hover:bg-[#ffffff]"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="w-5 h-5 text-slate-400 group-hover:text-slate-600">
                                    <item.icon aria-hidden />
                                </span>
                                <span className="flex-1">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="px-6 pb-6">
                <div className="border-t border-slate-200 pt-4">
                    <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#ffffff] focus:outline-none">
                       <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium">Atharv</div>
                            <div className="text-xs text-slate-400">atharv@ramdootfounda...</div>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}

// --- Icons (simple inline icons to avoid extra deps) ---
function HomeIcon(props) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
			<path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
		</svg>
	);
}

function MagazineIcon(props) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
			<rect x="3" y="4" width="14" height="16" rx="2" />
			<path d="M7 8h6" />
			<path d="M7 12h6" />
		</svg>
	);
}

function LibraryIcon(props) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
			<path d="M3 7h18M6 21V7M18 21V7" />
		</svg>
	);
}


