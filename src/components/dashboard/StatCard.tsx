import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary";
}

export function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) {
  return (
    <div className={cn(
      "stat-card animate-fade-in",
      variant === "primary" && "gradient-primary text-white",
      variant === "secondary" && "bg-secondary text-secondary-foreground"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "text-white/80"
          )}>
            {title}
          </p>
          <p className={cn(
            "mt-2 text-3xl font-bold font-heading",
            variant === "default" && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "mt-1 text-sm",
              variant === "default" ? "text-muted-foreground" : "text-white/70"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500",
                variant !== "default" && (trend.isPositive ? "text-green-200" : "text-red-200")
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className={cn(
                "text-xs",
                variant === "default" ? "text-muted-foreground" : "text-white/60"
              )}>
                dari bulan lalu
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          variant === "default" ? "bg-primary/10" : "bg-white/20"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === "default" ? "text-primary" : "text-white"
          )} />
        </div>
      </div>
    </div>
  );
}
