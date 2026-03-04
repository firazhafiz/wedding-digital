import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?:
    | "pending"
    | "approved"
    | "rejected"
    | "attending"
    | "not_attending"
    | "checked_in";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  attending: "bg-emerald-100 text-emerald-700 border-emerald-200",
  not_attending: "bg-red-100 text-red-700 border-red-200",
  checked_in: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Badge({
  variant = "pending",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium font-body border rounded-full",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
