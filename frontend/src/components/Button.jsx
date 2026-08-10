import React from "react";
import { FaAngleRight } from "react-icons/fa6";
import clsx from "clsx";

const Button = ({ text, handler, width, disabled = false, loading = false, type = "button" }) => {
    const isDisabled = disabled || loading;
    return (
        <button
            type={type}
            onClick={isDisabled ? undefined : handler}
            disabled={isDisabled}
            style={width ? { width } : undefined}
            className={clsx(
                "p-0.5 rounded-xl shadow-xl duration-200 bg-linear-to-b from-[#5c5c5c] to-btn-primary",
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-2xl"
            )}
        >
            <div className="px-3 py-2 bg-linear-to-b from-[#454545] to-btn-primary rounded-xl text-white flex items-center justify-center gap-2">
                <span>{loading ? "Processing…" : text || "Click"}</span>
                {!isDisabled && <FaAngleRight className="text-md" />}
            </div>
        </button>
    );
};

export default Button;
