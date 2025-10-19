import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link, useSearchParams } from "@remix-run/react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";


export default function VerifyPage() {

  const [params, setParams] = useSearchParams();
  const email = decodeURIComponent(params.get("email") || "");

  const handleResendLink = () => {
    // Implement resend link functionality here
    fetch('/api/auth/request-magic-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.reload();
        // Optionally, show a success message to the user
    })
    .catch((error) => {
        console.error('Error:', error);
        // Optionally, show an error message to the user
    });
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 items-center justify-center bg-background text-foreground px-4">
      {/* Logo */}
      <img src={'/public/AppLogo.svg'} className="w-32 h-auto" alt="App Logo" />

      <Card className="w-full max-w-sm border border-border shadow-sm rounded-2xl bg-card">
        {/* Header */}
        <CardHeader className="text-center">
          {/* Email Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>

          <CardTitle className="text-xl font-semibold text-foreground">
            Check your email
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We've sent a magic link to your email address. Click the link to sign in to your account.
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <button onClick={handleResendLink} className="text-primary hover:underline font-medium">
              Resend link
            </button>
          </div>

          <Link to="/auth/login">
            <Button variant="outline" className="w-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}