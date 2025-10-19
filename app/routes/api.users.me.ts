import {  LoaderFunctionArgs } from "@remix-run/node";
import { getUserFromRequest } from "~/lib/user";

export async function loader({ request }: LoaderFunctionArgs) {
    const response = getUserFromRequest(request);
    return response;
}
