import React from "react";
import { FaAngleRight } from "react-icons/fa6";
import clsx from "clsx";

const Button = ({ text, handler, width }) => {
    return (
        <button
            onClick={handler}
            style={width ? { width } : undefined}
            className={clsx(
                "p-0.5 rounded-xl cursor-pointer shadow-xl hover:shadow-2xl duration-200",
                "bg-linear-to-b from-[#5c5c5c] to-btn-primary"
            )}
        >
            <div className="px-3 py-2 bg-linear-to-b from-[#454545] to-btn-primary rounded-xl text-white flex items-center justify-center gap-2">
                <span>{text || "Click"}</span>
                <FaAngleRight className="text-md" />
            </div>
        </button>
    );
};

export default Button;
