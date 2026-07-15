interface SentimentBadgeProps {
  sentiment: "positive" | "neutral" | "negative";
  size?: "sm" | "md";
}

export function SentimentBadge({ sentiment, size = "md" }: SentimentBadgeProps) {
  const config = {
    positive: {
      label: "Positif",
      icon: "↑",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    neutral: {
      label: "Netral",
      icon: "→",
      classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    },
    negative: {
      label: "Negatif",
      icon: "↓",
      classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
  };

  const { label, icon, classes } = config[sentiment];
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-medium ${sizeClass} ${classes}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
