import React from "react";
import { FaAngleRight } from "react-icons/fa6";
import clsx from "clsx";

// Shared shell so the <a> and <button> forms stay pixel-identical.
const SHELL =
    "p-0.5 rounded-xl shadow-xl duration-200 bg-linear-to-b from-[#5c5c5c] to-btn-primary";

const Button = ({
    text,
    handler,
    width,
    disabled = false,
    loading = false,
    type = "button",
    // Renders a real anchor instead of a button. Use for navigation —
    // especially off-site — so middle/ctrl-click, "copy link address" and
    // screen readers all treat it as the link it actually is.
    href,
    // Opens in a new tab. `rel` is set alongside `target` to stop the opened
    // page reaching back through window.opener.
    external = false,
}) => {
    const isDisabled = disabled || loading;

    const inner = (
        <div className="px-3 py-2 bg-linear-to-b from-[#454545] to-btn-primary rounded-xl text-white flex items-center justify-center gap-2">
            <span>{loading ? "Processing…" : text || "Click"}</span>
            {!isDisabled && <FaAngleRight className="text-md" />}
        </div>
    );

    // An anchor cannot be disabled, so fall back to the button form when it is.
    if (href && !isDisabled) {
        return (
            <a
                href={href}
                onClick={handler}
                style={width ? { width } : undefined}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={clsx(SHELL, "inline-block cursor-pointer hover:shadow-2xl")}
            >
                {inner}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={isDisabled ? undefined : handler}
            disabled={isDisabled}
            style={width ? { width } : undefined}
            className={clsx(
                SHELL,
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-2xl"
            )}
        >
            {inner}
        </button>
    );
};

export default Button;
