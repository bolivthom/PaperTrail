import { Link } from "@remix-run/react";
import { LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NotFoundAction {
  label: string;
  link: string;
  icon: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

interface NotFoundProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: NotFoundAction[];
  showSupport?: boolean;
  supportLink?: string;
}

export default function NotFound({
  icon: Icon,
  title,
  description,
  actions = [],
  showSupport = true,
  supportLink = "/support"
}: NotFoundProps) {
  return (
    <div className="flex min-h-screen justify-center bg-background text-foreground mt-20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-9xl font-bold text-muted-foreground/20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <Button 
                    variant={action.variant || (index === 0 ? "default" : "outline")} 
                    className="w-full sm:w-auto gap-2"
                  >
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}

        {/* Help Link */}
        {showSupport && (
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link to={supportLink} className="text-primary hover:underline font-medium">
                Contact support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}