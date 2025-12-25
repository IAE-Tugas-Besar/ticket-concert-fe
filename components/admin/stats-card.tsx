import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border bg-card p-6 shadow-sm",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-3">
                <p className="text-3xl font-bold">{value}</p>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
                {trend && (
                    <p
                        className={cn(
                            "mt-1 text-sm font-medium",
                            trend.isPositive ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                    </p>
                )}
            </div>
        </div>
    );
}
