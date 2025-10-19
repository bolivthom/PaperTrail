import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getUserFromRequest } from "~/lib/user";

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log("Enter Method Loader [GET] api/receipts");
  const { id } = params;
  const { user } = await getUserFromRequest(request);

  if (!user) {
    console.log("caller is not currently logged in.");
    console.log("Exit Method Loader.");
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "you are not currently logged in.",
        data: [],
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  if (!id) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "ID not supplied.",
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

  try {
    const receipt = await prisma.receipt.findFirst({
      where: { 
        id: id,
        user_id: user.id,
       },
    });

    if (!receipt) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "Not Found",
          data: [],
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        state: "ok",
        message: "Receipt",
        data: receipt,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        state: "failure",
        message: error,
        data: [],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}
