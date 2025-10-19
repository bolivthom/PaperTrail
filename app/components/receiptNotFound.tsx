import { Link } from "@remix-run/react";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ReceiptNotFound() {
  return (
    <div className="flex min-h-screen justify-center bg-background text-foreground mt-20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-9xl font-bold text-muted-foreground/20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileQuestion className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Receipt not found
          </h1>
          <p className="text-lg text-muted-foreground">
            The receipt you're looking for doesn't exist or may have been deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/receipts">
            <Button variant="default" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to receipts
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Go to dashboard
            </Button>
          </Link>
        </div>

        {/* Help Link */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link to="#" className="text-primary hover:underline font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}