import Link from "next/link";
import { ReactNode } from "react";

interface MenuButtonProps {
    href?: string;
    onClick?: () => void;
    icon: ReactNode;
    label: string;
    isLocked?: boolean;
    className?: string;
}

export function MenuButton({
    href,
    onClick,
    icon,
    label,
    isLocked = false,
    className = "",
}: MenuButtonProps) {
    const content = (
        <div
            className={`
        relative flex flex-col items-center justify-center 
        w-32 h-32 md:w-40 md:h-40 
        bg-white/90 backdrop-blur-sm 
        rounded-3xl shadow-lg border-4 border-white/50
        transition-all duration-300
        ${isLocked
                    ? "opacity-60 grayscale cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-xl hover:border-white active:scale-95 cursor-pointer"
                }
        ${className}
      `}
        >
            <div className="text-4xl md:text-5xl mb-2 filter drop-shadow-md">
                {isLocked ? "🔒" : icon}
            </div>
            <span className="text-sm md:text-base font-bold text-slate-700 text-center leading-tight px-2">
                {label}
            </span>
            {isLocked && (
                <div className="absolute inset-0 bg-slate-200/20 rounded-3xl" />
            )}
        </div>
    );

    if (isLocked) {
        return <div className="select-none">{content}</div>;
    }

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return (
        <button onClick={onClick} className="outline-none">
            {content}
        </button>
    );
}
