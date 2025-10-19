import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { sendMagicLink } from "~/lib/auth";
import { redisClient } from "~/redis.server";

export async function loader({ request }: LoaderFunctionArgs) {
    return {};
    
}

export async function action({ request }: ActionFunctionArgs) {
    const { email, first_name, last_name } = await request.json();
    
    if (!email || !first_name || !last_name) {
         return new Response(JSON.stringify({ status: 'error', message: "Email, first name and last name are required",}), {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
    }

    redisClient.set(`magiclink:email:${email}`, JSON.stringify({ first_name, last_name }), 'EX', 300); // 5 minutes expiry

    const response = await sendMagicLink(email, request);

    return new Response(JSON.stringify(response), {
                status: response.status == 'success' ? 200 : 422,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

}