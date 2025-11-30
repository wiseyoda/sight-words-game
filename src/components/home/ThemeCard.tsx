import { Theme } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ThemeCardProps {
    theme: Partial<Theme> & { id: string; displayName: string };
    isSelected: boolean;
    isLocked?: boolean;
    progress?: {
        stars: number;
        totalStars: number;
    };
    onClick: () => void;
}

export function ThemeCard({
    theme,
    isSelected,
    isLocked = false,
    progress,
    onClick,
}: ThemeCardProps) {
    // Fallback colors if palette is missing
    const primaryColor = theme.palette?.primary || "#6366f1";
    const cardBg = theme.palette?.cardBackground || "#ffffff";

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={cn(
                "relative group flex flex-col items-center text-left transition-all duration-300 outline-none",
                isSelected ? "scale-105 z-10" : "scale-100 opacity-80 hover:opacity-100 hover:scale-102",
                isLocked && "opacity-50 grayscale cursor-not-allowed hover:scale-100"
            )}
        >
            {/* Card Container */}
            <div
                className={cn(
                    "w-48 h-64 md:w-56 md:h-72 rounded-3xl shadow-xl overflow-hidden border-4 transition-all",
                    isSelected ? "ring-4 ring-offset-4 ring-offset-white/30" : "border-white/50",
                    isLocked ? "bg-slate-200 border-slate-300" : "bg-white"
                )}
                style={{
                    borderColor: isSelected ? primaryColor : undefined,
                    boxShadow: isSelected ? `0 20px 40px -10px ${primaryColor}66` : undefined,
                }}
            >
                {/* Theme Image / Preview Area */}
                <div
                    className="h-3/5 w-full bg-slate-100 relative flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: theme.palette?.background || "#f1f5f9" }}
                >
                    {theme.assets?.logo ? (
                        <Image
                            src={theme.assets.logo}
                            alt={theme.displayName}
                            width={200}
                            height={150}
                            className="w-3/4 h-3/4 object-contain drop-shadow-lg transition-transform group-hover:scale-110 duration-500"
                        />
                    ) : (
                        <div className="text-4xl">
                            {isLocked ? "🔒" : "🎨"}
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content Area */}
                <div
                    className="h-2/5 w-full p-4 flex flex-col justify-between"
                    style={{ backgroundColor: cardBg }}
                >
                    <div>
                        <h3
                            className="font-bold text-lg leading-tight mb-1 line-clamp-2"
                            style={{ color: theme.palette?.text || "#1e293b" }}
                        >
                            {theme.displayName}
                        </h3>
                        {isLocked && (
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Coming Soon
                            </span>
                        )}
                    </div>

                    {/* Progress Stars */}
                    {!isLocked && progress && (
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-lg">⭐</span>
                            <span
                                className="font-bold text-slate-600"
                                style={{ color: theme.palette?.text }}
                            >
                                {progress.stars}
                            </span>
                            <span className="text-xs text-slate-400">
                                / {progress.totalStars}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Indicator (Triangle) */}
            {isSelected && (
                <div
                    className="absolute -bottom-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px]"
                    style={{ borderTopColor: primaryColor }}
                />
            )}
        </button>
    );
}
