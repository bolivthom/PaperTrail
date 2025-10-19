import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "~/prisma.server";
import { getUserFromRequest } from "~/lib/user";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "category id is needed.",
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

  if (request.method !== "PUT") {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "method not allowed.",
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

  //   const { user } = await getUserFromRequest(request);

  const user = {
    id: "7b4f24d6-2e05-43fe-9531-18e051320b40", // Mock UUID
    email: "test@example.com",
    name: "Test User",
    first_name: "Test",
    last_name: "User",
  };

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
    // Parse request body
    const body = await request.json();

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
          message: "category not found.",
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

    const updateData: any = {};

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Name is required.",
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
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        body.description.trim().length === 0
      ) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Name is required.",
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
      updateData.description = body.description.trim();
    }

    // Check if no valid fields were provided
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No valid fields to update.",
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

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: updateData.name,
          user_id: user.id,
          NOT: {
            id: id, // Exclude current category
          },
        },
      });

      if (duplicateCategory) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "a category with this name already exists.",
            data: [],
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
    });

    return new Response(
      JSON.stringify({
        state: "success",
        message: "category updated.",
        data: updatedCategory,
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
