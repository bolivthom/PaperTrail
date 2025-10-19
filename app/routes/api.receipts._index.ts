import { Receipt } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/prisma.server";
import { getUserFromRequest } from "~/lib/user";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("Enter Method Loader [GET] api/receipts");
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const category = url.searchParams.get("category");
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

  try {
    const whereClause: any = {
      user_id: user.id,
    };

    if (category) {
      whereClause.category = {
        name: category,
      };
    }
    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      orderBy: { purchase_date: "desc" },
    });

    const response = await formatResponse(receipts);

    console.log("Exit Method Loader.");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
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

async function formatResponse(data: Array<Receipt>) {
  return {
    state: "ok",
    message: "list of receipts",
    data: data,
  };
}
