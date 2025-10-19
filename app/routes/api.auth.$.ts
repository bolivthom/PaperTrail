import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { auth } from "../auth.server";

// Delegate both GET and POST to Better Auth (sets/reads cookies server-side)
export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}
export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request);
}
