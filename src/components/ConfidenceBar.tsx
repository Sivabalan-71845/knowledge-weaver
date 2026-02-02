import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceBar({ confidence, showLabel = true, size = "md" }: ConfidenceBarProps) {
  const getConfidenceColor = (value: number) => {
    if (value >= 70) return "bg-confidence-high";
    if (value >= 40) return "bg-confidence-medium";
    return "bg-confidence-low";
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 70) return "High";
    if (value >= 40) return "Medium";
    return "Low";
  };

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  }[size];

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium tabular-nums">
            {confidence}% <span className="text-muted-foreground font-normal">({getConfidenceLabel(confidence)})</span>
          </span>
        </div>
      )}
      <div className={cn("confidence-bar", heightClass)}>
        <div 
          className={cn("confidence-bar-fill", getConfidenceColor(confidence))}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
