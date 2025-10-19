import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import UserAuthForm from "./user-authform";
import { Link } from "@remix-run/react";

export default function LoginPage() {

    return (
        <div className="flex min-h-screen flex-col gap-6 items-center justify-center bg-background text-foreground px-4">
            {/* Logo */}
            <img src={'https://cdn.rfitzy.net/3d027a53d02c/files/applogo_63928119579192691.svg'}  className="w-32 h-auto" />

            <Card className="w-full max-w-sm border border-border shadow-sm rounded-2xl bg-card">
                {/* Header */}
                <CardHeader className="text-center ">

                    <CardTitle className="text-xl font-semibold text-foreground">
                        Sign in to continue
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Receive a magic link to your email to access your account
                    </p>
                </CardHeader>

                {/* Content */}
                <CardContent>
                    <UserAuthForm />
                </CardContent>
            </Card>

            {/* Privacy Policy */}
            <div className="text-center text-xs text-muted-foreground">
                By continuing, you agree to PaperTrail’s{" "}
                <Link to="#" className="underline hover:text-foreground">
                    Terms
                </Link>{" "}
                &{" "}
                <Link to="#" className="underline hover:text-foreground">
                    Privacy Policy
                </Link>
                .
            </div>
        </div>
    );
}
