import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color?: "gold" | "emerald" | "red" | "blue";
  className?: string;
}

const colorMap = {
  gold: "bg-gold/10 text-gold border-gold/20",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  red: "bg-red-50 text-red-500 border-red-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  color = "gold",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border",
            colorMap[color],
          )}
        >
          {icon}
        </div>
        {trend && (
          <span className="font-body text-xs text-charcoal-light">{trend}</span>
        )}
      </div>
      <p className="font-body text-2xl font-semibold text-charcoal-dark">
        {value}
      </p>
      <p className="font-body text-xs text-charcoal-light mt-0.5 tracking-wide">
        {label}
      </p>
    </div>
  );
}
