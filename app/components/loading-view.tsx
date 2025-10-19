// import type { MetaFunction } from "@remix-run/node";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Spinner } from "./ui/spinner";

interface LoadingLayoutProps {
  title: string;
  description?: string;
}

export default function LoadingView({ title, description}: LoadingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col gap-6 items-center justify-center bg-background text-foreground px-4">
         {/* Logo */}
            <img alt="" src={'https://cdn.rfitzy.net/3d027a53d02c/files/applogo_63928119579192691.svg'} className="w-32 h-auto" />
      <Card className="w-full max-w-sm border border-border shadow-sm rounded-2xl bg-card bg-[#FBFBFF]">
                
                {/* Header */}
                <CardHeader className="text-center ">
                    <CardTitle className="text-xl font-semibold text-foreground">
                        {title}
                    </CardTitle>
                </CardHeader>

                {/* Content */}
                <CardContent className="flex items-center justify-center">
                    <Spinner className="size-8" />
                </CardContent>

                <CardFooter className=" items-center justify-center">
                     <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                </CardFooter>
            </Card>
    </div>
  );
}
