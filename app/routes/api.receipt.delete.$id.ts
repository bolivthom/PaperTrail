import { ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("Enter Method Loader Delete receipt ");
  const { id } = params;
  const current_user = "302374e2-06c9-4197-ae7d-f06a3143bbf0";

  if (!current_user) {
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

  // Check if method is PUT
  if (request.method !== "DELETE") {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Method not allowed.",
        data: [],
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  try {
    const existingReceipt = await prisma.receipt.findFirst({
      where: {
        id: id,
        user_id: current_user,
      },
    });

    if (!existingReceipt) {
      return new Response(JSON.stringify({
        state: "failure",
        message: "Receipt not found.",
        data: [],
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    // Delete the receipt
    // Due to the onDelete: Cascade in the relation, this will also delete related records
    await prisma.receipt.delete({
      where: {
        id: id,
      },
    });

    // Return success response
    return new Response(
      JSON.stringify({
        state: "succcess",
        message: "Receipt deleted successfully",
        data: [],
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
