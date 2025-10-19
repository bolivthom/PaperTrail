import { data, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getUserFromRequest } from "~/lib/user";

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("Enter Method Loader Update receipt ");
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
  // Check if method is PUT
  if (request.method !== "PUT") {
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
    const body = await request.json();

    // Check if receipt exists and belongs to user
    const existingReceipt = await prisma.receipt.findFirst({
      where: {
        id: id,
        user_id: user.id,
      },
    });

    if (!existingReceipt) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "Receipt Not Found.",
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

    // Allowed fields for update
    if (body.company_name !== undefined) {
      if (
        typeof body.company_name !== "string" ||
        body.company_name.trim().length === 0
      ) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Company Name is needed.",
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
      updateData.company_name = body.company_name.trim();
    }

    if (body.company_address !== undefined) {
      updateData.company_address = body.company_address
        ? body.company_address.trim()
        : null;
    }

    if (body.sub_total !== undefined) {
      const subTotal = parseFloat(body.sub_total);
      if (isNaN(subTotal) || subTotal < 0) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Sub total must be a valid positive number.",
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
      updateData.sub_total = subTotal;
    }

    if (body.tax_amount !== undefined) {
      const taxAmount = parseFloat(body.tax_amount);
      if (isNaN(taxAmount) || taxAmount < 0) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "tax amount must be a valid positive number.",
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
      updateData.tax_amount = taxAmount;
    }

    if (body.total_amount !== undefined) {
      const totalAmount = parseFloat(body.total_amount);
      if (isNaN(totalAmount) || totalAmount < 0) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "total amount must be a valid positive number.",
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
      updateData.total_amount = totalAmount;
    }

    if (body.currency !== undefined) {
      if (
        typeof body.currency !== "string" ||
        body.currency.trim().length === 0
      ) {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Currency must be a non empty string.",
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
      updateData.currency = body.currency.trim().toUpperCase();
    }

    if (body.category_id !== undefined) {
      if (body.category_id === null) {
        updateData.category_id = null;
      } else if (
        typeof body.category_id === "string" &&
        body.category_id.trim().length > 0
      ) {
        // Verify category exists if provided
        const category = await prisma.category.findFirst({
          where: {
            id: body.category_id,
            user_id: user.id, // Ensure category belongs to user
          },
        });

        if (!category) {
          return new Response(
            JSON.stringify({
              state: "failure",
              message: "Category Not Found.",
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
        updateData.category_id = body.category_id;
      } else {
        return new Response(
          JSON.stringify({
            state: "failure",
            message: "Invalid Category.",
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
    }

    // Check if no valid fields were provided
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No Editable fields found.",
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

    const updatedReceipt = await prisma.receipt.update({
      where: {
        id: id,
      },
      data: updateData,
      include: {
        category: true,
      },
    });

    return new Response(
      JSON.stringify({
        state: "success",
        message: "Reciept successfully updated.",
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
