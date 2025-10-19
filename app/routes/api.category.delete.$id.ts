import { ActionFunctionArgs } from "@remix-run/node";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;

  // Validate category ID
  if (!id) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Category ID is required.",
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

  // Check if method is DELETE
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

  // Get the currently logged in user
    const { user } = await getUserFromRequest(request);

  if (!user) {
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
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        user_id: user.id,
      },
    });

    if (!existingCategory) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "Category not found.",
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

    // Delete the category
    await prisma.category.delete({
      where: {
        id: id,
      },
    });

    // Return success response
    return new Response(
      JSON.stringify({
        state: "success",
        message: "Category deleted successfully.",
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
