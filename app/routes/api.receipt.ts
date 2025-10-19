import { data, type ActionFunctionArgs } from "@remix-run/node";
import { client, extractImageData } from "../openai.server";
import { getUserFromRequest } from "~/lib/user";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get("image");

  const { user } = await getUserFromRequest(request);

  if (!file || !(file instanceof File)) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "No file submitted",
        data: [],
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  const result = await extractImageData(file);

  console.log(result);
}
