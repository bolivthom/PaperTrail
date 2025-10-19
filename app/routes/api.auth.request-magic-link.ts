import { ActionFunctionArgs } from "@remix-run/node";
import { sendMagicLink } from "~/lib/auth";

export function loader() {
    return {
        status: 200,
        message: "OK",
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const { email } = await request.json();
    if (!email) {
         return new Response(JSON.stringify({ status: 'error', message: "Email isrequired",}), {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
    }

    const response = await sendMagicLink(email, request);

    return new Response(JSON.stringify(response), {
                status: response.status == 'success' ? 200 : 422,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

}