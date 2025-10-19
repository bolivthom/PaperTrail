// app/routes/logout.tsx
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const res = await auth.api.signOut({
    headers: request.headers, 
    asResponse: true
  });

  return redirect("/", {
    headers: {
      "Set-Cookie": res.headers.get("set-cookie") ?? ""
    }
  });
}

export const loader = () => redirect("/");
