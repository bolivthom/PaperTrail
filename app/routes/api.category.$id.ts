import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
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
    // Query the specific category from database
    const category = await prisma.category.findFirst({
      where: {
        id: id,
        user_id: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Check if category was found
    if (!category) {
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

    return new Response(
      JSON.stringify({
        state: "success",
        message: "Category retrieved successfully.",
        data: category,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching category:", error);
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
