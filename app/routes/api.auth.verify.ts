import {  LoaderFunctionArgs } from "@remix-run/node";
import { verifyMagicLink } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const code = url.searchParams.get("code");

    if (!email || !code) {

    return new Response(JSON.stringify({ status: 'error', message: "Email and code are required",}), {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
    }

    const response = await verifyMagicLink(email, code);

    return new Response(JSON.stringify(response), {
                status: response.status == 'success' ? 200 : 422,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
}
