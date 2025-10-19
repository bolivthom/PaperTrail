import {  LoaderFunctionArgs, redirect } from "@remix-run/node";
import { verifyMagicLink } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) return redirect("/login?error=missing_token");
    const verificationResponse = await verifyMagicLink(token, request);
    let response;
    if( verificationResponse.status === 'success') {
        response = redirect('/dashboard');
        const setCookie = verificationResponse.headers?.get("set-cookie");
        if (setCookie) response.headers.append("Set-Cookie", setCookie);
    } else {
        response = redirect('/login?error=email_not_verified');
    }
    // Forward Better Auth's set-cookie header so the session is established
    return response;
}

