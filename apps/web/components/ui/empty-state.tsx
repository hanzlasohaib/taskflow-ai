type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-foreground/[0.02] px-6 py-10 text-center ${className}`}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}
