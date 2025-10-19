import { LucideIcon } from "lucide-react";
import { Link } from "@remix-run/react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  actionIcon: ActionIcon,
}: EmptyStateProps) {
  const ActionButton = actionLabel ? (
    <Button className="gap-2" onClick={onAction}>
      {ActionIcon && <ActionIcon className="w-4 h-4" />}
      {actionLabel}
    </Button>
  ) : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && (
        actionLink ? (
          <Link to={actionLink}>
            {ActionButton}
          </Link>
        ) : (
          ActionButton
        )
      )}
    </div>
  );
}
