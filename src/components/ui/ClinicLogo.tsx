import clinicLogo from "@/assets/clinic-logo.png";
import { cn } from "@/lib/utils";

interface ClinicLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
};

export function ClinicLogo({ size = "md", showText = false, className }: ClinicLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={clinicLogo}
        alt="Klinik Pratama Logo"
        className={cn(sizeClasses[size], "object-contain")}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading text-sm font-semibold text-foreground">
            Klinik Pratama
          </span>
          <span className="text-xs text-muted-foreground">
            Sistem Informasi
          </span>
        </div>
      )}
    </div>
  );
}
