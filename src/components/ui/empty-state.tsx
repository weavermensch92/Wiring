"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6 gap-1.5" : "py-12 gap-3"}`}>
      {icon && (
        <div className={`text-[var(--wiring-text-tertiary)] ${compact ? "mb-1" : "mb-2"}`}>
          {icon}
        </div>
      )}
      <p className={`font-medium text-[var(--wiring-text-secondary)] ${compact ? "text-xs" : "text-sm"}`}>
        {title}
      </p>
      {description && (
        <p className={`text-[var(--wiring-text-tertiary)] max-w-xs ${compact ? "text-[10px]" : "text-xs"}`}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-1 text-[var(--wiring-accent)] hover:underline transition-colors ${compact ? "text-xs" : "text-sm"}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
