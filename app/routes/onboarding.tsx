import UserInfoForm from "~/components/user-infoform";
// import UserAuthForm from "./user-authform";
// import { Link } from "@remix-run/react";
import AppLogo from "/AppLogo.svg";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export default function OnboardingPage() {

    return (
        <div className="flex min-h-screen flex-col gap-6 items-center justify-center bg-background text-foreground px-4">
            {/* Logo */}
            <img src={AppLogo}  className="w-32 h-auto" />

            <Card className="w-full max-w-sm border border-border shadow-sm rounded-2xl bg-card">
                {/* Header */}
                <CardHeader className="text-center ">

                    <CardTitle className="text-xl font-semibold text-foreground">
                        Welcome! What’s your name?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        This helps us personalize your experience.
                    </p>
                </CardHeader>

                {/* Content */}
                <CardContent>
                    <UserInfoForm />
                </CardContent>
            </Card>
        </div>
    );
}
