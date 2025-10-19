import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "~/prisma.server";
import { getUserFromRequest } from "~/lib/user";

export async function action({ request }: ActionFunctionArgs) {
  console.log("Enter Method Loader [POST] api/category");

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
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

    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim().length === 0
    ) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "Name is required and must be a non-empty string",
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

    // Check if category with same name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: body.name.trim(),
        user_id: user.id,
      },
    });

    if (existingCategory) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "A category with this name already exists",
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

    if (!body.description) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No Description provided",
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

    // Prepare category data
    const categoryData = {
      name: body.name.trim(),
      description: body.description,
      user_id: user.id,
    };

    // Create the category
    const newCategory = await prisma.category.create({
      data: categoryData,
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Return 201 Created with the new category
    return new Response(
      JSON.stringify({
        state: "success",
        message: "category created",
        data: newCategory,
      }),
      {
        status: 201,
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
