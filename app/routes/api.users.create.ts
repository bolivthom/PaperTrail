import { ActionFunctionArgs } from "@remix-run/node";
import { sendMagicLink } from "~/lib/auth";
import { createUser } from "~/lib/user";

export function loader() {
    return {
        status: 200,
        message: "OK",
    };
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


    const response = await createUser({ email, first_name, last_name });
    
    return new Response(JSON.stringify(response), {
                status: response.status == 'success' ? 200 : 422,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

}