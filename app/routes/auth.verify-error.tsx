import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "@remix-run/react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface VerifyErrorPageProps {
  errorType?: "expired" | "invalid" | "server";
  message?: string;
}

export default function VerifyErrorPage({ 
  errorType = "expired",
  message 
}: VerifyErrorPageProps) {
  const errorContent = {
    expired: {
      title: "Link expired",
      description: "This magic link has expired. Magic links are valid for 15 minutes for security reasons.",
    },
    invalid: {
      title: "Invalid link",
      description: "This magic link is invalid or has already been used. Please request a new one.",
    },
    server: {
      title: "Something went wrong",
      description: "We encountered an error while verifying your link. Please try again.",
    }
  };

  const content = errorContent[errorType];

  return (
    <div className="flex min-h-screen flex-col gap-6 items-center justify-center bg-background text-foreground px-4">
      {/* Logo */}
      <img src={'https://cdn.rfitzy.net/3d027a53d02c/files/applogo_63928119579192691.svg'} className="w-32 h-auto" alt="App Logo" />

      <Card className="w-full max-w-sm border border-border shadow-sm rounded-2xl bg-card">
        {/* Header */}
        <CardHeader className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>

          <CardTitle className="text-xl font-semibold text-foreground">
            {content.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {message || content.description}
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-3">
          <Link to="/">
            <Button className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Request new link
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </Link>

          {/* Help Link */}
          <div className="pt-2 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link to="/support" className="text-primary hover:underline font-medium">
              Contact support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}