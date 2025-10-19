import {  LoaderFunctionArgs } from "@remix-run/node";
import { getUserBySession } from "~/lib/user";

export async function loader({ request }: LoaderFunctionArgs) {

    const user = await getUserBySession(request.headers.get("session-id") || '');
    return new Response(JSON.stringify(user), {
                status: user.status == 'success' ? 200 : 422,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
}
