import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/prisma.server";
import { getUserFromRequest } from "~/lib/user";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("Enter Method Loader [GET] api/categories");
  // const { user } = await getUserFromRequest(request);
  const user = {
    id: "7b4f24d6-2e05-43fe-9531-18e051320b40", // Mock UUID
    email: "test@example.com",
    name: "Test User",
    first_name: "Test",
    last_name: "User",
  };

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
    const categories = await prisma.category.findMany({
      where: {
        user_id: user.id,
      },
    });

    console.log("Exit Method Loader.");
    return new Response(
      JSON.stringify({
        state: "success",
        message: "categories.",
        data: categories,
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
