import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QualityTierBadgeProps {
  value: number;
  metric: "residuals" | "convergence" | "radiant_error" | "timing" | "mass_uncertainty";
  className?: string;
}

export function QualityTierBadge({ value, metric, className }: QualityTierBadgeProps) {
  let tier = "Poor";
  let colorClass = "bg-red-900/40 text-red-400 border-red-500/30";

  if (metric === "residuals") {
    // arcsec
    if (value < 10) { tier = "Excellent"; colorClass = "bg-status-success/20 text-status-success border-status-success/30"; }
    else if (value < 30) { tier = "Good"; colorClass = "bg-accent-primary/20 text-accent-primary border-accent-primary/30"; }
    else if (value < 60) { tier = "Fair"; colorClass = "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30"; }
  } else if (metric === "convergence") {
    // degrees
    if (value > 30) { tier = "Excellent"; colorClass = "bg-status-success/20 text-status-success border-status-success/30"; }
    else if (value > 15) { tier = "Good"; colorClass = "bg-accent-primary/20 text-accent-primary border-accent-primary/30"; }
    else if (value > 5) { tier = "Fair"; colorClass = "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30"; }
  } else if (metric === "radiant_error") {
      if (value < 0.1) { tier = "Excellent"; colorClass = "bg-status-success/20 text-status-success border-status-success/30"; }
      else if (value < 0.5) { tier = "Good"; colorClass = "bg-accent-primary/20 text-accent-primary border-accent-primary/30"; }
      else { tier = "Poor"; colorClass = "bg-status-error/20 text-status-error border-status-error/30"; }
  } else if (metric === "timing") {
      if (value < 0.05) { tier = "Excellent"; colorClass = "bg-status-success/20 text-status-success border-status-success/30"; }
      else { tier = "Common"; colorClass = "bg-slate-800 text-slate-400 border-slate-700"; }
  }

  return (
    <span className={cn("inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold border backdrop-blur-sm", colorClass, className)}>
      {tier}
    </span>
  );
}
