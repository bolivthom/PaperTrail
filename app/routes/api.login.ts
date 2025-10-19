import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { auth } from "../auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();

  if (!email) return json({ error: "Email is required" }, { status: 400 });

  // Call Better Auth server endpoint; it will invoke sendMagicLink() above
  await auth.api.signInMagicLink({
    body: {
      email,
      // after successful verification, Better Auth will redirect here
      callbackURL: "/dashboard",
      newUserCallbackURL: "/dashboard",
      errorCallbackURL: "/login?error=magic",
    },
    // headers optional, but useful (IP, UA); Remix gives us the Request
    headers: request.headers,
  });

  // Show a confirmation page (no client JS needed)
  return redirect(`/login/check-email?to=${encodeURIComponent(email)}`);
}